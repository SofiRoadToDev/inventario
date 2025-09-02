'use strict';

module.exports = (sequelize, DataTypes) => {
  const Nomenclature = sequelize.define('Nomenclature', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Nomenclature.associate = function(models) {
    Nomenclature.hasMany(models.Asset, {
      foreignKey: 'nomenclatureId',
      as: 'assets'
    });
  };

  return Nomenclature;
};