const PlantProduct = require('../../models/PlantProduct');
const Hub = require('../../models/Hub');
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
    if (socket.handshake.headers.cookie) {
      token = socket.handshake.headers.cookie.replace("token=", "");
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
      if ((plantProduct) && (!plantProduct.hubId)) {
        console.log(objHub);
        io.to(objHub.clientId).emit('task', { task: "1", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber });
      }
      else io.to(socket.id).emit('AddProductScreen', 'product Number is not currect');
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
      const plantProduct = await PlantProduct.findById(id.toString());
      // //check if product existes
      // if ((plantProduct) && (!plantProduct.hubId)) {
      //   console.log(objHub);
      //   io.to(objHub.clientId).emit('task', { task: "1", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber });
      // }
      // else io.to(socket.id).emit('AddProductScreen', 'product Number is not currect');
      await sleep(5000).then(() => {
        io.to(socket.id).emit('changeMotorState', !stateMotor);
        console.log('socket is sent')
      })
    })
    )

  });

};
