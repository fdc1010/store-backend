const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('spinwheel_settings', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        prize_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'prize_settings',
                key: 'id'
            }
        },
        num_spin:{
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: "0: Inactive, 1: Active"
        },
        spinwheel_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Spin control id'
        },
        total_winners: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Number of winner daily. -1: unlimited',
        }
    }, {
        sequelize,
        tableName: 'spinwheel_settings',
        freezeTableName: true,
        underscored: true,
        timestamps: true,
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
                name: "prize_id",
                using: "BTREE",
                fields: [
                  { name: "prize_id" },
                ]
            },
        ]
    });
}
