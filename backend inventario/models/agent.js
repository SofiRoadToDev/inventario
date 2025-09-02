'use strict';

module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define('Agent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Agent.associate = function(models) {
    Agent.hasMany(models.Asset, {
      foreignKey: 'agentId',
      as: 'assets'
    });
  };

  return Agent;
};