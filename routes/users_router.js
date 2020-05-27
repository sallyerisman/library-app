const express = require('express');
const router = express.Router();

const { index, show, store, update, destroy } = require("../controllers/user_controller");
const { createRules, updateRules } = require('../validation_rules/user');

// GET /
router.get('/', index);

// // POST /
router.post('/', createRules, store);

// GET /:userId
router.get('/:userId', show);

// PUT /:userId
router.put('/:userId', updateRules, update);

// DELETE /:userId
router.delete('/:userId', destroy);



module.exports = router;
