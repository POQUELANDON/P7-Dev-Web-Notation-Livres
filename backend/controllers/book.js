const Book = require('../models/book'); // Importation du modèle de livre
const fs = require('fs'); // Importation du module fs de Node.js pour interagir avec le système de fichiers
const sharp = require('sharp'); // Importation du package sharp pour manipuler les images
// Validation des entrées d'un livre
function validateInput(input, type) {
    // Expression régulière pour valider les entrées sans caractères spéciaux
    const regex = /^[a-zA-Z0-9\séèàùâêîôûëïöüçÉÈÀÙÂÊÎÔÛËÏÖÜÇ&]*$/;
    switch (type) {
        case 'title':
            // Vérifie que l'entrée est une chaîne de caractères et ne contient pas de caractères spéciaux
            return typeof input === 'string' && regex.test(input) && input !== undefined;
        case 'author':
            return typeof input === 'string' && regex.test(input) && input !== undefined;
        case 'genre':
            return typeof input === 'string' && regex.test(input) && input !== undefined;
        case 'imageUrl':
            return typeof input !== undefined;
        case 'year':
            // Vérifie que l'entrée est une chaîne de caractères représentant une année valide
            const year = parseInt(input);
            return !isNaN(year) && year > 0 && year <= new Date().getFullYear();
        default:
            return false;
    }
}
exports.createBook = (req, res, next) => {
    // Contrôleur pour la création de livres
    const bookObject = JSON.parse(req.body.book); // Parse le corps de la requête en JSON
    console.log(bookObject);
    if (!validateInput(bookObject.title, 'title') ||
        !validateInput(bookObject.author, 'author') ||
        !validateInput(bookObject.year, 'year') ||
        !validateInput(bookObject.genre, 'genre') ||
        !validateInput(bookObject.imageUrl, 'imageUrl')) {
        return;
    }
    delete bookObject._id; // Supprime l'_id du corps de la requête
    delete bookObject._userId; // Supprime le _userId du corps de la requête
    const book = new Book({ // Crée un nouveau livre avec les données de la requête
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}.webp`,
        averageRating: 0, // Initialise la note moyenne du livre à 0
        ratings: [] // Initialise le tableau des notes avec un tableau vide
    });

    // Redimensionne l'image, la convertit en webp et supprime l'image originale
    sharp(req.file.path)
        .resize(700)
        .webp({ quality: 60 })
        .toFile(`images/${req.file.filename}.webp`, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Image resized and converted to webp successfully');
                fs.unlink(req.file.path, err => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Original image deleted successfully');
                    }
                });
            }
        });
    // Enregistre le livre dans la base de données
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

// Contrôleur pour la modification de livres
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? { // Si un fichier est fourni dans la requête
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}.webp`
    } : { ...req.body }; // Sinon, utilise le corps de la requête tel quel
    if (!validateInput(bookObject.title, 'title') ||
        !validateInput(bookObject.author, 'author') ||
        !validateInput(bookObject.year, 'year') ||
        !validateInput(bookObject.genre, 'genre') ||
        !validateInput(bookObject.imageUrl, 'imageUrl')) {
        return;
    }
    delete bookObject._userId; // Supprime le _userId du corps de la requête
    Book.findOne({ _id: req.params.id }) // Trouve le livre avec l'_id fourni
        .then((book) => {
            if (book.userId != req.auth.userId) { // Si l'ID utilisateur du livre ne correspond pas à l'ID utilisateur de la requête
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                if (req.file) { // Si un fichier est fourni dans la requête
                    const filename = book.imageUrl.split('/images/')[1]; // Récupère le nom du fichier de l'image du livre
                    fs.unlink(`images/${filename}`, (err) => { // Supprime l'image originale
                        if (err) throw err;
                        console.log('Image successfully deleted');
                    });
                    // Redimensionne l'image, la convertit en webp et supprime l'image originale
                    sharp(req.file.path)
                        .resize(700)
                        .webp({ quality: 60 })
                        .toFile(`images/${req.file.filename}.webp`, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Image resized and converted to webp successfully');
                                fs.unlink(req.file.path, err => {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log('Original image deleted successfully');
                                    }
                                });
                            }
                        });
                }
                // Met à jour le livre dans la base de données
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};
// Contrôleur pour la suppression de livres
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id }) // Trouve le livre avec l'_id fourni
        .then((book) => {
            if (book.userId != req.auth.userId) { // Si l'ID utilisateur du livre ne correspond pas à l'ID utilisateur de la requête
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                const filename = book.imageUrl.split('/images/')[1]; // Récupère le nom du fichier de l'image du livre
                fs.unlink(`images/${filename}`, () => { // Supprime l'image
                    Book.deleteOne({ _id: req.params.id }) // Supprime le livre de la base de données
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Contrôleur pour obtenir un livre spécifique
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id }) // Trouve le livre avec l'_id fourni
        .then(book => res.status(200).json(book)) // Renvoie le livre
        .catch(error => res.status(404).json({ error })); // Gère les erreurs
};

// Contrôleur pour noter un livre
exports.rateBook = (req, res, next) => {
    const userId = req.body.userId; // Récupère l'ID utilisateur de la requête
    const grade = parseInt(req.body.grade); // Assure que la note est un entier
    // Vérifie si l'ID utilisateur et la note sont fournis et si la note est comprise entre 0 et 5
    if (!userId || !grade || grade < 0 || grade > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
    }
    Book.findOne({ _id: req.params.id }) // Trouve le livre avec l'_id fourni
        .then(book => {
            // Vérifie si l'utilisateur a déjà noté le livre
            const userGrade = book.ratings.find(r => r.userId === userId);
            if (userGrade) {
                return res.status(400).json({ error: 'Un utilisateur ne peut pas noter deux fois le même livre.' });
            }
            // Ajoute la nouvelle note et met à jour la note moyenne
            book.ratings.push({ userId, grade });
            const totalGrade = book.ratings.reduce((total, r) => total + r.grade, 0);
            book.averageRating = book.ratings.length > 0 ? totalGrade / book.ratings.length : 0;
            // Sauvegarde le livre mis à jour
            book.save()
                .then(book => res.status(200).json(book))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ error }));
};

// Contrôleur pour obtenir les livres avec la meilleure note
exports.getBestRatingBook = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3) // Trouve les 3 livres avec la meilleure note
        .then(books => res.status(200).json(books)) // Renvoie les livres
        .catch(error => res.status(400).json({ error })); // Gère les erreurs
};

// Contrôleur pour obtenir tous les livres
exports.getAllBook = (req, res, next) => {
    Book.find() // Trouve tous les livres
        .then(books => res.status(200).json(books)) // Renvoie les livres
        .catch(error => res.status(400).json({ error })); // Gère les erreurs
};