'use strict';

// packages
var yaml = require('js-yaml');
var fs = require('fs');
var promise = require('bluebird');
var debug = require('debug')('oauth');

var config = require('../config/').redis;
var volos = require('../volos');

// swagger file
var resource;
debug("Load swagger file");
try {
  resource = yaml.safeLoad(fs.readFileSync('./api/swagger/swagger.yaml', 'utf8'))['x-volos-resources'].OAuth2.options;
} catch (e) {
  debug(e);
  process.kill();
}

// credentials
var credentials;

debug("Load credentials file");
try {
  credentials = yaml.safeLoad(fs.readFileSync('./api/swagger/credential.yaml', 'utf8')).app.credentials;
} catch (e) {
  debug(e);
  process.kill();
}

debug("Set config data");

Object.setPrototypeOf(config, {
  validGrantTypes: resource.validGrantTypes,
  tokenLifetime: resource.tokenLifetime,
  encryptionKey: resource.encryptionKey,
  passwordCheck: volos.passwordCheck,
  beforeCreateToken: volos.beforeCreate
});

debug("Create redis oauth client");

var oauth = require('volos-oauth-redis').create(config);

promise.promisifyAll(oauth);

module.exports = {
  login: login,
  verifyToken: verifyToken,
  refreshToken: refreshToken,
  referenceToken: referenceToken,
  resetPasswordToken: resetPasswordToken,
  applicationToken: applicationToken,
  apiIntegrationToken: apiIntegrationToken,
  disableToken: disableToken
};

function verifyToken(token, scopes) {
  debug("Verify Token %s", token);
  return oauth.verifyTokenAsync(token, scopes);
}

function login(email, password, transaction) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

  debug("Generate access token trough login");
  var request = {
    grant_type: 'password',
    client_id: credentials[0].key,
    client_secret: credentials[0].secret,
    username: email,
    password: password,
    transaction: transaction
  };

  return oauth.generateTokenAsync(request, {});
}

function refreshToken(token) {
  var request = {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    grant_type: 'refresh_token',
    refresh_token: token,
    client_id: credentials[0].key,
    client_secret: credentials[0].secret
  };
  return oauth.refreshTokenAsync(request, {});
}

function referenceToken(data) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

  debug("Generate access token trough client credentials");
  var request = {
    grant_type: 'client_credentials',
    client_id: credentials[0].key,
    client_secret: credentials[0].secret,
    scope: 'reference application',
    attributes: data
  };

  return oauth.generateTokenAsync(request, {});
}

function disableToken(token) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

  debug("disable token");
  var request = {
    client_id: credentials[0].key,
    client_secret: credentials[0].secret,
    token: token,
    grant_type: 'client_credentials'
  };

  return oauth.generateTokenAsync(request, {});
}

function resetPasswordToken(data) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

  debug("Generate access token trough client credentials");
  var request = {
    grant_type: 'client_credentials',
    client_id: credentials[0].key,
    client_secret: credentials[0].secret,
    scope: 'reset',
    attributes: data
  };

  return oauth.generateTokenAsync(request, {});
}
function applicationToken(data) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

  debug("Generate access token trough client credentials");
  var request = {
    grant_type: 'client_credentials',
    client_id: credentials[0].key,
    client_secret: credentials[0].secret,
    scope: 'application reference',
    attributes: data
  };

  return oauth.generateTokenAsync(request, {});
}

function apiIntegrationToken(oldToken, data) {

  if (oldToken) {
    return disableToken(oldToken).then(newToken);
  }else {
    return newToken();
  }

  function newToken() {
    debug("Generate access token trough client credentials");
    var request = {
      grant_type: 'client_credentials',
      client_id: credentials[0].key,
      client_secret: credentials[0].secret,
      scope: 'integration',
      attributes: data
    };

    return oauth.generateTokenAsync(request, {})
  }
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

}