const moment = require('../configs/moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../configs/sequelize');
const { SPIN_CONTROL_STATUS } = require('../configs');

class SpinControlService {
  constructor() {
    this.Model = db.models.daily_spin_control;
  }

  async validateSpinControl(formData) {
    // Check if both spin_date and spin_date_until existed
    // Both these fields must be appear if formData has one of them.
    const {spin_date, spin_date_until, is_infinite, id} = formData;
    const isValidDate = [spin_date, spin_date_until].reduce((count, v) => {
        return v ? count + 1 : count;
    }, 0);

    if (isValidDate !== 0 && isValidDate !== 2) {
      return {
        isValid: false,
        error: 'Both date must be existed or empty',
      }
    }

    // If spin not a daily spin. It should have specific start and end date
    if (!is_infinite && isValidDate !== 2) {
      return {
        isValid: false,
        error: 'Missing date params',
      }
    }

    // Check if there is any existed daily spin control
    if (is_infinite && is_infinite === 1) {
      const infiniteSpin = await this.getCurrentDailySpinControl();
      // const {id} = formData;
      if (infiniteSpin && +infiniteSpin.id !== +id && !spin_date) {
          return {
            isValid: false,
            error: 'There is an existed daily spinwheel.',
          }
      }
    }

    // Should check if startDate or endDate is between any start-end date records in db
    if(spin_date && spin_date_until) {
      const startDate = moment(spin_date).toDate();
      const endDate = moment(spin_date_until).toDate();
      const collapseDateSpinControl = await this.Model.findOne({
        where: {
          status: SPIN_CONTROL_STATUS.ACTIVE,
          [Op.or]: [
            // Check if new spin control contains exsisted start date
            {
              spin_date: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
              },
            },
            // Check if new spin control contains existed end date
            {
              spin_date_until: {
                [Op.gte]:startDate,
                [Op.lte]: endDate,
              }
            },
            // Check if new spin control is inside exsited spin control
            {
              [Op.and]: [
                {
                  spin_date: {
                    [Op.lte]: startDate
                  }
                },
                {
                  spin_date_until: {
                    [Op.gte]: endDate,
                  }
                },
              ],
            },
          ],
        }
      });

      if (collapseDateSpinControl && +collapseDateSpinControl.id !== +id) {
        return {
          isValid: false,
          error: 'There is an existed spin configs with date collapsed.'
        }
      }
    }

    // If the new spin control has date and is daily spin we can create it
    // This mean the new spin control only available from the time specific and replace the current spin until endate reach
    return { isValid: true, error: null };
  }

  async getSingleSpinControl(filter) {
    const defaultWhere = {
      status: {
        [Op.in]: [SPIN_CONTROL_STATUS.ACTIVE, SPIN_CONTROL_STATUS.DISABLED],
      }
    }

    const {where, ...rest} = filter;
    let whereClause = defaultWhere;

    if (where) {
      whereClause = {
        ...defaultWhere,
        ...where,
      }
    }

    return this.Model.findOne({
      where: {...whereClause},
      ...rest
    });
  }

  async create() {

  }

  async getCurrentDailySpinControl() {
    const today = moment();
    let spinControl = null;
    const spinControlByDate = await this.getSingleSpinControl({
      where: {
        status: SPIN_CONTROL_STATUS.ACTIVE,
        spin_date: {
            [Op.lte]: today.toDate(),
        },
        spin_date_until: {
            [Op.gte]: today.toDate(),
        }
      }
    });
    if (spinControlByDate) {
        spinControl = spinControlByDate;
    }
    else {
        const dailySpinControl = await this.getSingleSpinControl({
          where: {
            is_infinite: 1,
            status: SPIN_CONTROL_STATUS.ACTIVE,
          }
        });
        spinControl = dailySpinControl;
    }

    return spinControl;
  }

  async findOne({ where, ...options }) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }
}

module.exports = new SpinControlService();
