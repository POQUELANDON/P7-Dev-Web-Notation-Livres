const http = require('http'); // Importation du package HTTP natif de Node.js
const app = require('./app'); // Importation de l'application express
// Fonction pour normaliser le port
const normalizePort = val => {
    const port = parseInt(val, 10); // Essaie de convertir la valeur en nombre
    if (isNaN(port)) { // Si la conversion échoue (la valeur n'est pas un nombre)
        return val; // Retourne la valeur telle quelle
    }
    if (port >= 0) { // Si le port est un nombre positif
        return port; // Retourne le port
    }
    return false; // Sinon, retourne false
};
// Récupération du port à utiliser
const port = normalizePort(process.env.PORT || '4000'); // Utilise le port défini dans les variables d'environnement, sinon utilise le port 4000
app.set('port', port); // Définit le port pour l'application express
// Fonction pour gérer les erreurs
const errorHandler = error => {
    if (error.syscall !== 'listen') { // Si l'erreur ne provient pas d'une tentative d'écoute du serveur
        throw error; // Lance l'erreur
    }
    const address = server.address(); // Récupère l'adresse du serveur
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Crée une chaîne de caractères représentant l'adresse du serveur
    switch (error.code) { // Selon le code de l'erreur
        case 'EACCES': // Si l'erreur est due à des privilèges insuffisants
            console.error(bind + ' requires elevated privileges.'); // Affiche un message d'erreur
            process.exit(1); // Quitte le processus avec un code d'erreur
            break;
        case 'EADDRINUSE': // Si l'erreur est due à une adresse déjà utilisée
            console.error(bind + ' is already in use.'); // Affiche un message d'erreur
            process.exit(1); // Quitte le processus avec un code d'erreur
            break;
        default: // Pour tout autre type d'erreur
            throw error; // Lance l'erreur
    }
};
// Création du serveur HTTP
const server = http.createServer(app); // Crée un serveur HTTP utilisant l'application express
// Gestionnaire d'erreurs
server.on('error', errorHandler); // Ajoute un gestionnaire d'erreurs au serveur
// Démarrage du serveur
server.on('listening', () => { // Lorsque le serveur commence à écouter les requêtes
    const address = server.address(); // Récupère l'adresse du serveur
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // Crée une chaîne de caractères représentant l'adresse du serveur
    console.log('Listening on ' + bind); // Affiche un message indiquant que le serveur écoute les requêtes
});
// Écoute du port
server.listen(port); // Commence à écouter les requêtes sur le port spécifié