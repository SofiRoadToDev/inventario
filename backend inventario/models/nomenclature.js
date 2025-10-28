'use strict';

module.exports = (sequelize, DataTypes) => {
  const Nomenclature = sequelize.define('Nomenclature', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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