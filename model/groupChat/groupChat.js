const mongoose = require('mongoose');


// message schema in group
// let messageSchema = new Schema({
//     text : { type : String },
//     senderName : { type : String },
//     createdAt: { type: Date, default: Date.now },
// })

// userschema in group
let UserSchema = new mongoose.Schema({
    User_Id : { type : String },
    User_Type: {type:String, default : "User"},
    User_Status :{type:String, default:"Active"},
    createdAt: { type: Date, default : Date.now()},
    removedAt : {type:Date, default: null}
})

// group schema
let groupChat = new mongoose.Schema(
  {
    Group_Name : { type : String},
    Users : [UserSchema],
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date },
    Is_delete : {type: Boolean, default :false},
    deletedAt: { type: Date }
  });
const model = mongoose.model('groupChat',groupChat);
module.exports = model;
