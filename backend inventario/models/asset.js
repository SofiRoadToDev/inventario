'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Asset extends Model {
    static associate(models) {
      Asset.belongsTo(models.Agent, {
        foreignKey: 'agentId',
        as: 'agent'
      });
      Asset.belongsTo(models.Location, {
        foreignKey: 'locationId',
        as: 'location'
      });
      Asset.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Asset.belongsTo(models.Nomenclature, {
        foreignKey: 'nomenclatureId',
        as: 'nomenclature'
      });
    }
  }

  Asset.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'in_repair', 'decommissioned'),
      allowNull: false,
      defaultValue: 'active'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Agents',
        key: 'id'
      }
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    nomenclatureId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Nomenclatures',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Asset',
  });

  return Asset;
};