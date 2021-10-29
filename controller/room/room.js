const queryModule = require('../../model/query/query');
const userModel = require('../../model/user/user');
const groupModel = require('../../model/group/group');
const chatModel = require('../../model/chat/chat');
const roomModel = require('../../model/room/room');
const { ObjectId } = require('bson');

module.exports = {


    /*function for Adding friend */
    async addFriend(req,res){
        Email = req.body.Email;
        try{

            let friendData = await queryModule.getUser({Email:Email});
            friendData = JSON.parse(JSON.stringify(friendData))
            req.user._id = JSON.parse(JSON.stringify(req.user._id))

            req.user.__id = friendData._id
            let friendshipExist = await queryModule.IsFriendshipExist(req.user); 
            friendshipExist = JSON.parse(JSON.stringify(friendshipExist))
            if(!friendshipExist){
                data = {
                    To_user :  friendData._id,
                    From_user : req.user._id,
                    Last_Message : Date.now(),
                    Created_At : Date.now(),
                    Sender_Id : req.user._id,
                    Response_Time : Date.now()
                }
                let addFriend = await queryModule.saveData(data);
                addFriend = JSON.parse(JSON.stringify(addFriend))
                addFriend.First_Name = req.user.First_Name;
                addFriend.Last_Name = req.user.Last_Name;
                // await Is_Seen
                let msg = {
                    User_Id:addFriend.Sender_Id,
                    Room_Id:addFriend._id,
                    Message:addFriend.LastMessage
                  }
                  await chatModel(msg).save();
                return res.status(200).send({code:200,status:'successs',data: addFriend})
            }else if (friendshipExist.Status === "Block"){
                return res.status(200).send({code:200,status:'success',msg:"First Unblock the User."})
            }else if(friendshipExist.Status === "Denied"){
                await queryModule.updateAddFriend(friendshipExist._id, req.user._id);
                let data = await queryModule.IsFriendshipExist(req.user);
                data = JSON.parse(JSON.stringify(data))
                data.First_Name = req.user.First_Name;
                data.Last_Name = req.user.Last_Name;
                console.log("my data ::::",data)
                return res.status(200).send({code:200,status:'successs',data:data})
            }else if(friendshipExist.Status === "Add"){
                await queryModule.updateAddFriend(friendshipExist._id,req.user._id)
                let data = await queryModule.IsFriendshipExist(req.user);
                data.First_Name = req.user.First_Name;
                data.Last_Name = req.user.Last_Name;
                return res.status(200).send({code:200,status:'successs',data:data})   
            }else{
                return res.status(422).send({code:422,status:'failed'})
            }
        }catch(err){
            return res.status(422).send({code:422,status:'failed',msg : err.message})
        }
    },

    /*function for getting all friend*/
    async getFriend(req,res){
        try{
            let userData = await queryModule.getUser({Email:req.user.Email});
            userData = JSON.parse(JSON.stringify(userData))

            let friendshipExist = await queryModule.getFriendList(req.user._id);

            // console.log("friendshipExist ",friendshipExist)
            friendshipExist = JSON.parse(JSON.stringify(friendshipExist))         
            let realFriends = [];
            for (let i = 0 ; i<friendshipExist.length;i++){
                const id = userData._id === friendshipExist[i].From_user ? friendshipExist[i].To_user : friendshipExist[i].From_user
                const friendData = await queryModule.getUser({_id:id})
                friendshipExist[i].First_Name = friendData.First_Name;
                friendshipExist[i].Last_Name = friendData.Last_Name;
                friendshipExist[i].Email = friendData.Email; 
                if(friendshipExist[i].Sender_Id===userData._id){
                    if(friendshipExist[i].Status === "Requested"){
                        friendshipExist[i].Status = "Pending"
                    }
                }  
                if(friendshipExist[i].Status!=="Block"){
                    let msg = await queryModule.getLastMessage(friendshipExist[i]._id);
                    if(msg){
                        friendshipExist[i].LastMessage = msg.Message;
                        friendshipExist[i].LastMessageTime = msg.Created_At;
                        friendshipExist[i].Last_Message_Seen = msg.Is_Seen;
                         
                    }
                    realFriends.push( friendshipExist[i])
                }     
            }
            return res.status(200).send({code:200,status:'successs',data:realFriends})
            }catch(err){
                console.log(err)
                return res.status(422).send({code:422,status:'failed',msg:err.message})
            }
    },

    /*function for accepting friend request */
    async acceptFriend(req,res){
        let id = req.body.id;
        let accepted = req.body.accepted;
        console.log("Accepted" ,req.body)
       try{        
            let userData = await queryModule.getUser({Email:req.user.Email});
            console.log("userData",userData)

            userData = JSON.parse(JSON.stringify(userData))
            req.user.__id = id;
            let friendsRqst = await queryModule.IsFriendshipExist(req.user);
            console.log("friendsRqst",friendsRqst) 
           friendsRqst = JSON.parse(JSON.stringify(friendsRqst))
            if(accepted){
                if(friendsRqst.Status === "Requested"){
                    await queryModule.acceptFriendRquest(friendsRqst._id, "Friend")
            
                }else{
                    await queryModule.acceptFriendRquest(friendsRqst._id, "Friend");

                }
            }
            else{
                 await queryModule.acceptFriendRquest(friendsRqst._id,"Denied")
            }
            let data = await queryModule.areFriends(friendsRqst._id);
            // let data = await roomModel.findOne({_id:friendsRqst._id})
            return res.status(200).send({code:200,status:'successs',data})

       }catch(err){
           console.log(err);
           return res.status(422).send({code:422,status:'failed',msg:err.message})
       }
    },

    /* Function for unfriend */
    async unfriend(req,res){

        let room_Id = req.params.roomId
        room_Id = JSON.parse(JSON.stringify(room_Id))
        try{
            let userData = await queryModule.getUser({Email:req.user.Email});
            userData = JSON.parse(JSON.stringify(userData))

            let areFriends = await queryModule.areFriends(room_Id);
            areFriends = JSON.parse(JSON.stringify(areFriends))
            if(areFriends){
                await queryModule.unfriend(areFriends);
                return res.status(200).send({code:200,status:'success',data:areFriends})
            }


        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:'failed',msg:err.message})
        }



    },

    /* Function for Block User */
    async blockUser(req,res){
        let do_block = req.body.do_block;
        let roomId = req.params.roomId
        try{
            let userData = await queryModule.getUser({Email:req.user.Email});
            userData = JSON.parse(JSON.stringify(userData))
            let areFriends = await queryModule.areFriends(roomId);
            if(areFriends){
                if(do_block === true){
                    await queryModule.blockUser(areFriends)
                    return res.status(200).send({code:200,status:'success'})
                }else{
                    if(areFriends.Status==="Block"){
                        await queryModule.unfriend(areFriends);
                        return res.status(200).send({code:200,status:'success'})
                    }
                }   
            }
        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:'failed',msg:err.message})
        }
    },

    /* Function for getting Block List */
    async getBlockList(req,res){  
        try{
            myData = await queryModule.getUser({_id:req.user._id});
            myData = JSON.parse(JSON.stringify(myData))
            let blockList = await queryModule.getBlockList(req.user._id)
            blockList = JSON.parse(JSON.stringify(blockList))
            console.log("Block list",blockList)
            for(let i = 0; i<blockList.length;i++){
                if(myData._id===blockList[i].To_user){
                    let userData = await queryModule.getUser({_id:blockList[i].From_user})
                   
                    blockList[i].First_Name = userData.First_Name;
                    blockList[i].Last_Name = userData.Last_Name;

                }else{
                    let userData = await queryModule.getUser({_id:blockList[i].To_user})
                    blockList[i].First_Name = userData.First_Name;
                    blockList[i].Last_Name = userData.Last_Name;
                }
            }
            return res.status(200).send({code:200,status:"success", data : blockList})
        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:"failure",msg:err.message})
        }
    },

    /* Function for getting the list of friends */
    async getfriendList(req,res){
        try{

            let myFriends = await queryModule.getOnlyFriendList(req.user._id);
            req.user._id = JSON.parse(JSON.stringify(req.user._id))
            myFriends = JSON.parse(JSON.stringify(myFriends));

            for(let i = 0 ;i<myFriends.length;i++){
                const id = req.user._id == myFriends[i].From_user ? myFriends[i].To_user : myFriends[i].From_user
                const friendData = await queryModule.getUser({_id:id});
                myFriends[i].First_Name = friendData.First_Name;
                myFriends[i].Last_Name = friendData.Last_Name; 
                myFriends[i].ProfileImage = friendData.ProfileImage;
            }
            return res.status(200).send({code:200,status:"success",data:myFriends});
        }catch(err){
            console.log("error getfriendList API is :")
            return res.status(422).send({code:422,status:"failed",msg:err.message});
        }

    },


    async createGroup(req,res){

        myUserId = req.body.UserId;
        gn = req.body.GroupName;

        //  data.groupName , data.UserId
        try{
            let data = {
                Group_Name:gn,
                Users : [
                    {
                        User_Id: myUserId,
                        User_Type:'Admin',
                    }
                ]
            }
            let makingGroup = await groupModel(data).save();
            console.log("creating group successfulll",makingGroup);
            return res.status(200).send({code:200,status:"success",data:makingGroup});
        }catch(err){
            console.log("error for creating group :",err)
            return res.status(422).send({code:422,status:"failed",data:err.message});    
        }

    },

    async addUserToGroup(req,res){
        myId = req.body.myId
        groupId = req.body._id;
        friendId = req.body.UserId;
        try{
            let haveAccess = await groupModel.findOne({_id: groupId},{Users: {$elemMatch: {User_Id:myId, User_Type:"Admin"}}});
            console.log("show me admin data",haveAccess.Users.length);
            if(haveAccess.Users.length==0) return res.status(422).send({code:422,status:'failed',msg:"unauthorize"})
            
            let isMemberExist = await groupModel.find({Users: {$elemMatch: {User_Id:friendId, User_Type:"User"}}})
            isMemberExist = JSON.parse(JSON.stringify(isMemberExist))
            if(isMemberExist) return res.status(200).send({code:422,status:"failed",msg:"Person already exist in group!"})
            let updatedData = await groupModel.updateOne({_id:groupId},{$addToSet : {Users: [{User_Id:friendId}]}})
    
            return res.status(200).send({code:200,status:"success",data:updatedData});

        }catch(err){
            console.log("error for adding people in group API",err)
            return res.status(422).send({code:422,status:"failed",msg:err.message})
        }
    },

    async removeUserFromGroup(req,res){
        myId = req.body.myId
        groupId = req.body._id;
        friendId = req.body.UserId;
        console.log("compare both ",friendId," ",myId)

        try{
            let haveAccess = await groupModel.findOne({_id: groupId},{Users: {$elemMatch: {User_Id:myId}}});
            if(haveAccess.User_Type === "Admin" || myId=== haveAccess.User_Id){
                let isMemberExist = await groupModel.find({Users: {$elemMatch: {User_Id:friendId, User_Type:"User"}}})
                isMemberExist = JSON.parse(JSON.stringify(isMemberExist))
                console.log("isMemberExist ::",isMemberExist[0].Users)
                if(!isMemberExist) return res.status(200).send({code:422,status:"failed",msg:"Person do not exist in group!"})
                console.log("isMemberExist ::",isMemberExist)
                let updatedData = await groupModel.updateOne({_id:groupId, "Users.User_Id":friendId},{$set : {"Users.$.User_Status":"Remove"}})
                console.log("adding people to group successfulll",updatedData);
                return res.status(200).send({code:200,status:"success",data:updatedData});
            }else{
                return res.status(422).send({code:422,status:'failed',msg:"unauthorize"})
            }
        }catch(err){
            console.log("error for removing from group is ",err)
            return res.status(422).send({code:422,status:'failed',msg:err.message});
        }

    },

    async test(req,res){
        
        let data = req.body.User_Id
        // data = ObjectId(data);
        console.log("data in test API", data)
        try{

            let is = await roomModel.aggregate([
                {
                    $match:{$and :
                        [
                            {
                                $or : [
                                    {"To_user":data} , 
                                    {"From_user":data}
                                ]
                            },
                            {
                                $or : [
                                    {"Status" :"Requested"} , 
                                    {"Status" :"Friend"}
                                ]
                            }
                        ]
                    }
                        
                },
                {
                    "$project":{
                        "To_user":{
                            "$toObjectId":"$To_user",
                        },
                        "From_user":{
                            "$toObjectId":"$From_user",
                        },
                        "_id":{
                            "$toString":"$_id"
                        },
                        Status:1,
                        Response_Time:1,
                        Created_At:1,
                        Is_Seen:1,
                        Last_Message:1,
                        Sender_Id:1
                    }
                },
                
                {
                    $lookup: {
                        from: 'users',
                        localField: "To_user",
                        foreignField: '_id',
                        as: 'data1'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "From_user",
                        foreignField: '_id',
                        as: 'data2'
                    }
                },
                
                {
                    $lookup:{
                        from:'chats',
                        localField:'_id',
                        foreignField:'Room_Id',
                        as:'data3'
                    }
                },
                { $addFields: {
                    "data4": { "$slice": ["$data3", -1] },
                  }
                },
                
                {$unwind:"$data4"},
                {$unwind:"$data1"},
                {$unwind:"$data2"},

                
                {
                    $project:{
                        _id:1,
                        To_user:1,
                        From_user:1,
                        Sender_Id:1,
                        Response_Time:1,
                        Created_At:1,
                        Is_Seen:1,
                        Last_Message:1,
                        First_Name:{
                            $cond:
                                {
                                    if:{ $eq:['$To_user',ObjectId(data)]},then:{$concat:["$data2.First_Name"," ","$data2.Last_Name"] } ,else: {$concat:["$data1.First_Name"," ","$data1.Last_Name"] }
                                }
                        },
                        Status :{
                            $cond:{
                                if:{
                                    $and:[
                                        {$eq:['$Sender_Id',data]},
                                        {$eq:["$Status","Requested"]}
                                    ]
                                },then:"Pending",else:"$Status"
                            }
                        },
                        // data:'$data4'
                        
                    }
                },
                { "$sort": { Last_Message: -1 }}
            ])
            
            
        console.log("test chal rha hai kya ",is.length);
        return res.send(is)
        }catch(err){
            console.log(err)
            res.send(err)
        }
    },

    async test2(req,res){
        let data = req.body.User_Id;

        try{
            let is = await roomModel.aggregate([

            {
                $match:{$and :
                    [
                        {
                            $or : [
                                {"To_user":data} , 
                                {"From_user":data}
                            ]
                        },
                        {
                            $and : [
                                {"Sender_Id":data} , 
                                {"Status" :"Block"}
                            ]
                        }
                    ]
                }
                    
            },{
                "$project":{
                    "To_user":{
                        "$toObjectId":"$To_user",
                    },
                    "From_user":{
                        "$toObjectId":"$From_user",
                    },
                    "_id":{
                        "$toString":"$_id"
                    },
                    Status:1,
                    Response_Time:1,
                    Created_At:1,
                    Is_Seen:1,
                    Last_Message:1,
                    Sender_Id:1
                }
            },
            {
                $lookup:{
                    from:'users',
                    localField:'To_user',
                    foreignField:'_id',
                    as:'To_user_details'
                }
            },
            {
                $unwind:"$To_user_details"
            },
            {
                $lookup:{
                    from:'users',
                    localField:'From_user',
                    foreignField:'_id',
                    as:'From_user_details'
                }
            },
            {
                $unwind:"$From_user_details"
            },
            {
                $project:{
                    _id:1,
                    To_user:1,
                    From_user:1,
                    Sender_Id:1,
                    Response_Time:1,
                    Created_At:1,
                    Name:{
                        $cond:
                            {
                                if:{ $eq:['$To_user',ObjectId(data)]},then:{$concat:["$From_user_details.First_Name"," ","$From_user_details.Last_Name"] } ,else: {$concat:["$To_user_details.First_Name"," ","$To_user_details.Last_Name"] }
                            }
                    },
                    Status :1
                    
                }
            }
            ])
            res.send(is)
        }catch(err){
            console.log(err);
        }
    },

    async test3(req,res){
        let data = req.body.User_Id;
        data = ObjectId(data);
        console.log("Data in test API ",ObjectId(data));
        try{
            // let is = await roomModel.aggregate([
                
            // {
            //     $match:{$and :
            //         [
            //             {
            //                 $or : [
            //                     {"To_user":data} , 
            //                     {"From_user":data}
            //                 ]
            //             },
            //             {
            //                 "Status" :{$ne:"Block"}
            //             }
            //         ]
            //     }
                    
            // }
            // ,{
            //     "$project":{
            //         "To_user":{
            //             "$toObjectId":"$To_user",
            //         },
            //         "From_user":{
            //             "$toObjectId":"$From_user",
            //         },
            //         "_id":{
            //             "$toString":"$_id"
            //         },
            //         Status:1,
            //         Response_Time:1,
            //         Created_At:1,
            //         Is_Seen:1,
            //         Last_Message:1,
            //         Sender_Id:1
            //     }
            // },
            // {
            //     $lookup:{
            //         from:'users',
            //         localField:'To_user',
            //         foreignField:'_id',
            //         as:'To_user_details'
            //     }
            // },
            // {
            //     $unwind:"$To_user_details"
            // },
            // {
            //     $lookup:{
            //         from:'users',
            //         localField:'From_user',
            //         foreignField:'_id',
            //         as:'From_user_details'
            //     }
            // },
            // {
            //     $unwind:"$From_user_details"
            // },
            // {
            //     $lookup:{
            //         from:'chats',
            //         localField:'_id',
            //         foreignField:'Room_Id',
            //         as:'chat'
            //     }
            // },
            // { $addFields: {
            //     "chatDetails": { "$slice": ["$chat", -1] },
            //   }
            // },
            // {$unwind:'$chatDetails'},
            // {
            //     $project:{
            //         _id:1,
            //         To_user:1,
            //         From_user:1,
            //         Sender_Id:1,
            //         Response_Time:1,
            //         Created_At:1,
            //         Name:{
            //             $cond:
            //                 {
            //                     if:{ $eq:['$To_user',ObjectId(data)]},then:{$concat:["$From_user_details.First_Name"," ","$From_user_details.Last_Name"] } ,else: {$concat:["$To_user_details.First_Name"," ","$To_user_details.Last_Name"] }
            //                 }
            //         },
            //         Status :1,
            //         Last_Message:"$chatDetails.Message",
            //         Last_Message_Time: "$chatDetails.Created_At",
            //         Last_Message_Seen: "$chatDetails.Is_Seen"
                    
            //     }
            // },
            // ])
            let iss = await groupModel.aggregate([
                {
                    $match:{$and:[
                        {'Users.User_Id' :data },
                        {'Users.Is_Remove':false}
                    ]}
                        
                },
                {
                    $unwind: '$Users'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'Users.User_Id',
                        foreignField: '_id',
                        as: 'data'
                    }
                },
                {
                    $unwind: '$data'
                },
                

                {$group:
                    {
                      _id:'$_id',
                      "Group_Name":{ "$first": "$Group_Name" },
                      'Is_delete':{'$first':"$Is_delete"},
                      'Group_Creater_Id':{'$first':"$Is_delete"},
                      'createdAt':{'$first':"$createdAt"},
                      "ProfileImage":{'$first':"$ProfileImage"},
                      'Users':{
                          $push:{
                            "User_Id":"$Users.User_Id",
                            'myId':'$data._id',
                            'User_Status':'$Users.User_Status',
                            'Is_Remove':'$Users.Is_Remove',
                            'User_Type':'$Users.User_Type',
                            'First_Name': '$data.First_Name',
                            'Last_Name': '$data.Last_Name',
                            'createdAt':'$Users.createdAt',
                            'removedAt':'$Users.removedAt',
                            '_id':'$Users._id'  
                          }
                      }
                  }
                },



                // {
                //     $lookup:{
                //         from:'groupchat',
                //         localField:'_id',
                //         foreignField:'Group_Id',
                //         as:'data2'
                //     }
                // },
                // {unwind : '$data2'},
                // {
                //     $project:{
                //         _id:1,
                //         // Last_Message:'$data2.Message',
                //         // Last_Message_Time:"$data2.Created_At",
                //         // Last_Message_Seen:'$data2.Is_Seen',
                //     }
                // }
                
            ])

            // console.log("is",iss.length);
            // const data1 = [...is,...iss]
            return res.status(422).send({code:422,status:'failed',data:iss})
        }catch(err){
            console.log(err)
        } 
        
        
    },

    async test4(req,res){
        data = req.body.User_Id;
        console.log(data)
        try{
            // let a = await userModel.aggregate([
            //     {$match:{'_id':ObjectId(data)}},
            //     {
            //         $project:{
            //             '_id':data
            //         }
            //     },
            //     {
            //         $lookup:{
            //             from:'rooms',
            //             localField:'_id',
            //             foreignField:'To_user',
            //             as:'data'
            //         }
            //     },
            //     // {$unwind:'$data'},

            //     {
            //         $lookup:{
            //             from:'rooms',
            //             localField:'_id',
            //             foreignField:'From_user',
            //             as:'data2'
            //         }
            //     },
            //     // {$unwind:'$data2'}
            // ])

            let a = await userModel.aggregate([
                {$match:{'_id':{$ne:ObjectId(data)}}},
                {
                    $project:{
                        '_id':{'$toString':'$_id'},
                        First_Name:1,
                        Last_Name:1,
                        'To_user':ObjectId(data)
                    }
                },
                {
                    $lookup:{
                        from:'rooms',
                        localField:'_id',
                        foreignField:'To_user',
                        as:'data'
                    }
                },
                { $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },
                // {
                //     $project:{
                //         id:1,
                //         First_Name:1,
                //         Last_Name:1,
                //         data:{
                //             $cond: { if: { $eq: ['$data', {}] }, then: null, else: '$data' }
                //         }
                //         // From_user:'$data.From_user',
                //         // data:"$data"
                //     }
                // }
                // {
                //     $lookup:{
                //         from:'rooms',
                //         localField:'_id',
                //         foreignField:'From_user',
                //         as:'data2'
                //     }
                // },
                // {$unwind:'$data2'}
            ])
            console.log(a.length)
            return res.send(a)
        }catch(err){
            console.log(err)
        }
    }

}
