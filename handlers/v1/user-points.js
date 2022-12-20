"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const UserPointsValidator = require('../../validators/user-points');
const Pagination = require('../../utils/pagination');
const axios = require('axios');
const StrInvest = require('../../utils/lib/store-invest');
const Notification = require('./notification');
const StrInvestService = require('../../services/store-invest.service');
const UserPointsService = require('../../services/user-points.service');

class UserPointHandler {
    async addUserPoints(req, res) {
        const validator = UserPointsValidator.validateAddUserPoints(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const user = await db.models.users.findByPk( req.user.id );
        const point_setting = await db.models.point_settings.findByPk( formData.point_id );

        if (!point_setting) return BaseResponse.BadResponse(res, 'point_id Not Found');
        if (point_setting.status === 0) return BaseResponse.BadResponse(res, 'point_id is innactive');

        await db.models.user_points
            .create({
                user_id: user.id,
                point_id: point_setting.id,
                points: point_setting.points,
                description: req.body.description && req.body.description !== '' ? req.body.description : point_setting.description
            })

        const userPointsSum = await db.models.user_points.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('points')), 'points'],
            ],
            where: {
                user_id: user.id,
            },
            group: ['user_id']
        })

        user.points = parseInt(userPointsSum.points);
        user.save()
            .then((user) => {
                return BaseResponse.Success(res, 'User Points added successfully', {
                    user
                });
            })
            .catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

    async getAllUserPointsAdmin(req, res) {
        let clause = { 
            where: {}, 
            attributes: {
                exclude: ['user_id', 'point_id']
            },
            include: [
                {
                    model: db.models.users,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    },
                },
                {
                    model: db.models.point_settings,
                    as: 'point_setting',
                }
            ]
        };
        return await Pagination.paging(req, res, db.models.user_points, clause,null, "Successfully Retrieved User Points Lists");
    }

    async getUserPointsAdmin(req, res) {
        await db.models.user_points.findAll({
            where: { user_id: req.query.user_id },
            attributes: {
                exclude: ['user_id', 'point_id']
            },
            include: [
                {
                    model: db.models.users,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    },
                },
                {
                    model: db.models.point_settings,
                    as: 'point_setting',
                }
            ]
        }).then( user_points => {
            if (user_points) return BaseResponse.Success(res, 'User Points Data Found', { data: user_points });
            return BaseResponse.BadResponse(res, 'User Points Data Not Found');
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        });
    }

    async addUserPointsAdmin(req, res) {
        const validator = UserPointsValidator.validateAddUserPoints(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const user = await db.models.users.findByPk( formData.user_id );
        const point_setting = await db.models.point_settings.findByPk( formData.point_id );

        if (!user) return BaseResponse.BadResponse(res, 'user_id Not Found');
        if (user.status === 0) return BaseResponse.BadResponse(res, 'user_id is innactive');

        if (!point_setting) return BaseResponse.BadResponse(res, 'point_id Not Found');
        if (point_setting.status === 0) return BaseResponse.BadResponse(res, 'point_id is innactive');

        await db.models.user_points
            .create({
                user_id: formData.user_id,
                point_id: point_setting.id,
                points: point_setting.points,
                description: req.body.description && req.body.description !== '' ? req.body.description : point_setting.description
            })
        
        const userPointsSum = await db.models.user_points.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('points')), 'points'],
            ],
            where: {
                user_id: formData.user_id,
            },
            group: ['user_id']
        })

        user.points = parseInt(userPointsSum.points);
        user.save()
            .then((user) => {
                return BaseResponse.Success(res, 'User Points added successfully', {
                    user
                });
            })
            .catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

    async serviceAddPointsFromInvest(req, res) {
        try {
            if(!req.body.user_store_invest_id) return BaseResponse.BadResponse(res, "User Store Invest Id is required!");
            if(!req.body.invest_points) return BaseResponse.BadResponse(res, "Invest Points is required!");

            const { user_store_invest_id, invest_points } = req.body;

            let user = await db.models.users
                .findOne({
                    where: { store_invest_id: +user_store_invest_id }
                });

            if (!user) return BaseResponse.BadResponse(res, 'User does not have any account in store store');

            const userStrInvestPointsLog = await StrInvestService.addFromInvestWithLog({
                user,
                invest_points,
            })

            if (!userStrInvestPointsLog.status) {
                throw new Error(userStrInvestPointsLog.error.message)
            }

            // Show Notification to the App
            await Notification.createNotificationMisc(
                user.id,
                userStrInvestPointsLog.id,
                Notification.TYPE.USER_POINTS, 
                null, 
                "Points", 
                `You earned User Store Points of ${invest_points}`,
                null,
            );


            return BaseResponse.Success(res, 'Points successfully update to the store store', { data: {
                log: userStrInvestPointsLog
            } });

        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    /* 
    * old function to update points from invest
    * will be delete later when the add points feature is fixed
    */
    // async addPointFrmStrInvest(req, res) {
    //     try {
    //         const token = req.body.token;
    //         // const points = req.query.points;
    //         let points_added = 0;

    //         const userStrInvestData = await StrInvest.getRewards(token);
    //         // return res.json(userStrInvestData);
    //         if (!userStrInvestData.success) return BaseResponse.BadResponse(res, 'Token invalid');

    //         if (userStrInvestData.success && userStrInvestData.data) {
    //             let user = await db.models.users
    //                 .findOne({
    //                     where: { email: userStrInvestData.data.email_address }
    //                 });

    //             if (!user) return BaseResponse.BadResponse(res, 'User does not have any account in store store');

    //             let userStrInvestPoints = await db.models.user_store_invest_points
    //                 .findOne({
    //                     where: { user_id: user.id },
    //                     order: [ [ 'id', 'DESC' ]]
    //                 })

    //             if (!userStrInvestPoints || userStrInvestPoints.points !== parseInt(userStrInvestData.data.points)) {
    //                 points_added = !userStrInvestPoints 
    //                     ? parseInt(userStrInvestData.data.points) 
    //                     : parseInt(userStrInvestData.data.points) - userStrInvestPoints.points

    //                 userStrInvestPoints = await db.models.user_store_invest_points
    //                     .create({
    //                         user_id: user.id,
    //                         user_store_invest_id: userStrInvestData.data.user_id,
    //                         points: parseInt(userStrInvestData.data.points),
    //                         invest_at: new Date(userStrInvestData.data.date),
    //                     })
                    
    //                 // TODO : Notification here
    //                 await Notification.createNotificationMisc(
    //                     user.id,
    //                     userStrInvestPoints.id,
    //                     Notification.TYPE.USER_POINTS, 
    //                     null, 
    //                     "Points", 
    //                     `You earned User Store Points of ${points_added}`
    //                 );
    //                 //—————————--——————————
    //             }

    //             return BaseResponse.Success(res, 'Points successfully update to the store store');
    //         } else {
    //             return BaseResponse.BadResponse(res, 'User does not have any account in store store');
    //         }

    //     } catch (err) {
    //         return BaseResponse.BadResponse(res, err.message);
    //     }
    // }

    async getUserPointsLog(req, res, next) {
        try {
            const user = req.user;
            let clause = { 
                where: {
                    user_id: user.id,
                },
            };
            return await Pagination.paging(req, res, db.models.user_points, clause,null, "Successfully Retrieved User Points Lists");
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }
}

module.exports = new UserPointHandler;
