'use strict';

var express = require('express');
var controller = require('./remove.controller');

var router = express.Router();

router.post('/', controller.destroy);

module.exports = router;
