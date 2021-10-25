const queryModule = require('../../model/query/query');
const groupModel = require('../../model/group/group');

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
        id = req.body.id;
        ig = req.body.ig;
        console.log("ig", ig , "iiiii ",id)
        try{
            let is = await groupModel.find({Users: {$elemMatch: {User_Id :id, User_Status: {$ne : "Remove"}}}})
        console.log("test chal rha hai kya ",is);
        return res.send(is)
        }catch(err){
            console.log(err)
            res.send(err)
        }
    }

}
