const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('push_notifications', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    order_updates: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    chats: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    promotions: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1,
      comment: "0: Pending, 1: Payment Accepted, 2: Order Process, 3: Order Shipped, 4: Order Received"
    }
  }, {
    sequelize,
    tableName: 'push_notifications',
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
    ]
  });
};
