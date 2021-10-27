const mongoose = require('mongoose');

const groupChat= new mongoose.Schema({

	Message: {type: String},
	User_Id:{type: String},
	Group_Id :{type:String},
	Deleted : {type:Boolean, default:false},
	Is_Seen :{type:Boolean,default:false},
	Created_At : {type: Date, default: Date.now()},
    Updated_At : {type : Date , default :Date.now()},
    Deleted_At : {type: Date, default : null}
	
});


// collection creation
const model = mongoose.model('groupchat',groupChat);
module.exports = model;