const Sequelize = require('sequelize');
const moment = require("moment");
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_review_replies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_review',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    comment: {
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
  }, {
    sequelize,
    tableName: 'product_review_replies',
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
