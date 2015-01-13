'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.update);

module.exports = router;
