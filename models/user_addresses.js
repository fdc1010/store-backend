const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const UserAddress = sequelize.define('user_addresses', {
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
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    street_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    full_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    block_no: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unit_no: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    building_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    }
  }, {
    sequelize,
    tableName: 'user_addresses',
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
        name: "order_id",
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      }
    ]
  });

  UserAddress.beforeSave('updateFullAdress', (address, options) => {
    const {
      block_no,
      unit_no,
      building_name,
      street_name,
      postal_code,
    } = address;

    const unitNo = unit_no.includes('#') ? unit_no : `#${unit_no}`;
    let fullAddress = '';
    fullAddress += block_no.trim() || building_name.trim() || '';
    fullAddress += unit_no ? ` ${unitNo.trim()}` : '';
    fullAddress += `, ${street_name.trim()}`;
    fullAddress += postal_code ? `, ${postal_code.trim()}` : '';

    address.full_address = fullAddress;
  });

  return UserAddress;
};
