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
    User_Name :{type:String},
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
    createdAt : {type:Date,default:Date.now},
    deletedAt: { type: Date },
    ProfileImage : {type:String,default:null},
    Group_Creater_Id : {type:String}
  });
const model = mongoose.model('group',groupChat);
module.exports = model;
