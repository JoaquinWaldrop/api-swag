'use strict';

var debug = require('debug')('oauth');
var bcrypt = require('bcrypt');
var promise = require('bluebird');
var _ = require('lodash');

var user = require(__dirname + '/../../models/').User;
var role = require(__dirname + '/../../models/').Role;
var config = require('../../env/scopesRoles').roles;

promise.promisifyAll(bcrypt);


module.exports = {
  passwordCheck: passwordCheck,
  beforeCreate: beforeCreate
};


function beforeCreate(parsedBody, options, cb) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  if (parsedBody.grant_type === 'password') {

    var username = parsedBody.username;
    var password = parsedBody.password;

    debug('Before create access token');

    debug('Validate user %s password', username);

    var queryOptions = {
      where: {
        email: username
      }, include: [role]
    };

    if (parsedBody.transaction) {
      queryOptions.transaction = parsedBody.transaction;
    }

    user.find(queryOptions).then(function(data) {

      if (data === null) {

        debug('User not found');
        return cb();
      }

      var userRoles = _.pluck(data.Roles, 'roleName');
      var preRoles = _.values(_.pick(config, userRoles));

      parsedBody.scope = _.uniq(_.flatten(preRoles)).join(" ");

      var pw = data.get('password');

      options.attributes = {
        email: username,
        id: data.get('id'),
        roles: userRoles
      };

      bcrypt.compareAsync(password, pw).then(function(check) {
        debug('Password check: %s', check);

        parsedBody.password = check ? true: "password";
        cb();
      });
    }).catch(cb);
  } else {

    options.attributes = parsedBody.attributes;
    cb();
  }
}

function passwordCheck(username, password, cb) {

  cb(null, password === true);
}
