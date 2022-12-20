const Sequelize = require('sequelize');
const initModels = require('../models/init-models');

const URI = process.env.DATABASE_URI || 'mysql://root@localhost:3306/db_store' || 'mysql://fredcarz:Fdc@101082#@localhost:3306/db_store';

const sequelize = new Sequelize(URI,{
    dialectOptions: {
        dateStrings: true,
        typeCast: true,
        timezone: "local",
    },
    logging: false,
    timezone: 'Asia/Singapore',
});

// const sequelize = new Sequelize('db_store', 'fredcarz', 'Fdc@101082#', {
//     host: 'localhost',
//     dialect: 'mysql'
// });

initModels(sequelize);

module.exports = sequelize;
