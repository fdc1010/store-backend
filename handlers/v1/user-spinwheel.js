"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination');
const moment = require('../../configs/moment');
const UserSpinwheelService = require('../../services/user-spinwheel.service');
const { PRIZE_TYPE } = require('../../configs');

const isUserCanSpin = async (userId) => {
    const parseDate = moment().format('YYYY-MM-DD');
    return await db.models.daily_spin_control.findOne(
        {
            // where: Sequelize.where(Sequelize.fn('date', Sequelize.col('spin_date')), '=', moment().format('YYYY-MM-DD'))
            where: {
                [Op.or]: [
                    {
                        spin_date: {
                            [Op.between]: [moment(parseDate).startOf('day'), moment(parseDate).endOf('day')]
                        }
                    },
                    {
                        spin_date_until	: {
                            [Op.between]: [moment(parseDate).startOf('day'), moment(parseDate).endOf('day')]
                        }
                    },
                    {
                        is_infinite: 1
                    }
                ]
            },
            order: [['id','DESC']]
        }
    )
    .then(async(daily_spin_crtl) => {
        let daily_spin_control = daily_spin_crtl;
        if(!daily_spin_control) return { status: false, spin_turns: 0, total_spin: 0, num_winners: 0, total_winners: 0, message: "No Daily Spinwheel Control Set!"};
        if(
            daily_spin_control.is_infinite == 1 &&
            (moment(daily_spin_control.spin_date).format('YYYY-MM-DD') != parseDate &&
            moment(daily_spin_control.spin_date_until).format('YYYY-MM-DD') != parseDate)
        ){

            daily_spin_control = await db.models.daily_spin_control.create({
                spin_per_user: daily_spin_crtl.spin_per_user,
                total_winners: daily_spin_crtl.total_winners,
                is_infinite: daily_spin_crtl.is_infinite ,
                spin_date: parseDate,
                spin_date_until: parseDate
            });

            daily_spin_crtl.is_infinite = 0;
            daily_spin_crtl.save();
        }

        if(daily_spin_control.spin_per_user > 0 && daily_spin_control.total_winners > 0){
            const userspinwheelcountAll = await db.models.user_spinwheel.findAll(
                {
                    raw: true,
                    where: {
                        daily_spinwheel_control_id: daily_spin_control.id
                    },
                    attributes: ['user_id','daily_spinwheel_control_id',[(db.fn('count', db.col('user_id'))), 'users_played']],
                    group: ['user_id','daily_spinwheel_control_id']
                }
            );
            const userspinwheelcount = await db.models.user_spinwheel.findAndCountAll(
                {
                    where: {
                        user_id:                    userId,
                        daily_spinwheel_control_id: daily_spin_control.id
                    }
                }
            );
            const userspinwheelids = userspinwheelcountAll.map(elem => { return elem.user_id; });
            const spin_turns = daily_spin_control.spin_per_user - userspinwheelcount.count;
            const total_winners = userspinwheelcount.count;
            const players_to_win = userspinwheelids.length;

            if(daily_spin_control.total_winners <= players_to_win || daily_spin_control.total_winners <= total_winners){

                if(userspinwheelids.includes(userId) && spin_turns <= 0) return { status: false, id: daily_spin_control.id, spin_turns: spin_turns, total_spin: userspinwheelcount.count, num_winners: userspinwheelcountAll.length, total_winners: daily_spin_control.spin_per_user, message: `You have no more spin turns for today! ${userspinwheelcount.count}/${daily_spin_control.spin_per_user} spin(s)`};
                else if(!userspinwheelids.includes(userId)) return { status: false, id: daily_spin_control.id, spin_turns: 0, total_spin: 0, num_winners: userspinwheelcountAll.length, total_winners: daily_spin_control.spin_per_user, message: `Sorry... youre just a spin turn late for today! but you can still play next spinwheel schedule. Just Spin Earlier. Thank You!`};
            }

            return { status: true, id: daily_spin_control.id, spin_turns: spin_turns, your_spins: userspinwheelcount.count, num_winners: userspinwheelcountAll.length, total_winners: daily_spin_control.spin_per_user, message: `${userspinwheelcount.count}/${daily_spin_control.spin_per_user} spin(s)` };
        }

        return { status: false, message: "Check and Set Spins per user and Total winners a day"};
    })
    .catch(err => {
        return { status: false, message: err.message };
    });
};

