const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user_spinwheel', {
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
		spinwheel_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: 'spinwheel_settings',
				key: 'id'
			}
		},
		daily_spinwheel_control_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: 'daily_spin_control',
				key: 'id'
			}
		},
		prizes: {
			type: DataTypes.DOUBLE,
			allowNull: true,
			defaultValue: 0,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		is_won: {
			type: DataTypes.TINYINT,
			allowNull: true,
			defaultValue: 0,
		},
		status: {
			type: DataTypes.TINYINT,
			allowNull: true,
			defaultValue: 0,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'user_spinwheel',
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
				name: "user_id",
				using: "BTREE",
				fields: [
					{ name: "user_id" },
				]
			},
			{
				name: "spinwheel_id",
				using: "BTREE",
				fields: [
					{ name: "spinwheel_id" },
				]
			},
			{
				name: "daily_spinwheel_control_id",
				using: "BTREE",
				fields: [
					{ name: "daily_spinwheel_control_id" },
				]
			}
		]
	});
};
