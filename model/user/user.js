const { DataTypes } = require('sequelize')


/** function for user model */
module.exports = (sequelize) => {
	let user = sequelize.define('User', {
		Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
		First_Name: { type: DataTypes.STRING, allowNull: false },
		Last_Name: { type: DataTypes.STRING, allowNull: false },
		Email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			set(value) {
				this.setDataValue('Email', value.toLowerCase())
			},
		},
		Password: { type: DataTypes.STRING , allowNull : true },
		Facebook_verified : {type : DataTypes.BOOLEAN, allowNull:true},
        Google_verified : {type : DataTypes.BOOLEAN, allowNull:true},
		IS_Verified : {type : DataTypes.BOOLEAN , allowNull:true}


		
	})
	return user;
}
