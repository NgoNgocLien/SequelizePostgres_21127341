const express = require('express');
const router = express.Router();
const controller = require('../controllers/blogController');

router.get('/', controller.showList);
router.get('/:id', controller.showDetails);

module.exports = router;