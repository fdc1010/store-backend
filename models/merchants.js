const Sequelize = require('sequelize');
const { DEFAULT_MERCHANT_COLOR_SETTINGS } = require('../configs');

module.exports = function(sequelize, DataTypes) {
  const MerchantSchema = sequelize.define('merchants', {
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
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    office_phone_number: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    office_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    acra_number: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    acra_business_profile: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    },
    opening_hours: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '',
    },
    about: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    banner_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color_settings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_food_merchant: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function() {
        return this.getDataValue('type') === 2
      },
      set: function(value){
      
      }
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 0,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 0,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    industry: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    }
  }, {
    sequelize,
    tableName: 'merchants',
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
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });

  MerchantSchema.prototype.publicJSON = function () {
    const result = this.toJSON();
    const {office_phone_number, user, color_settings} = result;

    if (office_phone_number) {
      const [code, phone] = office_phone_number.split(' ') || [null, null];
      result.office_phone_code = code;
      result.office_phone_number = phone;
    }

    if (user) {
      const {contact_no} = user;
      const [code, phone] = contact_no?.split(' ') || [null, null];
      result.user.handphone_code = code;
      result.user.handphone_number = phone;
    }

    if (!color_settings) {
      result.color_settings = DEFAULT_MERCHANT_COLOR_SETTINGS;
    }

    return result;
  }

  MerchantSchema.prototype.toJSON = function() {
    const result = this.dataValues;
    const { opening_hours } = result;

    if (!opening_hours) {
      result.opening_hours = [];
    }

    return result;
  }

  return MerchantSchema;
};
