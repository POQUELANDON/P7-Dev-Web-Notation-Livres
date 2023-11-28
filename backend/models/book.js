const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    //identifiant MongoDB unique de l'utilisateur qui a créé le livre
    userId: { type: String, required: true },
    //titre du livre
    title: { type: String, required: true },
    //auteur du livre
    author: { type: String, required: true },
    //illustration/couverture du livre
    imageUrl: { type: String, required: true },
    //année de publication du livre
    year: { type: Number, required: true },
    //genre du livre
    genre: { type: String, required: true },
    //notes données à un livre
    ratings: [
        {
            //identifiant MongoDB unique de l'utilisateur qui a noté le livre
            userId: { type: String, required: true },
            //note donnée à un livre
            grade: { type: Number, required: true }
        }
    ],
    //note moyenne du livre
    averageRating: { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);