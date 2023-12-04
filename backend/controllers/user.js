const bcrypt = require('bcrypt'); // Importation du package bcrypt pour le hachage des mots de passe
const User = require('../models/user'); // Importation du modèle d'utilisateur
const jwt = require('jsonwebtoken'); // Importation du package jsonwebtoken pour gérer les tokens JWT

// Contrôleur pour l'inscription des utilisateurs
exports.signup = (req, res, next) => {
    // Validation de l'adresse e-mail et du mot de passe
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!emailRegex.test(req.body.email) || !passwordRegex.test(req.body.password)) {
        return res.status(400).json({ error: 'Adresse e-mail ou mot de passe invalide.' });
    }
    // Hachage du mot de passe et création de l'utilisateur
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Contrôleur pour la connexion des utilisateurs
exports.login = (req, res, next) => {
    // Validation de l'adresse e-mail et du mot de passe
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!emailRegex.test(req.body.email) || !passwordRegex.test(req.body.password)) {
        return res.status(400).json({ error: 'Adresse e-mail ou mot de passe invalide.' });
    }
    // Vérification des informations d'identification de l'utilisateur et génération d'un token JWT
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};