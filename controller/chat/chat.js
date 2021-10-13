const queryModule = require('../../model/query/query');

module.exports = {

    /* Function for save the chat */
    async saveChat(req,res){
        message = req.body.message;
        room_Id = req.params.room_Id;

        try{
            let mydata = await queryModule.getUser({Email:req.user.Email})
            let myChat = {
                Message:message,
                User_Id: mydata._id,
                Room_Id : room_Id
            }

            await queryModule.saveChatMessage(myChat);
            return res.status(200).send({code:200,status:'Chat save successfully',myChat})

        }catch(err){

            return res.status(422).send({code:422,status:'failed'})
        }
    },

    /* Function for Get All Chat */
    async getChat(req,res){
        room_Id = req.params.room_Id;
        friendId = req.params.FriendId;
        if(!room_Id && !friendId) return res.status(401).send({code:401,status:"failed",msg:"Room Id and friend Id is required"})
        try{
            let seenMessage = await queryModule.updateAllchat(room_Id,friendId)
            let chat = await queryModule.getAllChat(room_Id);             
            return res.status(200).send({code:200,status:'success', data:chat})
        }catch(err){
            return res.status(422).send({code:422,status:'failed to get chat',message : err.message})
        }
    },


    /* Function for delete message */
    async deleteMessage(req,res){
        req.user.msg_id = req.params.id
        // if(!id) return res.status(422).send({code:422,status:"failed",msg:"id was missing"})

        try{
            let getMessage = await queryModule.getOneMessage(req.user)
            getMessage = JSON.parse(JSON.stringify(getMessage));            
            if(!getMessage) return res.status(422).send({code:422,status:'failed',msg:"Message not exist"})
            await queryModule.deleteOneMessage(getMessage._id);       
            let getChat = await queryModule.getDeletedMessage(getMessage._id)
            return res.status(200).send({code:200,status:'success',msg:"delete successfully",data:getChat})


        }catch(err){
            console.log("error :",err)
            return res.status(422).send({code:422,status:'failed',msg:"Message not exist"})

        }
    },


    /* Funtion for Update Message */
    async updateMessage(req,res){

        req.user.msg_id = req.params.id
        req.user.message = req.body.message;
        if(!req.user.msg_id) return res.status(422).send({code:422,status:"failed",msg:"id was missing"})
        if(!req.user.message) return res.status(422).send({code:422,status:"failed",msg:"message was missing"})

        try{
            let userData = await queryModule.getUser({Email:req.user.Email})
            let getMessage = await queryModule.getOneMessage(req.user);
            console.log("getMessage",getMessage)
            if(!getMessage) return res.status(422).send({code:422,status:'failed',msg:"Message not exist"})            
            let updateMessage = await queryModule.updateOneMessage(req.user);
            let msg = await queryModule.findOneMessage(req.user.msg_id);
            return res.status(200).send({code:200,status:'success',msg:"update Message successfully",data:msg})
        }catch(err){
            console.log("error :",err)
            return res.status(422).send({code:422,status:'failed',msg:err.message})
        }
    }
}