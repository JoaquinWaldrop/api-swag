'use strict';

var env = process.env.NODE_ENV;

var config = require('../../../env/' + (env ? env : "config"));

module.exports = config;