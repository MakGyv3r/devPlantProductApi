const PlantProduct = require('../../models/PlantProduct');
const Hub = require('../../models/Hub');
const mongoose = require('mongoose');
let clients = require('../../models/clients');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../middleware/async');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = (app, io) => {
  // socket connecting to ESP32 and adding it to the clients
  //app.set('socketio', io);

  io.sockets.on('connection', function (socket) {
    let token;
    console.log(socket.id);
    if (socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
      socket.emit('storeApp');
    }
    // console.log(token);
    //socket adds app to clients
    socket.on('storeAppClientInfo', (data) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('connected custom id:', clients);
      let obj = clients.find(({ customId }) => customId === decoded.id);
      if (!obj) {
        console.log('1');
        var clientInfo = new Object();
        clientInfo.customId = decoded.id;
        clientInfo.clientId = socket.id;
        clients.push(clientInfo);
        console.log('connected custom id:', clients);
      } else {
        console.log('2');
        let index = clients.indexOf(obj);
        clients[index].clientId = socket.id;
        console.log('connected custom id:', clients);
      }
    });

    socket.on('AddProduct', asyncHandler(async (data) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let hub = await Hub.findOne({
        userId: decoded.id
      });
      let objHub = clients.find(({ customId }) => customId === hub.hubCatNumber);
      const plantProduct = await PlantProduct.findOne({
        productCatNumber: data.productCatNumber,
      });
      //check if product existes
      if (objHub) {
        if ((plantProduct) && (!plantProduct.hubId)) {
          console.log(objHub);
          plantProduct.name = data.Name;
          io.to(objHub.clientId).emit('task', { task: "1", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber });
        }
        else io.to(socket.id).emit('AddProductScreen', 'product Number is not currect');
      }
      else {
        io.to(socket.id).emit('hubConnected', { 'hubStatus': hub.onlineConnected });
      }
      /*   console.log('AddProductScreen', socket.id);
      //   const ID=socket.id;
      //   console.log(data)
      //   if(data.productCatNumber==='000000001')
      //  await sleep(2000).then(() => {
      //     io.to(socket.id).emit('AddProductScreen','product Number is currect');
      //     console.log('product number is currect')
      //   })
      // else 
      // await sleep(5000).then(() => {
      //   io.to(socket.id).emit('AddProductScreen','initialization has failed please try again or check product Number');
      //   console.log('initialization has failed please try again or check product Number')
      //    })
       })*/
    })
    );

    socket.on('AppMotorState', asyncHandler(async (id, stateMotor) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let hub = await Hub.findOne({
        userId: decoded.id
      });
      let objHub = clients.find(({ customId }) => customId === hub.hubCatNumber);
      if (objHub) {
        hub.onlineConnected = true;
        await hub.save();
        const plantProduct = await PlantProduct.findById(id.toString());
        console.log(objHub)
        io.to(objHub.clientId).emit('task', { task: "6", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber, motorState: stateMotor });
      }
      else {
        io.to(socket.id).emit('hubConnected', { 'hubStatus': hub.onlineConnected });
      }
    })
    )

    socket.on('AppAutoIrrigate', asyncHandler(async (id, autoIrrigate) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let hub = await Hub.findOne({
        userId: decoded.id
      });
      let objHub = clients.find(({ customId }) => customId === hub.hubCatNumber);
      if (objHub) {
        hub.onlineConnected = true;
        await hub.save();
        const plantProduct = await PlantProduct.findById(id.toString());
        console.log(objHub)
        io.to(objHub.clientId).emit('task', { task: "4", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber, autoIrrigateState: autoIrrigate });
      }
      else {
        io.to(socket.id).emit('hubConnected', { 'hubStatus': hub.onlineConnected });
      }
    })
    )

    socket.on('GetData', asyncHandler(async (id) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let hub = await Hub.findOne({
        userId: decoded.id
      });
      let objHub = clients.find(({ customId }) => customId === hub.hubCatNumber);
      if ((objHub) && (hub.onlineConnected === true)) {
        const plantProduct = await PlantProduct.findById(id.toString());
        // console.log(objHub)
        io.to(objHub.clientId).emit('task', { task: "3", macAddress: plantProduct.macAddress, productCatNumber: plantProduct.productCatNumber, });
        console.log('socket is sent')
      }
      else {
        io.to(socket.id).emit('hubConnected', { 'hubStatus': hub.onlineConnected });
      }
    })
    )

  });

};
