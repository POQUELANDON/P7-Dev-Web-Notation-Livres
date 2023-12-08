const express = require('express');
const router = express.Router();
const { authLimiter, bookLimiter } = require('../middleware/rate-limit');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBook);
router.get('/bestrating', bookCtrl.getBestRatingBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', bookLimiter, auth, multer, bookCtrl.createBook);
router.put('/:id', bookLimiter, auth, multer, bookCtrl.modifyBook);
router.delete('/:id', bookLimiter, auth, bookCtrl.deleteBook);
router.post('/:id/rating', bookLimiter, auth, bookCtrl.rateBook);

module.exports = router;