const moment = require('../configs/moment');
const {Op} = require('sequelize');

const db = require("../configs/sequelize");
const { DAY_OF_WEEK } = require('../configs');

class MerchantService {
  constructor() {
    this.Model = db.models.merchants;
  }

  async getMerchants({where, options}) {
    return this.Model.findAll({
      where,
      ...options,
    });
  }

  async findOne({where, ...options}) {
    const defaultWhere = {
      status: 1,
    }
    let whereClause = defaultWhere;
    if (where) {
      whereClause = {
        ...defaultWhere,
        ...where,
      }
    }

    return this.Model.findOne({
      where: whereClause,
      ...options
    });
  }

  getOpeningStatus(merchant) {
    let open_status = null;
    let next_time = null;

    const now = moment().utcOffset(8);
    const dayOfWeek = now.day(); // start from sunday and end at saturday - [0...6]
    const opening_hours = (merchant.opening_hours || [])[dayOfWeek];
    if (!opening_hours) {
      open_status = 'Closed';
      next_time = null;
    } else {
      const start = moment(opening_hours.open_hour, 'HH:mm').utcOffset(8);
      const end = moment(opening_hours.close_hour, 'HH:mm').utcOffset(8);
      console.log('start: ', start);
      console.log('end: ', end);
      console.log('now: ', now);
      if (now.isSameOrAfter(start) && now.isSameOrBefore(end) && opening_hours.is_open) {
        open_status = 'Open';
        next_time = `${opening_hours.close_hour}`;
      } else {
        open_status = 'Closed';

        // Get next open time
        let nextOpen = null;
        let count = 0;
        let runner = dayOfWeek;
        do {
          ++count;
          ++runner
          const openObj = (merchant.opening_hours || [])[runner];
          if (openObj && openObj.is_open) {
            nextOpen = openObj;
            break;
          }
          if (runner === 7) {
            runner = -1;
          }
        } while(count <= 7)

        // If nextOpen is null it mean cannot find any open time.
        if (!nextOpen) {
          // If today is not open date. So the shop closed for all days of week.
          runner = opening_hours.is_open ? dayOfWeek : -1;
        }
        // End get next open time

        next_time = DAY_OF_WEEK[runner] ? `${nextOpen.open_hour} ${DAY_OF_WEEK[runner]}` : null;
      }
      // open_status = 'Open';
      // next_time = `${opening_hours.close_hour}`;
    }

    return { open_status, next_time };
  }
}

module.exports = new MerchantService();
