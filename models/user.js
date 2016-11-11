"use strict";
var bcrypt = require('bcrypt');
var promise = require('bluebird');
promise.promisifyAll(bcrypt);

module.exports = function(sequelize, DataTypes) {

  var User = sequelize.define('User', {
    firstName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.User.belongsToMany(models.Role, { through: models.UserRole });
      }
    },
    hooks: {
      beforeCreate: function(user, options) {
        return bcrypt.hashAsync(user.password, 10).then(function(hash) {
          user.password = hash;
          return [user, options];
        });
      },
      beforeUpdate: function(user, options) {
        return bcrypt.hashAsync(user.password, 10).then(function(hash) {
          user.password = hash;
          return [user, options];
        });
      },
    }
  });

  return User;
};