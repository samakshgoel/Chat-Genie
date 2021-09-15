const express = require('express');
const ROUTE = express.Router();

const passport = require('passport')

const {signup, userAlreadyExist, login} = require('../../controller/user/user');



// ROUTE.get('/use-me',(req,res)=>{
//     res.send("I am working!!")
// })
// ROUTE.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))
ROUTE.post('/signup',signup);
ROUTE.put('/user-exist', userAlreadyExist)
ROUTE.post('/my-login', login);

// ROUTE.get(
//     '/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//       res.send('user logged in')
//       res.redirect('/log')
//     }
//   )
  
  //for logOut 
//   ROUTE.get('/logout', (req, res) => {
//     req.logout()
//     res.redirect('/')
//   })




  

// ROUTE.get('/', ensureGuest ,(req, res) => {
//     res.render('login')
//   })

// ROUTE.get("/log",ensureAuth, async(req,res)=>{
//     res.render('index',{userinfo:req.user})
// })

module.exports = ROUTE