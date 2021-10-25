const userModel = require('../user/user');
const chatModel = require('../chat/chat');
const roomModel = require('../room/room');
const groupModel = require('../group/group');

const queryModule = {}

/* Function to find User deatils */
queryModule.getUser = async function(data){
    return await userModel.findOne(data)
}

/* Function to Save User details */ 
queryModule.saveUser = async function(data){
    return await new userModel(data).save();
}

/* Method for updating Payment Customer ID */
queryModule.saveCustomerId = async function(Email,id){
    return await userModel.updateOne({Email:Email},{$set:{Payment_ID:id}})
}

/* Function to Save Chat Message */
queryModule.saveChatMessage = async function(data){
    return await new chatModel(data).save();
}

 /* Function to get All User Names */
queryModule.getUserByName = async function(data){
    return await userModel.find({$and :[{First_Name : new RegExp(data.name,'i')},{_id:{$ne:data._id}},{Blocked_By_Admin:{$ne:true}} ]}).skip(data.skip).limit(data.limit)
}

/* Function Use to find room in getalluser API */
queryModule.findRoomInAllUser = async function(myId,userId){
    return await roomModel.findOne({$or :
        [
            {
                $and : [
                    {To_user:myId} , 
                    {From_user:userId}
                    

                ]
            },
            {
                $and : [
                    {To_user:userId} , 
                    {From_user:myId}
                ]
            }
        ]
    })
}

/* Function for Uploading Image */
queryModule.uploadImage = async function(id,path){
    return await userModel.updateOne({_id:id},{$set:{ProfileImage:path}})
}

/* Function for update self details  */
queryModule.updateUserDetails = async function(id,data){
    return await userModel.updateOne({_id:id},{$set:data})
}

/* Method for Update Password for user */
queryModule.updateResetPassword = async function(id,password){
    return await userModel.updateOne({_id:id},{Password:password})

}

/* Method to find friend */
queryModule.IsFriendshipExist = async function(data){

    return await roomModel.findOne({$or :[
        {$and : [{To_user:data._id} , {From_user:data.__id}]},
        {$and : [{To_user:data.__id} , {From_user:data._id}]}

    ]})
}

/* Method for Adding Friend */
queryModule.saveData = async function(data){
    return await roomModel(data).save();
}

/* Method for update add friend data */
queryModule.updateAddFriend = async function(data, id){
    console.log("idididi",id)
    return await roomModel.updateOne({_id:data},{$set:{Status:"Requested", Response_Time:Date.now(),Sender_Id:id , Is_Seen:false,Last_Message : Date.now(),Created_At : Date.now()}})
}
   
// /* Method for getting friend list */
queryModule.getFriendList = async function(data){
    return await roomModel.find({$and :
        [
            {
                $or : [
                    {To_user:data} , 
                    {From_user:data}
                ]
            },
            {
                $or : [
                    {Status :"Requested"} , 
                    {Status :"Friend"}
                ]
            }
            

        ]
    }).sort( { Last_Message: -1 } )
}

// queryModule.getFriendList = async function(data){
//     return await roomModel.aggregate([
//         {
//           $match: {$and :
//           [
//               {
//                   $or : [
//                       {To_user:data} , 
//                       {From_user:data}
//                   ]
//               },
//               {
//                   $or : [
//                       {Status :"Requested"} , 
//                       {Status :"Friend"}
//                   ]
//               }
              
  
//           ]
//         }
//         },
//         {
//             $project: {
//              To_user: '$To_user', From_user: '$From_user', Status: '$Status',Sender_Id:"$Sender_Id",Last_Message:"$Last_Message", Response_Time:"$Response_Time", Is_Seen:"$Is_Seen"
//             }
//         },
//         {
//           $sort: { Last_Message: -1 }
//         }
//       ])
// }

/* Method for accepting friend request */
queryModule.acceptFriendRquest = async function(id, action){
    return await roomModel.updateOne({_id:id},{$set:{Status:action, Is_Seen:true}}) 
}

/* Method to check room friendship status */
queryModule.areFriends = async function(data){
    return await roomModel.findOne({_id:data})
}
/* Method to unfriend */
queryModule.unfriend = async function(data){
    return await roomModel.updateOne({_id:data._id},{$set:{Status:"Add", Sender_Id:data.Sender_Id}})
}

