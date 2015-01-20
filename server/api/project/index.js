'use strict';

var express = require('express');
var controller = require('./project.controller.js');

var router = express.Router();

router.get('/', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);

module.exports = router;
