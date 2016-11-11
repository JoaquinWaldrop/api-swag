'use strict';

var util = require('util');
var oauth = require('../helpers/oauth/');
var errorHandler = require('../helpers/error-handler/');
var user = require(__dirname + '/../../models/').User;
var moment = require('moment');

module.exports = {
  login: login,
  verifyToken: verifyToken,
  refreshToken: refreshToken
};

function refreshToken(req, res, next) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  var token = req.body.refresh_token;

  oauth.refreshToken(token)
    .then(function(){
      res.json(data);
    })
    .catch(errorHandler(res, next));
}

function verifyToken(req, res, next) {

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  var accessToken = req.headers.authorization;
  var scopes = req.query.scopes;

  oauth.verifyToken(accessToken, scopes || '')
    .then(function(){
      res.json(data);
    })
    .catch(errorHandler(res, next));
}

function login(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;

  oauth.login(email, password)
    .then((result)=>{      

      const opts = {
        where: {id: result.attributes.id}
      };

      user.find(opts)
      .then((singleUser)=>{ 
        return singleUser;
      })
      .catch((err)=>{console.log("ERROR: ",err)});;

      return result;
      
    })
    .then(function(data){
      res.json(data);
    })
    .catch(errorHandler(res, next));
}