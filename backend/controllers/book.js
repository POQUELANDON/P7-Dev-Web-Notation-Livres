const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sharp(req.file.path)
        .resize(500)
        .toFile(`images/${req.file.filename}`, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Image resized successfully');
            }
        });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                if (req.file) {
                    const filename = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) throw err;
                        console.log('Image successfully deleted');
                    });
                    sharp(req.file.path)
                        .resize(500)
                        .toFile(`images/${req.file.filename}`, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Image resized successfully');
                            }
                        });
                }
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};
exports.getBestRatingBook = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};
exports.rateBook = (req, res, next) => {
    const userId = req.body.userId;
    const rating = req.body.rating;

    // Vérifiez si la note est comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
    }
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifiez si l'utilisateur a déjà noté le livre
            const userRating = book.ratings.find(r => r.userId === userId);
            if (userRating) {
                return res.status(400).json({ error: 'Un utilisateur ne peut pas noter deux fois le même livre.' });
            }
            // Ajoutez la nouvelle note
            book.ratings.push({ userId, rating });
            // Mettez à jour la note moyenne
            const totalRating = book.ratings.reduce((total, r) => total + r.rating, 0);
            book.averageRating = totalRating / book.ratings.length;
            // Sauvegardez le livre mis à jour
            return book.save();
        })
        .then(() => res.status(200).json({ message: 'Note ajoutée avec succès !' }))
        .catch(error => res.status(400).json({ error }));
};
exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};