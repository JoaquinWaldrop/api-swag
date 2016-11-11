'use strict';

module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define('Role', {
    roleName:  {
      allowNull: false,
      type: DataTypes.STRING
    },
    roleDescription: {
      allowNull: true,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.Role.belongsToMany(models.User, { through: models.UserRole });

      }
    }
  });
  return Role;
};