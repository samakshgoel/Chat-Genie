const express = require('express');
const app = express();
const models = require('./model');
const passport = require('passport');
const  session = require('express-session')
const userModule = require('./model/index').userModel;
const jwt = require('jsonwebtoken');
// const cors = require('cors')

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(require('cors')())




const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = "82942950232-iq0rrne6qdbvdsfv768ipbdk4n8e44vn.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = 'y1MPHJUcqkZkoAHrhODNU0LD';

var userProfile;

app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));



  

models.dbconfig
	.sync()
	.then(() => console.log('Connected to DB'))
	.catch((err) => console.log('Somthing went wrong:', err.message))


const User_Routes = require('./routes/user/user');
// const GOOGLE_ROUTES = require('./routes/googleLogin/google');


 // Passport middleware
//  app.use(passport.initialize())
//  app.use(passport.session())

app.use('/user',User_Routes);
// app.use('/google-user',GOOGLE_ROUTES);


app.get('/', function(req, res) {
    res.send('i am here.');
  });
//   app.get('/success', (req, res) => res.send(userProfile));
  app.get('/error', (req, res) => res.send("error logging in"));


  passport.serializeUser(function(user, cb) {
    //   this.req.user = user
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8081/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log("4")
    //   console.log(profile)
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    //   console.log("req2: ",req.user._json)
      let Data = {
        First_Name :req.user._json.given_name,
        Last_Name : req.user._json.family_name,
        Email : req.user._json.email,
        Google_verified : true
      }
      console.log("Data: ",Data)
      let googleData = userModule.create(Data).then(Data2=>{
            console.log("Data2",Data2)
            let token = jwt.sign(Data,"8a0d0d09-af24-4c9f-88cf-b12f5c4837fe", { expiresIn: "24h" })
            console.log(token);
            res.send(token);
      }).catch(err=>{
          console.log("err: ",err);
      });
    //   console.log("googleData",googleData);

      
    // let token = jwt.sign(Data,"8a0d0d09-af24-4c9f-88cf-b12f5c4837fe", { expiresIn: "24h" })
    // console.log(token);
    // res.send(token);

     
    //   console.log(profile)
    // Successful authentication, redirect success.
    // res.redirect('/success');
  });



app.listen(8081,()=>{
    console.log("http://localhost:8081")
})



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJGaXJzdF9OYW1lIjoiQXNpZiIsIkxhc3RfTmFtZSI6IlNhaWZpIiwiRW1haWwiOiJhc2lmc2FmaS5iaGFkYW5pdGVjaEBnbWFpbC5jb20iLCJHb29nbGVfdmVyaWZpZWQiOnRydWUsImlhdCI6MTYzMTcwOTI4MCwiZXhwIjoxNjMxNzk1NjgwfQ.9hEoN73GhU8DBPIIzbS03lXtinqBrUKYjKnE9fwjUUI
    