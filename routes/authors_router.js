const express = require('express');
const router = express.Router();

const {index, show} = require("../controllers/author_controller");

// GET /
router.get('/', index);

// // POST /
// router.post('/', store);

// GET /:authorId
router.get('/:authorId', show);

// // PUT /:authorId
// router.put('/:authorId', update);

// // DELETE /:authorId
// router.delete('/:authorId', destroy);



module.exports = router;
