const userModule = require('../index').userModel;

module.exports = {

    async getUser(Email){
        return await userModule.findOne({where : {Email:Email}});
    }
}