/* Method for block the user */
queryModule.blockUser = async function(data, id, Action ){
    return await roomModel.updateOne({_id:data._id},{$set:{Status:Action, Sender_Id:id}})
}

/* Method for getting Block list */
queryModule.getBlockList = async function(data){
    return await roomModel.find({$and :
        [
            {
                $or : [
                    {To_user:data} , 
                    {From_user:data}
                ]
            },{
                $and : [
                    {Sender_Id:data} , 
                    {Status:"Block"}
                ]
            }
        ]
    })
}

/* Method for getting last message*/
queryModule.getLastMessage = async function(data){
    return await chatModel.findOne({$and :
        [
            {Room_Id:data},
            {Deleted:false}
        ]}).sort({_id:-1}).limit(1)
}

/* Method for getting All Chat*/
queryModule.getAllChat = async function(data){
    return await chatModel.find({$and :
        [
            {Room_Id:data},
            {Deleted:false}
        ]}).sort({Created_At: 1})
}

/* Method for getting one particular message*/
queryModule.getOneMessage = async function(data){
    return await chatModel.findOne({$and :
        [
            {_id:data.msg_id},
            {User_Id: data._id}
        ]})
}

/* Method for deleting One particular message*/
queryModule.deleteOneMessage = async function(data){
    return await chatModel.updateOne({_id:data},{$set:{Deleted:true}})
}

/* Method for getting deleted message*/
queryModule.getDeletedMessage = async function(data){
    return await chatModel.findOne({_id:data})
}

/* Method for update  message*/
queryModule.updateOneMessage = async function(data){
    return await chatModel.updateOne({$and :
        [
            {_id:data.msg_id},
            {User_Id:data._id}
        ]},{$set:{Message:data.message}})
}

/* Method for finding one message*/
queryModule.findOneMessage = async function(data){
    return await chatModel.findOne({_id:data})
}

/* Method for updating all the messages */
queryModule.updateAllchat = async function(room_Id,friendId){
    return await chatModel.updateMany({$and :
        [
            {Room_Id:room_Id},
            {User_Id:friendId}
        ]},{$set:{Is_Seen:true}})
}

queryModule.updateSeenMessage = async function(msgId){
    return await chatModel.updateOne({_id:msgId},{$set:{Is_Seen:true}});
}

/* Method for getting friend list in alphabetically sorted order */
queryModule.getOnlyFriendList = async function(data){
    return await roomModel.find({$and :
        [
            {
                $or : [
                    {To_user:data} , 
                    {From_user:data}
                ]
            },
            {
                $or : [
                    {Status :"Requested"} , 
                    {Status :"Friend"}
                ]
            }
            

        ]
    }).sort( { Created_At: -1 } )
},

/* Method for checking friend in the group */
queryModule.checkFriendIsInGroup = async function(data){
    return await groupModel.findOne({_id: data.GroupId},{Users: {$elemMatch: {User_Id:data.friendId}}})
}

queryModule.isAdmin = async function(data){
    return await groupModel.findOne({_id: data.GroupId},{Users: {$elemMatch: {User_Id:data.myId, User_Type:"Admin"}}});
}

queryModule.addToGroup = async function(data){
    return await groupModel.updateOne({_id:data.GroupId},{$addToSet : {Users: data.Users}})
}

queryModule.createGroup = async function(data){
    return await groupModel(data).save();
}

queryModule.removeFromGroup = async function(data){
    return await groupModel.updateOne({_id:data.GroupId, "Users._id":data.friendId},{$set : {"Users.$.User_Status":"Remove"}})
}

queryModule.getGroupDetails = async function(id){
    return await groupModel.findOne({_id:id});
}

queryModule.getGroupList = async function(data){
    return  await groupModel.find({Users: {$elemMatch: {User_Id :data, User_Status: {$ne : "Remove"}}}})
}

// queryModule.getGroupList = async function(data){
//     console.log("data in group list query ::",data)
//     return await groupModel.aggregate([
//         // {Users: {$match: {$ne :{User_Status:"Remove"}}}},
//         {$match: {"User_Id" :data}}
//     ])
// }


module.exports = queryModule;


/**

 */