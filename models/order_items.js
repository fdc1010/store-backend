const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order_items', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
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
    delivery_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    delivery_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sub_total: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('item_price') * this.getDataValue('quantity');
      }
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0: Pending, 1: Payment Accepted, 2: Order Process, 3: Order Shipped, 4: Order Received"
    },
    status_name: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        const ORDER_STATUSES = ['Pending','Payment Accepted','Order Process','Order Shipped','Order Received','Order Cancelled'];
        return ORDER_STATUSES[parseInt(this.getDataValue('status'))];
      },
      set: function(value){
      
      },
    },
    setter_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0,
    },
    category_fee: {
      type: DataTypes.FLOAT,
      allowNull: true,
      default: 0,
    },
    store_fee_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      default: 0,
    },
    event: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    tableName: 'order_items',
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
        name: "order_id",
        using: "BTREE",
        fields: [
          { name: "order_id" },
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
