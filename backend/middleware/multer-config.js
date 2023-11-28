const multer = require('multer');
//dictionnaire des extensions fichiers
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};
//enregistrer les fichiers dans le dossier images.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    //nom de fichier unique et extension de fichier appropriée.
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});
//capture uniquement les téléchargements de fichiers image.
module.exports = multer({ storage: storage }).single('image');