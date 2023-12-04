const jwt = require('jsonwebtoken'); // Importation du package jsonwebtoken pour gérer les tokens JWT

module.exports = (req, res, next) => { // Exportation d'un middleware
    try {
        const token = req.headers.authorization.split(' ')[1]; // Extraction du token du header d'autorisation de la requête
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Vérification du token
        const userId = decodedToken.userId; // Extraction de l'ID utilisateur du token
        if (req.body.userId && req.body.userId !== userId) { // Si un ID utilisateur est fourni dans le corps de la requête et qu'il ne correspond pas à l'ID utilisateur du token
            throw 'Invalid user ID'; // Lance une erreur
        } else {
            req.auth = { // Ajoute l'ID utilisateur à l'objet de requête
                userId: userId
            };
            next(); // Passe au middleware suivant
        }
    } catch (error) {
        res.status(401).json({ error }); // En cas d'erreur, renvoie une réponse avec le statut 401 et l'erreur
    }
};