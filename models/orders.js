const Sequelize = require('sequelize');
const moment = require('../configs/moment')

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    voucher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vouchers',
        key: 'id'
      }
    },
    voucher_discount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    point_used: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    point_discount: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('point_used') / 1000
      },
      set: function(value){
    
      },
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0: Pending, 1: Payment Accepted, 2: Order Process, 3: Order Shipped, 4: Order Received"
    },
    payment_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    batch_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      get: function() {
        try {
          return JSON.parse(this.getDataValue('note'))
        } catch (e) {
          return this.getDataValue('note')
        }
      }
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at_humanize: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set: function(value){

      },
    },
    delivery_order_ref: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    driver_id: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    quotation: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      get: function() {
        return JSON.parse(this.getDataValue('quotation') || null);
      }
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    payment_fee: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    promo_code: {
      type: DataTypes.STRING,
      allowNull: true,
      default: '',
    },
    delivery_share_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    sorting_code: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    }
  }, {
    sequelize,
    tableName: 'orders',
    timestamps: true,
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
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "voucher_id",
        using: "BTREE",
        fields: [
          { name: "voucher_id" },
        ]
      },
    ]
  });
};
