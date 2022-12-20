"use strict";
const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('qxpress_pickup', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_orders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    from_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    to_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    order_refs: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickup_no: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    }
  }, {
    sequelize,
    tableName: 'qxpress_pickup',
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
