const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products_crowdfund', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    is_going_crowd_funding: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    service_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 5000,
    },
    above_service_value_not_going_message: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    above_service_value_going_message: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    below_service_value_not_going_message: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    }
  }, {
    sequelize,
    tableName: 'products_crowdfund',
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
