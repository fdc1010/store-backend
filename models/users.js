const Sequelize = require('sequelize');
const moment = require('../configs/moment');

module.exports = function(sequelize, DataTypes) {
  const UserSchema = sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contact_no: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    salutation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    invest_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    // Added by frank
    is_superadmin: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function() {
        return this.getDataValue('role_id') == 1;
      },
      set: function(value){

      }
    },
    is_merchant: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function() {
        return this.getDataValue('role_id') == 3;
      },
      set: function(value){

      }
    },
    // ==============
    is_store_user: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    store_invest_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    store_invest_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_code: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    default_address: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    can_spinwheel: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    enable_newsletter: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function() {

      }
    },
    fcm_token: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function() {

      },
      set: function(value){

      }
    },
    fcm_topics: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function() {

      },
      set: function(value){

      }
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "role_id",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
    ]
  });

  UserSchema.prototype.publicJSON = function () {
    const result = this.toJSON();
    const {birth_date, merchants} = this;
    if (!birth_date) {
      return result;
    }
    
    const parsedDate = moment(birth_date);
    if (parsedDate.isValid()) {
      result.birth_date = parsedDate.format('YYYY-MM-DD');
    }

    if(merchants && merchants[0]) {
      const merchant = merchants[0];
      const { opening_hours } = merchant;

      if (!opening_hours) {
        result.merchants[0].opening_hours = [];
      }
    }

    return result;
  }

  return UserSchema;
};
