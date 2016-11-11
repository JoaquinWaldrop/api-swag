'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var errorHandler = require('../helpers/error-handler/');
var models  = require(__dirname + '/../../models/');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  index: index,
  show: show,
  create: create,
  update: update,
  delete : del
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function index(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  models.User.findAll()
  .then(function(users){
    res.json(users);
  })
  .catch(errorHandler(res, next));
}

function show(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var id = req.swagger.params.id.value;
  models.User.findById(id)
  .then(function(user){
    res.json(user);
  })
  .catch(errorHandler(res, next));
}

function update(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var options = {
    where : {
      id: req.swagger.params.id.value,
    },
    individualHooks: true
  }
  if(validateEmail(req.body.email))
  {
    models.User.update(req.body, options)
    .then(function(result){
      console.log(result[0]);
      if(result[0]) res.json(util.format("User updated successfully"));
      else res.status(400).json(util.format("User doesn't exist"));
    })
    .catch(errorHandler(res, next));
  }
  else
  {
    res.status(400);
    res.json(util.format("Email invalid"));
  }
}

function create(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  if(validateEmail(req.body.email))
  {
    models.User.create(req.body)
    .then(function(user){
      var data = {
        UserId: user.id,
        RoleId: 2
      }
      return models.UserRole.create(data).then(function(result){
        return user;
      });
    })
    .then(function(user){
      res.status(201);
      res.json(user);
    })
    .catch(errorHandler(res, next));
  }
  else
  {
    res.status(400);
    res.json(util.format("Email invalid"));
  }
}

function del(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var id = req.swagger.params.id.value;
  models.User.findById(id)
  .then(function(user){
    return user.destroy();
    
  })
  .then(function(){
    res.json(util.format("User deleted successfully"));
  })
  .catch(errorHandler(res, next));
}