const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cart_items', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    variant: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    item_retail_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    shipping_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      get: function() {
        return JSON.parse(this.getDataValue('note') || null)
      }
    },
    lalamove_quotation: {
      type: DataTypes.TEXT,
      allowNull: true,
      default: null,
      get: function() {
        return JSON.parse(this.getDataValue('lalamove_quotation') || null)
      }
    }
  }, {
    sequelize,
    tableName: 'cart_items',
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
      {
        name: "cart_id",
        using: "BTREE",
        fields: [
          { name: "cart_id" },
        ]
      },
      {
        name: "product_id",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
    ]
  });
};
