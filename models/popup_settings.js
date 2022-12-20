"use strict";
const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('popup_settings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 2,
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: true,
    },
    banner_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    publish_date_from: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    publish_date_to: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
  }, {
    sequelize,
    tableName: 'popup_settings',
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