class UserSpinWheelHandler {
    async spinAWheel(req, res) {
        try {
            if(req.user.can_spinwheel==0) return BaseResponse.BadResponse(res, "Sorry... Pls contact store admin for futher details on how you can play spin a wheel",null,"Info");
            const userPlayDetails = await UserSpinwheelService.checkUserSpinAvailable(req.user.id);

            if (!userPlayDetails.status) {
                return BaseResponse.BadResponse(res, userPlayDetails.message,null,"Info");
            }

            let choosedPrize = await db.models.spinwheel_settings.findOne({
                where: {
                    status: 1,
                    spinwheel_id: userPlayDetails.id,
                },
                order: [
                    [Sequelize.literal('RAND()')]
                ],
                attributes: ['id','name','description', 'total_winners',],
                include: [{
                    model: db.models.prize_settings,
                    as: 'prize_setting',
                    attributes:['id','name','description','prizes', 'type']
                }]
            });

            // Validate choosedPrize
            const maxTotalWinners = choosedPrize.total_winners;
            const totalWinners = await UserSpinwheelService.countDailyWinnerByPrize(choosedPrize.id);
            const { spinControl } = userPlayDetails;
            let dailyRemainValue = null;
            const choosedPrizeSetting = choosedPrize.prize_setting;
            const choosedPrizeValue = choosedPrizeSetting.prizes;

            switch (choosedPrizeSetting.type) {
                case PRIZE_TYPE.DOLLARS: {
                    dailyRemainValue = await UserSpinwheelService.getRemainDailyDollars(spinControl);
                    break;

                }
                case PRIZE_TYPE.POINTS: {
                    dailyRemainValue = await UserSpinwheelService.getRemainDailyPoints(spinControl);
                    break;
                }
                default: {
                    dailyRemainValue = 0;
                    break;
                }
            };

            if (maxTotalWinners >= 0) {
                if (totalWinners - maxTotalWinners >= 0 || dailyRemainValue <= 0 || choosedPrizeValue > dailyRemainValue) {

                    const thankyouPrize = await db.models.prize_settings.findOne({
                        where: {
                            status: 1,
                            prizes: 0
                        }
                    });

                    choosedPrize = await db.models.spinwheel_settings.findOne({
                        where: {
                            status: 1,
                            prize_id: thankyouPrize.id,
                            spinwheel_id: userPlayDetails.id,
                        },
                        order: [
                            [Sequelize.literal('RAND()')]
                        ],
                        attributes: ['id','name','description', 'total_winners',],
                        include: [{
                            model: db.models.prize_settings,
                            as: 'prize_setting',
                            attributes:['id','name','description','prizes', 'type']
                        }]
                    });
                }
            }

            const createdUserSpinwheel = await db.models.user_spinwheel.create({
                user_id: req.user.id,
                spinwheel_id: choosedPrize.id,
                daily_spinwheel_control_id: userPlayDetails.id,
                prizes: choosedPrize.prize_setting.prizes,
                type: choosedPrize.prize_setting.type,
            });

            await UserSpinwheelService.updateUserPrize({user: req.user, prize: choosedPrize, userSpinWheel: createdUserSpinwheel});
            delete userPlayDetails.status;
            delete userPlayDetails.spinControl;
            const [spinTurn, totalTurns] = userPlayDetails.message.split('/');
            return BaseResponse.Success(res, `You have Spin the wheel`, {
                data: {
                    user_id: req.user.id,
                    result: choosedPrize,
                    details: {
                        ...userPlayDetails,
                        spin_turns: userPlayDetails.spin_turns - 1,
                        your_spins: userPlayDetails.your_spins + 1,
                        message: `${+spinTurn+1}/${totalTurns}`,

                    }
                }
            });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    // This function only for testing.
    // Should be remove later
    async spinAWheelByUserId(req, res) {
        if(!req.query.user_id) return BaseResponse.BadResponse(res, "Sorry... Pls contact store admin for futher details on how you can play spin a wheel",null,"Info");
        const dailyspinwheel = await isUserCanSpin(parseInt(req.query.user_id));
        if(!dailyspinwheel.status) return BaseResponse.BadResponse(res, dailyspinwheel.message,null,"Info");

        return await db.models.spinwheel_settings.findOne(
                                                    {
                                                        where: { status: 1 },
                                                        order: [
                                                            [Sequelize.literal('RAND()')]
                                                        ],
                                                        attributes: ['id','name','description'],
                                                        include: [{
                                                            model: db.models.prize_settings,
                                                            as: 'prize_setting',
                                                            attributes:['id','name','description','prizes']
                                                        }]
                                                    })
                                                    .then(async(option) => {
                                                        await db.models.user_spinwheel.create({
                                                            user_id: parseInt(req.query.user_id),
                                                            spinwheel_id: option.id,
                                                            daily_spinwheel_control_id: dailyspinwheel.id,
                                                            prizes: option.prize_setting.prizes
                                                        });
                                                        const dailyspinwheelcb = await isUserCanSpin(parseInt(req.query.user_id));
                                                        delete dailyspinwheelcb.status;
                                                        return BaseResponse.Success(res, `You have Spin the wheel`, { data: { user_id: req.query.user_id, result: option, details: dailyspinwheelcb } });
                                                    })
                                                    .catch(err => {
                                                        console.log("spinwheel err",err.message);
                                                        return BaseResponse.BadResponse(res, err.message);
                                                    });

    }

    async viewUserSpinAWheelTurnsByUserId(req,res){
        if(!req.query.user_id) return BaseResponse.BadResponse(res, "User Id is required");

        const userid = parseInt(req.query.user_id);
        const userspinwheel = await isUserCanSpin(userid);
        delete userspinwheel.status;
        return BaseResponse.Success(res, 'User spin a wheel turns', {
            data: userspinwheel
        });
    }
    async viewUserSpinAWheelTurns(req,res){
        if(req.user.can_spinwheel==0) return BaseResponse.BadResponse(res, "Sorry... Pls contact store admin for futher details on how you can play spin a wheel",null,"Info");
        // const userspinwheel = await isUserCanSpin(req.user.id);
        const userPlayDetails = await UserSpinwheelService.checkUserSpinAvailable(req.user.id);
        delete userPlayDetails.status;
        delete userPlayDetails.spinControl;
        return BaseResponse.Success(res, 'User spin a wheel turns', {
            data: userPlayDetails
        });
    }
    async viewUserSpinAWheel(req,res){
        if(!req.query.user_id) return BaseResponse.BadResponse(res, "User Id is required");
        let clause = {};
        clause.where = { user_id: req.query.user_id };

        if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
            return Pagination.paging(req,res,db.models.user_spinwheel,clause,null, 'User spin a wheel Results');
        }else{
            const userspinwheels = await db.models.user_spinwheel.findAll(clause);
            return BaseResponse.Success(res, 'User spin a wheel results', {
                data: userspinwheels
            });
        }
    }
    async listUserSpinAWheel(req,res){
        let clause = {};
        // clause.where = {};

        if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
            return Pagination.paging(req,res,db.models.user_spinwheel,clause,null, 'User spin a wheel Results');
        }else{
            const userspinwheels = await db.models.user_spinwheel.findAll(clause);
            return BaseResponse.Success(res, 'User spin a wheel Results', {
                data: userspinwheels
            });
        }
    }

