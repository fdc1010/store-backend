const moment = require('moment-timezone');
// Use GMT+8 as default timezone
moment.tz.setDefault('Asia/Singapore');

module.exports = moment;
