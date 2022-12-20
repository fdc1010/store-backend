const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('banners', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        date_created: {
            type: DataTypes.DATE,
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        url: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        image: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        image_mobile: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        type: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        sort_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        caption1: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        caption2: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        caption3: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        homepage_title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        banner_type: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1
        },
        publish_date_from: {
            type: DataTypes.DATE,
            allowNull: true
        },
        publish_date_to: {
            type: DataTypes.DATE,
            allowNull: true
        },
        url_mobile: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        redirect_type: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1
        },
        redirect_ref_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
        }
    }, {
        sequelize,
        tableName: 'banners',
        freezeTableName: true,
        underscored: true,
        timestamps: false,
        indexes: [
            {
              name: "PRIMARY",
              unique: true,
              using: "BTREE",
              fields: [
                { name: "id" },
              ]
            }
        ]
    });
}
