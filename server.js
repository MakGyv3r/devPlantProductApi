const express = require('express');
const socket = require('socket.io');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db.js');
const mongoose = require('mongoose');
let compression = require('compression');
let helmet = require('helmet');



//load env vars
dotenv.config({ path: './config/config.env' });

// connect to data base
connectDB(); 

// Routs files
const plantProduct = require('./routes/plantProduct');
const auth = require('./routes/auth');
const hub = require('./routes/hub');
const ota = require('./routes/ota');

const app = express();

//body parser to read from req.body
app.use(express.json());

//Compress all routes
app.use(compression());

//protect against  vulnerabilities
app.use(helmet());

// prod logging middleware
if (process.env.NODE_ENV === `development`) {
  app.use(morgan(`dev`));
}

//mount ruters
app.use('/api/v1/plantProduct', plantProduct);
app.use('/api/v1/auth', auth);
app.use('/api/v1/hub', hub);
app.use('', ota);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
app.get("/", (req, res) => {
  res.status(200).send("WHATABYTE: Food For Devs");
});

let io = socket(server);
app.set('socketio', io);
require("./controllers/Sockets")(app, io);

// handle unhandled promise rejections
process.on('unhandledRejection', (err, Promise) => {
  console.log(`Errore:${err.massage}`.red);
  //close server & exit process
  server.close(() => process.exit(1));
});



