const express = require('express');
const router = express.Router();

const { getProfile, getBooks, addBook, updateProfile } = require("../controllers/profile_controller");
const { addBookRules, updateRules } = require('../validation_rules/profile');

// GET /
router.get('/', getProfile);

// GET /
router.get('/books', getBooks);

// POST /
// Add a book to the user's collection
router.post('/books', addBookRules, addBook);

// PUT /
router.put('/', updateRules, updateProfile);




module.exports = router;
