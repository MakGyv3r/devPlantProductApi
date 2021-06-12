
const PlantProduct = require('../models/PlantProduct');
const Hub = require('../models/Hub');
let clients = require('../models/clients');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

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

    //socket adds prudct to clients
    socket.on('storeClientInfo', asyncHandler(async (data) => {
      // looking for Router with the catNumber id that the product has
      console.log(data)
      let hub = await Hub.findOne({
        hubCatNumber: data,
      });

      let obj = clients.find(({ customId }) => customId === data);
      if (!obj) {
        console.log('new client don\'t have socket');
        var clientInfo = new Object();
        clientInfo.customId = data;
        clientInfo.clientId = socket.id;
        clients.push(clientInfo);
        hub.onlineConnected = true;
        await hub.save();
        console.log('connected custom id:', clients);
      }
      //need to chacek if the product exsists 
      else {
        console.log('old client had socket');
        let index = clients.indexOf(obj);
        clients[index].clientId = socket.id;
        hub.onlineConnected = true;
        await hub.save();
        console.log('connected custom id:', clients);
      }
      await sleep(10).then(() => {
        console.log(hub.onlineConnected);
      });
    })
    );

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
        io.to(socket.id).emit('AddProductScreen', 'success');
        // io.to(objHub.clientId).emit('task', { task: "1", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber });
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

    socket.on('plantInitialization', asyncHandler(async (data) => {
      console.log(data);
      let myJSON = JSON.stringify(eval('(' + data + ')'));
      let idResultsObj = JSON.parse(myJSON);
      let plantProduct = await PlantProduct.findOne({
        productCatNumber: idResultsObj.productCatNumber,
      });
      let objhub = clients.find(({ clientId }) => clientId === socket.id);
      let hub = await Hub.findOne({
        hubCatNumber: objhub.customId,
      });
      console.log(plantProduct._id);
      console.log(hub.plantProductId);
      if (idResultsObj.massgeSuccess === true) {
        await hub.plantProductId.push(plantProduct._id);
        await hub.save();
        // saving the  user and hub in plantiplant
        plantProduct.hubId = hub._id;
        await plantProduct.save();
      }
      //**need to add- send the user the date get from the router if user online
      console.log(hub);
    })
    )


    // socket entering date from ESP32
    socket.on(
      'resultsdata',
      asyncHandler(async (data) => {
        console.log(data);
        var myJSON = JSON.stringify(eval('(' + data + ')'));
        var idResultsObj = JSON.parse(myJSON);
        let plantProduct = await PlantProduct.findOne({
          productCatNumber: idResultsObj.productCatNumber,
        });
        console.log(myJSON);
        plantProduct.muisterSensor.tests.push({
          status: idResultsObj.moistureStatus,
        });
        plantProduct.lightSensor.tests.push({ status: idResultsObj.lightStatus });
        await plantProduct.save();
        //**need to add- send the user the date get from the router if user online
        console.log('success');
      })
    );

    // socket entering water status from ESP32
    socket.on(
      'irrigatedata',
      asyncHandler(async (data) => {
        console.log(data);
        var myJSON = JSON.stringify(eval('(' + data + ')'));
        var idResultsObj = JSON.parse(myJSON);
        let plantProduct = await PlantProduct.findOne({
          productCatNumber: idResultsObj.productCatNumber,
        });
        plantProduct.waterSensor.isThereWater = idResultsObj.waterState;
        plantProduct.waterMotor.state = idResultsObj.motorState;
        plantProduct.autoIrrigateState.state = idResultsObj.autoIrrigateState;
        await plantProduct.save();
        console.log('success');
      })
    );

    // socket entering water status from ESP32
    socket.on(
      'updatingSuccessed',
      asyncHandler(async (data) => {
        console.log(data);
        let myJSON = JSON.stringify(eval('(' + data + ')'));
        let idResultsObj = JSON.parse(myJSON);
        let plantProduct = await PlantProduct.findOne({
          productCatNumber: idResultsObj.productCatNumber
        });

        if (idResultsObj.wifiWorked === false) {
          console.log('coudn\'t connect to wifi, no update');
        }
        if ((idResultsObj.wifiWorked === true) && (idResultsObj.versionNumber === plantProduct.progremVersion.versionNumber)) {
          console.log(' connect to wifi, no update needed same version');
          plantProduct.progremVersion.updateDone = true;
        }
        if ((idResultsObj.wifiWorked === true) && (idResultsObj.versionNumber !== plantProduct.progremVersion.versionNumber)) {
          console.log(' didnt update');
        }
        await plantProduct.save();
        console.log('updatingSuccessed');
      })
    );

    // socket entering water status from ESP32
    socket.on(
      'Update_Progrem_hub',
      asyncHandler(async (data) => {
        console.log(data);
        let myJSON = JSON.stringify(eval('(' + data + ')'));
        let idResultsObj = JSON.parse(myJSON);
        let hub = await Hub.findOne({
          hubCatNumber: idResultsObj.id
        });
        if (idResultsObj.type === "hub") {
          if (idResultsObj.versionNumber === hub.progremVersion.versionNumber) {
            console.log(' connect to wifi, no update needed same version');
          }
          if (idResultsObj.versionNumber !== hub.progremVersion.versionNumber) {
            console.log(' didnt update');
          }
        }
        if (idResultsObj.type === "slave") {
          if (idResultsObj.versionNumber === hub.progremVersionHubSlave.versionNumber) {
            console.log(' connect to wifi, no update needed same version');
          }
          if (idResultsObj.versionNumber !== hub.progremVersionHubSlave.versionNumber) {
            console.log(' didnt update');
          }
        }
        console.log('updatingSuccessed');
      })
    );


    // socket disconnecting from ESP32
    socket.on(
      'disconnect',
      asyncHandler(async (data) => {
        console.log('Client disconnected');
        for (var i = 0, len = clients.length; i < len; ++i) {
          var c = clients[i];
          if (c.clientId == socket.id) {
            let hub = await Hub.findOne({
              hubCatNumber: c.customId,
            });

            if (hub) {
              hub.onlineConnected = false;
              await hub.save();
            }
            clients.splice(i, 1);
            break;
          }
        }
        console.log('connected custom id:', clients);
      })
    );

  });

};

