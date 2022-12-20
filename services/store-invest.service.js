const {Op} = require('sequelize');
const db = require("../configs/sequelize");
const StrInvestUtil = require('../utils/lib/store-invest');
const { USER_INVEST_POINTS_TYPE } =  require('../configs');

class StrInvestService {
    constructor() {
        this.Model = db.models.user_store_invest_points;
    }
    async createLog({ user, invest_points, type, description = null }) {
        return this.Model
            .create({
                user_id: user.id,
                user_store_invest_id: user.store_invest_id,
                invest_points: +invest_points,
                type: type,
                description: description
            })
    }

    async addFromInvestWithLog({ user, invest_points, description = '' }) {
        let result = { status: false, error: {message: null} }
        try {
            const {dataValues:user_invest_points_log} = await this.createLog({
                user,
                invest_points: invest_points,
                type: USER_INVEST_POINTS_TYPE.ADD_FROM_INVEST,
                description: description ? description : 'Earned from invest',
            })
    
            user.invest_points += +invest_points;
            await user.save()

            return result = {
                ...result,
                status: true,
                ...user_invest_points_log,
            }
        } catch (err) {
            return result = {
                ...result,
                error: {message: err.message}
            }
        }

    }

    async usePointsForCheckoutWithLog({ user, store_invest_token, invest_points, description = '' }) {
        let result = { status: false, error: {message: null} }
        try {
            const update_result = await StrInvestUtil.updateRewards(store_invest_token, invest_points);

            if (update_result.data.success) {
                const user_invest_points_log = await this.createLog({
                    user,
                    type: USER_INVEST_POINTS_TYPE.REDEEM_POINTS,
                    invest_points: +invest_points,
                    description: description ? description : 'Points used from the store',
                })
    
                user.invest_points -= +invest_points;
                await user.save()
        
                return result = {
                    ...result,
                    status: true,
                    user_invest_points_log,
                }
            } else {

                return result = {
                    ...result,
                    error: {message: 'Update points to invest failed, user not found or token expired !'}
                }
            }

            
        } catch (err) {
            return result = {
                ...result,
                error: {message: err.message}
            }
        }
        
    }

}

module.exports = new StrInvestService();