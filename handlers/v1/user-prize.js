"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const UserPrizeValidator = require('../../validators/user-prize');
const Pagination = require('../../utils/pagination');

const PRIZE = { STATUS_CLAIMED: 2, STATUS_REDEEMED : 3, STATUS_EXPIRED : 4, STATUS_FORFEITED : 5 };


class UserPrizeHandler {
    async getAllUserPrize(req, res) {

        let clause = {
            where: {},
            attributes: {
                exclude: [ 'prize_id']
            }
        }

        return await Pagination.paging(req, res, db.models.user_prize_logs, clause, null,"Successfully Retrieved User Prize Log Lists ");
    }

    async addUserPrize(req, res) {
        const validator = UserPrizeValidator.validateAddUserPrize(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const user = await db.models.users.findByPk( formData.user_id );
        const prize = await db.models.prize_settings.findOne({ where: { id: formData.prize_id }});

        if (!user) return BaseResponse.BadResponse(res, 'user_id Not Found');
        if (user.status === 0) return BaseResponse.BadResponse(res, 'user_id is inactive');

        if (!prize) return BaseResponse.BadResponse(res, 'Prize not found.');
        if (prize.status === 0) return BaseResponse.BadResponse(res, 'prize is inactive');


        const userPrize = await db.models.user_prize_logs.create({
            user_id:  formData.user_id,
            prize_id: prize.id,
            prizes: prize.prizes,
            description: prize.description
        });

        return BaseResponse.Success(res, 'User Prize Successfully Added', {
            data: userPrize
        });
    }

    async claimedPrize(req, res) {
        let userPrize = await db.models.user_prize_logs.findOne({
            where: {id: req.body.user_prize_id }
        })
        if (!userPrize) return BaseResponse.UnprocessableEntity(res, 'User Prize Not Found');

        await userPrize.update({ status: PRIZE.STATUS_CLAIMED })
            .then(userPrize => {
                return BaseResponse.Success(res, 'User Prize Successfully Updated to claimed', {
                    data: userPrize
                });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

    async redeemedPrize(req, res) {
        let userPrize = await db.models.user_prize_logs.findOne({
            where: {id: req.body.user_prize_id }
        })
        if (!userPrize) return BaseResponse.UnprocessableEntity(res, 'User Prize Not Found');

        await userPrize.update({ status: PRIZE.STATUS_REDEEMED })
            .then(userPrize => {
                return BaseResponse.Success(res, 'User Prize Successfully Updated to redeemed', {
                    data: userPrize
                });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

    async expiredPrize(req, res) {
        let userPrize = await db.models.user_prize_logs.findOne({
            where: {id: req.body.user_prize_id }
        })
        if (!userPrize) return BaseResponse.UnprocessableEntity(res, 'User Prize Not Found');

        await userPrize.update({ status: PRIZE.STATUS_EXPIRED })
            .then(userPrize => {
                return BaseResponse.Success(res, 'User Prize Successfully Updated to expired', {
                    data: userPrize
                });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

    async forfeitedPrize(req, res) {
        let userPrize = await db.models.user_prize_logs.findOne({
            where: {id: req.body.user_prize_id }
        })
        if (!userPrize) return BaseResponse.UnprocessableEntity(res, 'User Prize Not Found');

        await userPrize.update({ status: PRIZE.STATUS_FORFEITED })
            .then(userPrize => {
                return BaseResponse.Success(res, 'User Prize Successfully Updated to forfeited', {
                    data: userPrize
                });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }
}

module.exports = new UserPrizeHandler;