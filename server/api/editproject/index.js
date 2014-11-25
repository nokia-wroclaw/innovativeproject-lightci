'use strict';

var express = require('express');
var controller = require('./editproject.controller');

var router = express.Router();

router.get('/', controller.show);
router.post('/', controller.update);

module.exports = router;
