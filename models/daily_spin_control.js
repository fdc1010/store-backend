"use strict";
const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('daily_spin_control', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        total_winners: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            comment: "Total winner(s) per spinwheel date"
        },
        spin_per_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: "Number of spin per user in the game"
        },
        is_infinite: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: true,
        },
        spin_date: {
            type: DataTypes.DATE,
            allowNull: true,
            default: null,
            comment: "Spin Date"
        },
        spin_date_until: {
            type: DataTypes.DATE,
            allowNull: true,
            default: null,
            comment: "Spin End Date"
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: "0: Inactive, 1: Active"
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        monthly_dollars: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            comment: 'Dollars budget for each month',
        },
        monthly_points: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            comment: 'Points budget for each month',
        },
        daily_dollars: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            comment: 'Dollars budget for each day',
        },
        daily_points: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            comment: 'Points budget for each day',
        }
    },{
        sequelize,
        tableName: 'daily_spin_control',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "id"},
                ]
            }
        ]
    });
};
