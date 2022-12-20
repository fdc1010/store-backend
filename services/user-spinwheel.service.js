const UUID = require('uuid');
const sequelize = require('sequelize');
const moment = require('../configs/moment');

const db = require('../configs/sequelize');
const { PRIZE_TYPE, USER_POINTS_TYPE } = require('../configs');
const SpinControlService = require('./spin-control.service');
const UserPointService = require('./user-points.service');

const Op = sequelize.Op;

class UserSpinWheelService {
  constructor() {
    this.Model = db.models.user_spinwheel;
  }
  async updateUserPrize({user, prize, userSpinWheel}) {
    const prizeSetting = prize.prize_setting;
    if (!prizeSetting.prizes) {
      // If the prize is thank you or try again.
      // Do nothing
      return;
    }
    switch(+prizeSetting.type) {
      case PRIZE_TYPE.DOLLARS: {
        this.createUserPrizeVoucher({user, prize: prizeSetting, userSpinWheel});
        break;
      }
      case PRIZE_TYPE.POINTS: {
        this.updateUserPrizePoints({user, prize: prizeSetting, userSpinWheel});
        break;
      }
      default: break;
    }
  }

  async createUserPrizeVoucher({user, prize, userSpinWheel}) {
    // Handle create voucher for user with prize is dollars
    const voucher = {
      name: 'Spinwheel prize ' + prize.name,
      description: 'Spinwheel prize ' + prize.name,
      type: 1,
      minimum_purchase: 0,
      quantity: 1,
      amount: +prize.prizes,
      status: 1,
    };

    const {id} = userSpinWheel;

    voucher.code = `UPW${id}-` + UUID.v4(); // UPW Stand for user spin wheel
    const createdVoucher = await db.models.vouchers.create(voucher);
    if (!createdVoucher) {
      return;
    }
    const userVoucher = {
      user_id: user.id,
      voucher_id: createdVoucher.id,
      amount: 1,
    }
    await db.models.user_vouchers.create(userVoucher);
  }

  async updateUserPrizePoints({user, prize, userSpinWheel}) {
    // Handle update user points with prize is points
    let {id, points} = user;

    // Create logs for earn points from spinwheel
    const userPointLog = {
      user_id: id,
      points: +prize.prizes,
      type: USER_POINTS_TYPE.SPINWHEEL,
      source: userSpinWheel.id,
      description: `Earn ${+prize.prizes} from spinwheel`,
    };
    await UserPointService.create(userPointLog);
    user.points = +points + +prize.prizes;
    await user.save();
  }

  async checkUserSpinAvailable(userId) {
    try {
      const currentDailySpinControl = await SpinControlService.getCurrentDailySpinControl();
      if (!currentDailySpinControl) {
        return { status: false, spin_turns: 0, total_spin: 0, num_winners: 0, total_winners: 0, message: "No Daily Spinwheel Control Set!"};
      }

      const userTodaySpinCount = await this.countUserSpins({userId, spinControl: currentDailySpinControl});
      const remainSpin = currentDailySpinControl.spin_per_user - userTodaySpinCount;
      const {spin_per_user} = currentDailySpinControl;
      let message = `${userTodaySpinCount}/${currentDailySpinControl.spin_per_user} spin(s)`;
      let status = true;

      if (+spin_per_user - +userTodaySpinCount <= 0) {
        status = false,
        message = `You have no more spin turns for today! ${userTodaySpinCount}/${currentDailySpinControl.spin_per_user} spin(s)`
      }

      return {
        status,
        id: currentDailySpinControl.id,
        spin_turns: remainSpin,
        your_spins: userTodaySpinCount,
        total_winners: spin_per_user,
        message,
        spinControl: currentDailySpinControl,
      }
    } catch (err) {
      return { status: false, message: err.message };
    }
  }

  async countUserSpins({userId, spinControl}) {
    const { id, spin_date, spin_date_until } = spinControl;
    const startDate = spin_date ? moment().startOf('day') : moment().startOf('day');
    const endDate = spin_date_until ? moment().endOf('day') : moment().endOf('day');
    return this.Model.count({
      where: {
        user_id: userId,
        daily_spinwheel_control_id: id,
        created_at: {
          [Op.and]: [
            {
              [Op.gte]: startDate.toDate(),
            },
            {
              [Op.lte]: endDate.toDate(),
            }
          ],
        },
      }
    });
  }

  async countDailyWinnerByPrize(spinwheelSettingId) {
    const startDate = moment().startOf('day');
    const endDate = moment().endOf('day');
    return this.Model.count({
      where: {
        spinwheel_id: spinwheelSettingId,
        created_at: {
          [Op.and]: [
            {
              [Op.gte]: startDate.toDate(),
            },
            {
              [Op.lte]: endDate.toDate(),
            }
          ],
        },
      }
    })
  }

  async getRemainDailyDollars(spinControl) {
    const {id, spin_date, spin_date_until, daily_dollars} = spinControl;
    const startDate = spin_date ? moment(spin_date).startOf('day') : moment().startOf('day');
    const endDate = spin_date_until ? moment(spin_date_until).endOf('day') : moment().endOf('day');
    const dailyClaimDollars = await this.Model.findAll({
      where: {
        daily_spinwheel_control_id: id,
        type: PRIZE_TYPE.DOLLARS,
        created_at: {
          [Op.and]: [
            {
              [Op.gte]: startDate.toDate(),
            },
            {
              [Op.lte]: endDate.toDate(),
            }
          ],
        },
      }
    });
    // Calculating remain dollars
    const totalUsedDollars = dailyClaimDollars.reduce((total, item) => {
      return total + item.prizes;
    }, 0);
    return daily_dollars - totalUsedDollars;
  }

  async getRemainDailyPoints(spinControl) {
    const {id, spin_date, spin_date_until, daily_points} = spinControl;
    const startDate = spin_date ? moment(spin_date).startOf('day') : moment().startOf('day');
    const endDate = spin_date_until ? moment(spin_date_until).endOf('day') : moment().endOf('day');
    const dailyClaimDollars = await this.Model.findAll({
      where: {
        daily_spinwheel_control_id: id,
        type: PRIZE_TYPE.POINTS,
        created_at: {
          [Op.and]: [
            {
              [Op.gte]: startDate.toDate(),
            },
            {
              [Op.lte]: endDate.toDate(),
            }
          ],
        },
      }
    });
    // Calculating remain points
    const totalUsedDollars = dailyClaimDollars.reduce((total, item) => {
      return total + item.prizes;
    }, 0);
    return daily_points - totalUsedDollars;
  }
}

module.exports = new UserSpinWheelService();
