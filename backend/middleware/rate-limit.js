const rateLimit = require('express-rate-limit');

// Configuration de rate limiter pour les routes d'inscription et de connexion
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de temps de 15 minutes
    max: 5, // Limite chaque IP à 5 requêtes par fenêtre de temps
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
});
// Configuration pour les routes de gestion des livres
const bookLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 100, // Limite à 100 requêtes par IP
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
});

module.exports = { authLimiter, bookLimiter };