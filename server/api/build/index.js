'use strict';

var express = require('express');
var controller = require('./build.controller');

var router = express.Router();

router.get('/', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);

module.exports = router;
