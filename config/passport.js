// // import all the things we need  
// const GoogleStrategy = require('passport-google-oauth20').Strategy

// const userModule = require('../model/index').userModel;
// const {getUser} = require('../model/query/query');

// module.exports = function (passport) {
//   passport.use(
//     new GoogleStrategy(
//       {
//         clientID: "82942950232-iq0rrne6qdbvdsfv768ipbdk4n8e44vn.apps.googleusercontent.com",
//         clientSecret: 'y1MPHJUcqkZkoAHrhODNU0LD',
//         callbackURL: '/auth/google/callback',
//       },
//       async (accessToken, refreshToken, profile, done) => {
//         //get the user data from google 
//         const newUser = {
//           FirstName: profile.name.givenName,
//           LastName: profile.name.familyName,
//           Google_verified : true,
//           Email: profile.emails[0].value
//         }

//         try {
//           //find the user in our database 
//           let user = await getUser({where: { Email :Email }})

//           if (user) {
//             //If user present in our database.
//             done(null, user)
//           } else {
//             // if user is not preset in our database save user data to database.
//             user = await userModule.create(newUser)
//             done(null, user)
//           }
//         } catch (err) {
//           console.error(err)
//         }
//       }
//     )
//   )

//   // used to serialize the user for the session
//   passport.serializeUser((user, done) => {
//     done(null, user.id)
//   })

//   // used to deserialize the user
//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => done(err, user))
//   })
// } 