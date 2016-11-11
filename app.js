'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var models = require("./models");
var initSwagger = require('./api/helpers/commons');
var fs = require('fs');
var promise = require('bluebird');
var initRedis = require('./init-redis.js');
var mandrill = require('mandrill-api/mandrill');
var nunjucks = require('nunjucks');
var mandrill_client = new mandrill.Mandrill('32D11MbxJD0K-hJg6W09GQ');
var env = process.env.NODE_ENV;
var config = {
  appRoot: __dirname // required config
};

app.locals.env = env;

app.get('/', function (req, res) {

	var name = req.query.name;
	mandrill_client.templates.info({"name": name}, function(result) {
		var text = result.code;
		var file = './templates/'+result.name+'.html';
		fs.writeFile(file, text, function(err) {
			if( err ){
				console.log( err );
			}
			else{
				var text1 = nunjucks.render(__dirname + '/templates/' + name + ".html", {firstName: "Joaquin", lastName: "Molina"});
				res.send(text1);
			}
		});
	}, function(e) {
		var text1 = nunjucks.render(__dirname + '/templates/application.html', {firstName: "Joaquin", lastName: "Molina"});
		res.send(text1);
	});

});

app.get('/all', function (req, res) {

	mandrill_client.templates.list({}, function(result) {
		for (var i = result.length - 1; i >= 0; i--) {
			var name = result[i].name;
			console.log(name);
			var text = result[i].code;
			var file = './templates/'+result[i].name+'.html';
			fs.writeFile(file, text, function(err) {
				if( err ){
					console.log( err );
				}
				else{
					var text1 = nunjucks.render(__dirname + '/templates/' + name + ".html", {firstName: "Joaquin", lastName: "Molina"});
				}
			});
		}
		res.send("Todo bien");
	}, function(e) {
		var text1 = nunjucks.render(__dirname + '/templates/application.html', {firstName: "Joaquin", lastName: "Molina"});
		res.send("Todo mal");
	});

});

initSwagger.setSwaggerOptions();

promise.promisifyAll(SwaggerExpress);

module.exports = initRedis.InitRedis().then(function() {
	return SwaggerExpress.createAsync(config).then( function(swaggerExpress) {

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 7500;

  models.sequelize.sync().then(function () {
  	var server = app.listen(port, function() {
  		console.log('Express server listening on port ' + server.address().port);
  		return app;
  	});
  });
})
});
