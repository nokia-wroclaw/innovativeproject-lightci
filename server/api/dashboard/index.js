'use strict';

var express = require('express');
var controller = require('./dashboard.controller.js');

var router = express.Router();

router.get('/', controller.index);
router.put('/', controller.destroy);

module.exports = router;
