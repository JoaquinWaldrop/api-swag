'use strict';

module.exports = function(sequelize, DataTypes) {
  var UserRole = sequelize.define('UserRole', {
    UserId: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex'
    },
    RoleId: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex'
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.UserRole.belongsTo(models.User);
        models.UserRole.belongsTo(models.Role);
      }
    }
  });
  return UserRole;
};