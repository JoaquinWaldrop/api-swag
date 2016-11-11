'use strict';

module.exports = errorFactory;

var sequelizeError = /^Sequelize(.)*$/;
var uniqueError = /^(.)*Unique(.)*$/;

function isSequelizeError(error) {
  return (!!error.name && sequelizeError.test(error.name));
}

function formatSequelizeError(error) {
  if (uniqueError.test(error.name)) {
    error.responseCode = 409;
  }
}

function errorFactory(res, next) {
  return function(err) {
    if (isSequelizeError(err)) {
      formatSequelizeError(err);
    }
    if (!!err.responseCode) {
      res.status(err.responseCode);

      delete err.responseCode;
    }
    next(err);
  };
}