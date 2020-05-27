const express = require('express');
const router = express.Router();

const {index, show} = require("../controllers/book_controller");

// GET /
router.get('/', index);

// // POST /
// router.post('/', store);

// GET /:bookId
router.get('/:bookId', show);

// // PUT /:bookId
// router.put('/:bookId', update);

// // DELETE /:bookId
// router.delete('/:bookId', destroy);



module.exports = router;
