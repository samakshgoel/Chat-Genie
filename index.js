require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan')
const socket = require('socket.io')
var socketEvents = require('./socketEvents');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(require('cors')())
app.use(morgan('dev'))
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* Connection to Database */
mongoose
.connect(process.env.Mongo_Connection, {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => {
console.log('Successfully connected to the database')
})
.catch(err => {
console.log('Could not connect to the database. Exiting now...', err)
process.exit()
})

const User_Routes = require('./routes/user/user');
const Admin_Routes = require('./routes/admin/admin');

app.use('/admin',Admin_Routes);
app.use('/user',User_Routes);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000/home/chat"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
const server = app.listen(3000,()=>{
    console.log("http://localhost:3000")
})
const io = socket(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST","PUT","DELETE"],
      },
});

socketEvents(io);
