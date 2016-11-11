
"use strict";

// packages
var fs = require('fs');
var _ = require('lodash');
var config = require('../config').redis;
var redishost = process.env.REDIS_HOST || config.host;
var redisport = config.port;
var redisencryptionKey = config.encryptionKey;
var scopeConfig = require('../../../env/scopesRoles');
var redisDevRequest = config.devRequest;
var redisAppRequest = config.appRequest;

var parameters = {
  REDISHOST: redishost,
  REDISPORT: redisport,
  DEVFIRSTNAME: redisDevRequest.firstName,
  DEVLASTNAME: redisDevRequest.lastName,
  DEVEMAIL: redisDevRequest.email,
  DEVUSERNAME: redisDevRequest.userName,
  DEVSCOPES: scopeConfig.scopes,
  APPNAME: redisAppRequest.name,
  APPSCOPES: scopeConfig.scopes,
  ENCRYPTIONKEY: redisencryptionKey,
  SCOPES: scopeConfig.scopes.split(" ")
};

module.exports = {

  setSwaggerOptions: setSwaggerOptions,
  pickParams: pickParams,
  isSuper: isSuper
};

function isSuper(token) {
  return _.has(token, 'attributes.roles') && _.includes(token.attributes.roles, 'super');
}

function pickParams(req) {

  if (!!req.body) {

    var body = req.body;

    var parameters = req.swagger.operation.parameters;

    if (!!parameters) {
      var bodyParam = _.find(parameters, function(parameter) {
        return parameter.in == 'body';
      });

      if (!!bodyParam && !!bodyParam.schema) {

        var schema = bodyParam.schema;

        if (!!schema.properties) {

          return _.pick(body, _.keys(schema.properties));
        } else {

          if (!!schema.items) {
            var items = schema.items;

            if (!!items.properties) {
              return _.map(body, function mapParam(elem) {
                return _.pick(elem, _.keys(items.properties));
              });
            }
          } else {

            if (_.isArray(body)) {
              return body;
            }
          }
        }
      }

    }
  }
}

function setSwaggerOptions() {

  var swaggerOptionsTemplate;
  try {
    swaggerOptionsTemplate = _.template(fs.readFileSync(__dirname + '/../../swagger/swagger_template.yaml', 'utf8'));

  } catch (e) {
    process.kill();
  }

  fs.writeFileSync(__dirname + '/../../swagger/swagger.yaml', swaggerOptionsTemplate(parameters));

}