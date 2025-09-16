'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    static associate(models) {
      Agent.hasMany(models.Asset, {
        foreignKey: 'agentId',
        as: 'assets'
      });

      Agent.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });
    }
  }

  Agent.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Agent',
    tableName: 'agents',
  });

  return Agent;
};