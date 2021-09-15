const userModule = require('../../model/index').userModel;
const {getUser} = require('../../model/query/query');
const jwt = require('jsonwebtoken');


module.exports = {

    /* function for sign up */
    async signup(req,res){
        let {
			body: { Data},
		} = req
        console.log("dddddddddddddd", Data)
		if (!Data.Email) return res.send("Email is required.")
		if (!Data.Password) return res.send('Password is required')        
        if (!Data.First_Name) return res.send('First Name is required')
        if (!Data.Last_Name) return res.send('Last Name is required')


        Email = Data.Email.toLowerCase()

        try{

            let user = await getUser(Email)
            if(user) res.send("Email already exist")

            Data.IS_Verified = true;

            let UserData = await userModule.create(Data);
            console.log('UserData:::', UserData);
            res.send("Sign up successfully.")


        }catch(err){
            console.log(err);
            res.send(err);
        }

    },

    /*function for checking user already exist or not*/

    async userAlreadyExist(req,res){

        let Email = req.body.Email;
        console.log("req.body: ",req.body)

        Email = Email.toLowerCase();

        try{

            let user = await getUser(Email)
            if(user) res.send(user)

        }catch(err){
            console.log(err);
            res.send(err)
        }

    },


    /* Function for login */



    async login(req,res){
        let Email = req.body.Email;
        let Password = req.body.Password;

        
		if(!Email) res.send("Please Enter Email.")
		if(!Password) res.send("Password is required.")

        try{

            let UserData = await getUser(Email);
            if(UserData.Password != Password) res.send("Password is incorrect!!");

            let payload = {
				Email: UserData.Email,
				First_Name: UserData.First_Name,
				Last_Name: UserData.Last_Name,
				roles: 'User'
			}
			let token = jwt.sign(payload,"8a0d0d09-af24-4c9f-88cf-b12f5c4837fe", { expiresIn: "24h" })
			console.log(token);
            res.send(token);


        }catch(err){
            console.log(err);
        }
    }

}