'use strict';

// packages
var yaml = require('js-yaml');
var fs   = require('fs');
var ManagementProvider = require('volos-management-redis');
var debug = require('debug')('volos-redis-init');
var promise = require('bluebird');
var env = process.env;
var redisConfig = require('./api/helpers/config').redis;
var scopeConfig = require('./env/scopesRoles');

// credential data

module.exports = {
  InitRedis: InitRedis
};

var config = {
  devRequest: redisConfig.devRequest,
  appRequest: redisConfig.appRequest
};

var key = {
  encryptionKey: redisConfig.encryptionKey,
  host: env.REDIS_HOST || redisConfig.host,
  port: redisConfig.port
};
var management = ManagementProvider.create(key);
var credentials = {};

promise.promisifyAll(management);
debug("Check if developer exists");
function InitRedis() {

  return management.getDeveloperAsync(config.devRequest.email)
  .then(function searchDeveloper(developer) {

    debug("Developer already exists");
    credentials.developer = developer;

    debug("Check if app exists");
    return management.getDeveloperAppAsync(config.devRequest.email, config.appRequest.name)
      .then(function searchApp(app) {

        debug("App already exists");
        credentials.app = app;

        return updateApp(app);
      });
  }).catch(function appCreated() {
    return createDev().then(createApp);
  }).then(function writeCred(cred) {
    writeCredentials(cred);
  });

  };

function createDev() {
  return management.createDeveloperAsync(config.devRequest).then(function createDeveloper(developer) {
    debug("Developer created  " + JSON.stringify(developer));
    credentials.developer = developer;

    return developer;
  });
}

function writeCredentials(credentials) {
  fs.writeFile("./api/swagger/credential.yaml", yaml.safeDump(credentials, {skipInvalid: true}), function(err) {
    if (err) {
      return debug(err);
    }
    return true;
    debug("Credential file created");
  });
}

function createApp(developer) {
  var appRequest = {
    developerId: developer.id,
    name: config.appRequest.name,
    scopes: scopeConfig.scopes
  };

  return management.createAppAsync(appRequest).then(function appCreated(app) {
    credentials.app = app;
    debug("App created  " + JSON.stringify(app));

    return credentials;
  });
}

function updateApp(app) {

  app.scopes = scopeConfig.scopes;

  return management.updateAppAsync(app).then(function appCreated(app) {
    credentials.app = app;
    debug("App Updated  " + JSON.stringify(app));

    return credentials;
  });
}