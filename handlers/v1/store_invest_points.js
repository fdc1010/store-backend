"use strict";
/**
 * Developer: Abubakar Abdullahi
 * Date: 12/07/2021
 * Time: 1:59 PM
 */

const Sequelize = require('sequelize');
const db = require('../../configs/sequelize');
const axios = require('axios');

class StoreInvestPointsHandler {

    async getPointFromStrInvest(req, res) {
        try {
            const token = req.query.token;
            const result = await axios.get(`http://qa.seedintech.xyz/services/Reward/List?token=${token}`);

            return BaseResponse.Success(res, 'Store Invest Point Found', {
                data: result.data.data
            })
        }catch (e) {
            return BaseResponse.BadResponse(res, e.message);
        }
    }

    async savePointFrmStrInvest(req, res) {
        try {
            const token = req.query.token;
            const result = await axios.get(`http://qa.seedintech.xyz/services/Reward/List?token=${token}`);

            const storepoint = await db.models.store_invest_points
                .create({
                    user_id: result.data.data.user_id,
                    reward_id: result.data.data.reward_id,
                    email_address: result.data.data.email_address,
                    points: result.data.data.points,
                    date: result.data.data.date,
                });

            return BaseResponse.Success(res, 'Store Invest Points added successfully', {
                data: storepoint
            })

        }catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async saveStrInvestPointToUserPoint(req, res) {

        const user = await db.models.users.findOne({
            where: {
                email: req.query.email
            }
        });
        if (!user) return BaseResponse.BadResponse(res, 'User does not exist.');

        const point = await db.models.store_invest_points.findOne({
            where: {
                email_address: user.email
            }
        })

        if (!point) return BaseResponse.BadResponse(res, 'User does not exist on store store');

        const investPoint = await db.models.user_points.create({
            user_id: point.user_id,
            point_id: point.id,
            points: point.points,
            is_from_store: 1
        });

        return BaseResponse.Success(res, 'Store Invest added successfully.', {
            data: investPoint
        });
    }


}

module.exports = new StoreInvestPointsHandler;