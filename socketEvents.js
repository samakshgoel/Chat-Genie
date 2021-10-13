const socket = require('socket.io')
const roomModel = require('./model/room/room');
const chatModel = require('./model/chat/chat');
const queryModule = require('./model/query/query');
const io = require('./index')


exports = module.exports = function(io){

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
      queryModule.areFriends(data.Room_Id).then(response=>{
        if(response){
          response = JSON.parse(JSON.stringify(response));
          if(data.Status){
            let myData = {Room_Id : response._id,Status:"Block"}
            queryModule.blockUser(response).then(data=>{
              io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
            }).catch(err=>{
              console.log("err :",err)
            })
          }else{
            let myData = {Room_Id : response._id,Status:"Add"}
            queryModule.blockUser(response).then(data=>{
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
        let id= Data.data.Sender_Id !== Data.data.From_user? Data.data.From_user: Data.data.To_user
        Data.data.Status = "Requested"
        io.to(id).emit('addFriendResponse', Data);
    })
  
    /* Method for giving Active Status*/  
    socket.on('online',(data)=>{
      console.log("data that is coming online user socket",data)
      io.to(data.UserId).emit("onlineResponse",data);
    })

    /* Method for giving Unactive Status */
    socket.on("offline",(data)=>{
        console.log("Data at the time of offline socket :",data);
        io.to(data.UserId).emit("offlineResponse",data);
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
    socket.on('leave', Room_Id => {
      socket.leave(Room_Id);
      console.log('left ' , Room_Id);
    });
  
    /* Method for creating group for chat*/
    socket.on('createGroup',Data=>{
      let myGroup = {
        Group_Name:Data.Group_Name,
        Users : [
            {
                User_Id: Data.myUserId,
                User_Type:'Admin',
            }
        ]
      }
      groupModel(myGroup).save().then(data=>{
      console.log("creating group successfulll",data);
      io.to(data._id).emit('createGroupResponse',data);
      }) 
    })


    /* Method for adding friend in the group */
    socket.on('addFriendToGroup',data=>{
      io.to(data.Room_Id).emit('addFriendGroupResponse',data);
    })

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
    socket.on('disconnect', function () {
      socket.broadcast.emit('userdisconnect', ' user has left');
    });
  });

}