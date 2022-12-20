function StrInvestService(req, res, next) {
  
    // const key = process.env.KEY || 'secret';
    const key = process.env.INVEST_STORE_KEY || 'secret';
    
    if (req.body.key === key) {
        return next();
    }
    
    return BaseResponse.Forbidden(res);
}

module.exports = {
    StrInvestService,
}
  