const socket = require('socket.io')
const roomModel = require('./model/room/room');
const chatModel = require('./model/chat/chat');
const queryModule = require('./model/query/query');
const io = require('./index')


exports = module.exports = function(io){

  let onlineUserList = [];

     /* sockets method */
 io.on('connection', socket => {
    console.log('user connected');
  
    /* Method To Join Room */
    socket.on('joinRoom', (Data) => {
      console.log("DATA join here",Data)
      socket.join(Data.Room_Id);
      
    });
  
    /* Method For Accept Friend */
    socket.on('acceptfriend',(data)=>{
      let dataa ={Data : data.To_user, Status:data.Status}
      io.to(data.Sender_Id).emit('acceptFriendResponse',dataa);
    })
  
    /* Method For Unfriend */
    socket.on('Unfriend',(data)=>{
      queryModule.areFriends(data.Room_Id).then(response=>{
        if(response){
          response = JSON.parse(JSON.stringify(response));
          queryModule.unfriend(response).then(data=>{
            let mydata = {Room_Id:response._id,Status:"Add"}
            io.to(response.From_user).to(response.To_user).emit('UnfriendResponse',mydata);
          }).catch(err=>{
            console.log(err)
          }) 
        }
      }).catch(err=>{
        console.log(err)
      }) 
    })
  
    /* Method For Block and Unblock User */
    socket.on('BlockUnblock',(data)=>{
      console.log("Data that is coming in block and unblock socket event ::",data);
      queryModule.areFriends(data.Room_Id).then(response=>{
        if(response){
          response = JSON.parse(JSON.stringify(response));
          if(data.Status){
            let myData = {Room_Id : response._id,Status:"Block"}
            queryModule.blockUser(response,data.MyId, myData.Status).then(data=>{
              io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
            }).catch(err=>{
              console.log("err :",err)
            })
          }else{
            let myData = {Room_Id : response._id,Status:"Add"}
            queryModule.blockUser(response,data.MyId, myData.Status).then(data=>{
              io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
            }).catch(err=>{
              console.log("err :",err)
            })
          }
        }
      }).catch(err=>{
        console.log("error is :",err)
      })
    })
    
    /* Method For Seen Message */
    socket.on('sendMsgSeen',(data)=>{
      console.log("seen ka Data :",data)
      
      queryModule.updateSeenMessage(data.MessageId).then(Data=>{
        // let chatData = chatModel.findOne({_id:data.MessageId});
        data.Is_Seen = true
        io.to(data. UserId).emit("sendMsgSeenResponse",data)
      })
  
    })
  
    /* Method for Add friend */
    socket.on('addfriend', (Data)=>{
      console.log("DATATA is here for adding friend ",Data);
        let id= Data.data.Sender_Id !== Data.data.From_user? Data.data.From_user: Data.data.To_user
        Data.data.Status = "Requested"
        io.to(id).emit('addFriendResponse', Data);
    })
  
    /* Method for giving Active Status*/  
    socket.on('online',(data)=>{
      console.log("List of online user at present :", onlineUserList);
      let myIndex = onlineUserList.indexOf(data.UserId);
      if(myIndex == -1){
        onlineUserList.push(data.UserId);
        
      }
      for(let i= 0 ; i<onlineUserList.length;i++){
        console.log(onlineUserList[i])
        io.to(onlineUserList[i]).emit("onlineResponse",onlineUserList);
      }
    })

    /* Method for giving Unactive Status */
    socket.on("offline",(data)=>{
      console.log("heyyyyyyyyyyyyyyyyy i am offline")
      let myIndex = onlineUserList.indexOf(data.UserId);
      console.log("Data in offline socket:::::::::::::::::::", data)
      if (myIndex !== -1) {
        onlineUserList.splice(myIndex, 1);
      }
      console.log("Users in online array after going offline : ",onlineUserList)
      for(let i= 0 ; i<onlineUserList.length;i++){
        console.log("Users in online array after going offline2 : ",onlineUserList)
        io.to(onlineUserList[i]).emit("offlineResponse",onlineUserList);
      }
    })

    /*Method for Showing Typing in chat*/
    socket.on('typing',(data)=>{
      console.log("DATATATAT of typing",data)
      io.to(data.UserId).emit('typingResponse',data);
    })
  
    /* Method for chatting */
    socket.on('messagedetection', function (msg) {
      console.log('messagedetection', msg);
    
      chatModel(msg).save().then(data=>{
        io.to(msg.Room_Id).emit('updateMessages', data); 
        roomModel.updateOne({_id: msg.Room_Id},{$set :{Last_Message: Date.now()}}).then(data=>{
          console.log("data: ",data)
        }).catch(err=>console.log("error: ",err))
      }).catch(err=>{
        console.log(err)
      });
  
      socket.on('leave', Room_Id => {
        socket.leave(Room_Id);
        console.log('left ' , Room_Id);
      });
  
    });
  
  
    /* Method for Deleting Message */
    socket.on('deleteMessage',(data)=>{ 
      io.to(data.Room_Id).emit('deleteMessageResponse',data._id);
    })
  
    /* Method for Updating Message */
    socket.on('updateMessage',(data)=>{
      
      Data = {id:data._id,msg:data.Message}
      io.to(data.Room_Id).emit('updateMessageResponse',Data);
    })
  
    /* Method for leaving Socket Room */
    socket.on('leave', user => {
      socket.leave(user.Room_Id);
      console.log('left ' , user.Room_Id);
    });
  

    /*Method for chatting in the group */
    socket.on('chatOnGroup',msg=>{

      chatModel(msg).save().then(data=>{
        queryModule.getUser({_id:msg.UserId}).then(data2=>{
          data.First_Name = data2.First_Name;
          data.Last_Name = data2.Last_Name;
          io.to(msg.Room_Id).emit('chatOnGroupResponse', data);
          
        }).catch(err=>console.log("error: ",err)) 
      }).catch(err=>{
        console.log(err)
      });
  
      socket.on('leave', Room_Id => {
        socket.leave(Room_Id);
        console.log('left ' , Room_Id);
      });

    })

    /* Method For Disconnecting Socket */
    socket.on('disconnect', function (data) {
      socket.leave(data.UserId);
    });


    /********-----Sockets for GROUPS-----*******/

    /* Method for creating group for chat*/
    socket.on('createGroup',Data=>{

      console.log("DAta is ",Data)
      AdminDetails = {
        User_Id: Data.myUserId,
        User_Type:"Admin",
      }

      Data.Users.push(AdminDetails);
      
      let myGroup = {
        Group_Name:Data.Group_Name,
        Users : Data.Users,
        Group_Creater_Id: Data.myUserId
      }
      queryModule.createGroup(myGroup).then(data=>{
        
      // console.log("creating group successfulll",data);
        for (let i = 0 ; i<data.Users.length; i++){
          console.log("Data.Users[i].User_Id::::::",Data.Users[i].User_Id)
          io.to(Data.Users[i].User_Id).emit('createGroupResponse',data);
          console.log(i," emit done ")
        }
      
      }).catch(err=>{
        console.log("error in creating group ",err)
      }) 
    }),

    /* Method for adding friend in the group */
    socket.on('addFriendToGroup',data=>{
      console.log("Datat in add friend in socket ", data)
      queryModule.isAdmin(data).then(haveAccess=>{
        if(haveAccess){
          queryModule.addToGroup(data).then(addFriend=>{
            if(addFriend.modifiedCount==1){
              queryModule.getGroupDetails(data.GroupId).then(myResponse=>{
                myResponse = JSON.parse(JSON.stringify(myResponse));
                console.log("Data in adding friend to group :", myResponse);
                  for(let i = 0 ; i<myResponse.Users.length; i++){
                    io.to(myResponse.Users[i].User_Id).emit('addFriendToGroupResponse',data);
                    console.log("data.Users[i].UserId::", myResponse.Users[i].User_Id )
                  }
              })

            }else{
              io.to(data.myId).emit('addFriendToGroupResponse',"Something Went Wrong!!!");
            }
          }).catch(err=>{
            console.log("error in add friend in group 3:",err)
          })  
        }
      }).catch(err=>{
        console.log("error in add friend in group 1:",err)
      })
    }),

     /* Method for removing friend from the group */
    socket.on('removeFriendFromGroup',data=>{
      console.log("Data in remove friend Group : ", data.myId, " ", data.friendId, " ",data.GroupId);
      queryModule.getGroupDetails(data.GroupId).then(response=>{
        if(response.Group_Creater_Id != data.friendId){
          queryModule.isAdmin(data).then(haveAccess=>{
            if(haveAccess){
              console.log("IS Admin")
              queryModule.checkFriendIsInGroup(data).then(isMember=>{
                console.log("ISmember:::", isMember)
                if(isMember.Users.length!=0){
                  queryModule.removeFromGroup(data).then(removeFriend=>{
                    console.log("remve friend d djed wejd::",removeFriend)
                    if(removeFriend.modifiedCount==1){

                      for(let i = 0 ; i<response.Users.length; i++){
                        io.to(response.Users[i].User_Id).to(data.friendId).emit('removeFriendFromGroupResponse',data);
                        console.log("data.Users[i].UserId::", response.Users[i].User_Id )
                      }
                    }else{
                      io.to(data.myId).emit('removeFriendFromGroupResponse',"Something Went Wrong1!!!");
                    }
                  })
                }
              }).catch(err=>{console.log("error in remove friend from group 2", err)})
            }
          }).catch(err=>{console.log("error in remove friend from group 1", err)})
        }else{
          io.to(data.myId).emit('removeFriendFromGroupResponse',"Can't remove the group creater!!!");
        }
      }).catch(err=>{console.log("error in remove friend from group 0",err)})
    })

    socket.on('exitFromGroup',data=>{
      console.log("Data in exist from  Group : ", data);

      queryModule.checkFriendIsInGroup(data).then(isMember =>{
        if(isMember.Users.length !=0){
          queryModule.removeFromGroup(data).then(removedUser=>{
            if(removedUser.modifiedCount==1){
              io.to(data.friendId).emit('exitFromGroupResponse',data);
            }
          }).catch(err=>{console.log("error in exist from group 2", err)})
        }
      }).catch(err=>{console.log("error in exist from group 1", err)})


    })

    socket.on('makeAdmin',data=>{
      console.log("data in make admin ", data);
      queryModule.isAdmin(data).then(response=>{
        if(response.Users[0].User_Type == "Admin"){
          queryModule.modifyGroupAdmin(data).then(nowAdmin=>{
            if(nowAdmin.modifiedCount == 1){
              io.to(data.myId).to(data.friendId).emit("makeAdminResponse","Now Admin");
            }else{
              io.to(data.myId).emit("makeAdminResponse","Something went wrong!!")
            }
          }).catch(err=>{console.log("Error in making admin 2 ",err)})

        }else{
          io.to(data.myId).emit("makeAdminResponse","You are not authorised")
        }
      }).catch(err=>{console.log("error in making admin 1 ",err)});
    })

    socket.on('removeAdmin',data=>{
      console.log("data in removing admin ", data);
      queryModule.isAdmin(data).then(response=>{
        if(response.Users[0].User_Type == "Admin"){
          queryModule.modifyGroupAdmin(data).then(removeAdmin=>{
            if(removeAdmin.modifiedCount == 1){
              io.to(data.myId).to(data.friendId).emit("removeAdminResponse","Remove From Admin");
            }else{
              io.to(data.myId).emit("removeAdminResponse","Something went wrong!!")
            }
          })
        }else{
          io.to(data.myId).emit("removeAdminResponse","You are not authorised")
        }

      })
    })

    socket.on('groupChat',data=>{
      console.log("data in group chat socket ", data);
      queryModule.isUser(data).then(isUser=>{
        if(isUser.Users.length != 0){
          queryModule.getUser({_id :isUser.Users[0].User_Id}).then(UserDetails=>{
            UserDetails = JSON.parse(JSON.stringify(UserDetails));
            queryModule.saveGroupChat(data).then(chat=>{
              chat.User_Name = UserDetails.First_Name + " " + UserDetails.Last_Name;
              if(chat){
                io.to(data.Group_Id).emit("groupChatResponse",chat)
              }
            }).catch(err=>{console.log("error in group chat 1 ",err)})
          }).catch(err=>{console.log("error in group chat 2 ",err)})
      }else{
        io.to(data.User_Id).emit("groupChatResponse","You are not authorized!")
      }
      }).catch(err=>{console.log("error in group chat 1 ",err)})

    })

  });

}