    async addUserSpinWheelResult(req,res){
        if(!req.body.option_id) return BaseResponse.BadResponse(res, "Spinwheel Option Id required!");
        if(!req.body.dailyspinwheel_id) return BaseResponse.BadResponse(res, "Daily Spinwheel Id required!");
        if(!req.body.prizes) return BaseResponse.BadResponse(res, "Spinwheel Prize is required!");

        try{

            const user_spinwheel = await db.models.user_spinwheel.create({
                user_id: req.user.id,
                spinwheel_id: req.body.option_id,
                daily_spinwheel_control_id: req.body.dailyspinwheel_id,
                prizes: req.body.prizes
            });

            return BaseResponse.Success(res, `User Spin Wheel`, { data: user_spinwheel });

        }catch(err){
            console.log("spinwheel err",err.message);
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async deleteUserSpinWheel(req, res) {
        let clause = {};
        clause.where = {};

        if(req.query.id) clause.where.id = parseInt(req.query.id);
        else{
            if(req.user.id) clause.where.user_id = req.user.id;
            else if(!req.user && req.body.user_id) clause.where.user_id = parseInt(req.body.user_id);
            else if(!req.user.id && !req.body.user_id) return BaseResponse.BadResponse(res, "User is required!");
        }

        return await db.models.user_spinwheel.destroy(clause)
                        .then(product => {
                          return BaseResponse.Success(res, 'Successfully deleted User Spinwheel Result!');
                        })
                        .catch(err => {
                          return BaseResponse.BadResponse(res, err.message);
                        })
      }
}

module.exports = new UserSpinWheelHandler;
module.exports.isUserCanSpin = isUserCanSpin;
