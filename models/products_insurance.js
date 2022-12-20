const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products_insurance', {
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
    service_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 5000,
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    message_text_popup: {
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
    tableName: 'products_insurance',
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
