const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user_points', {
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
		point_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			// references: {
			// 	model: 'poin_settings',
			// 	key: 'id'
			// }
		},
		points: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		is_from_store: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		source: {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: 'The source that points come from',
		},
		type: {
			type: DataTypes.TINYINT,
			allowNull: false,
			default: 1,
			comment: 'Type of points: 1: earn from spinwheel, 2: used points',
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
		tableName: 'user_points',
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
				name: "point_id",
				using: "BTREE",
				fields: [
					{ name: "point_id" },
				]
			},
		]
	});
};
