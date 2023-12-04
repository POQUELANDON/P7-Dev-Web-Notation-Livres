const express = require('express'); // Importation du framework Express.js
const bookRoutes = require('./routes/book'); // Importation des routes pour les livres
const userRoutes = require('./routes/user'); // Importation des routes pour les utilisateurs
const path = require('path'); // Importation du module path de Node.js pour gérer les chemins
const helmet = require('helmet');
require('dotenv').config(); // Appeler dotenv
const mongoose = require('mongoose'); // Importation de Mongoose pour interagir avec MongoDB
// Utilisez des variables d'environnement pour stocker les informations sensibles
const mongoDBUser = process.env.MONGODB_USER;
const mongoDBPass = process.env.MONGODB_PASS;
const mongoDBClust = process.env.MONGODB_CLUSTER
// Connexion à la base de données MongoDB
mongoose.connect(`mongodb+srv://${mongoDBUser}:${mongoDBPass}@${mongoDBClust}/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true // Activez SSL pour la connexion
    })
    .then(() => console.log('Connexion à MongoDB réussie !')) // Affiche un message en cas de succès
    .catch(() => console.log('Connexion à MongoDB échouée !')) // Affiche un message en cas d'échec
const app = express(); // Création de l'application Express
// Intégration de Helmet comme middleware pour sécuriser les en-têtes HTTP
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
// Middleware pour gérer les requêtes cross-origin (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autorise certains en-têtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorise certaines méthodes
    next(); // Passe au middleware suivant
});
app.use(express.json()); // Parse les corps de requête JSON
// Utilisation des routes importées
app.use('/api/books', bookRoutes); // Utilise les routes pour les livres
app.use('/api/auth', userRoutes); // Utilise les routes pour les utilisateurs
app.use('/images', express.static(path.join(__dirname, 'images'))); // Sert les images statiques
module.exports = app; // Exporte l'application pour pouvoir l'utiliser dans d'autres fichiers