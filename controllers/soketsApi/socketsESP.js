
const PlantProduct = require('../../models/PlantProduct');
const ErrorResponse = require('../../utils/errorResponse');
const Hub = require('../../models/Hub');
let clients = require('../../models/clients');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../middleware/async');


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = (app, io) => {
  // socket connecting to ESP32 and adding it to the clients
  app.set('socketio', io);

  io.sockets.on('connection', function (socket) {

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
      console.log(hub.userId);
      let objUser = clients.find(({ customId }) => customId === hub.userId.toString());
      console.log(objUser);

      if (idResultsObj.massgeSuccess === 1) {
        await hub.plantProductId.push(plantProduct._id);
        await hub.save();
        // saving the  user and hub in plantiplant
        plantProduct.hubId = hub._id;
        await plantProduct.save();
        await io.to(objUser.clientId).emit('AddProductScreen', 'success');
      }
      //**need to add- send the user the date get from the router if user online
      //console.log(hub);
    })
    )

    // socket motor cange date in caloud 
    socket.on('resultsdata', asyncHandler(async (data) => {
      var myJSON = JSON.stringify(eval('(' + data + ')'));
      var idResultsObj = JSON.parse(myJSON);
      let plantProduct = await PlantProduct.findOne({ productCatNumber: idResultsObj.productCatNumber, });
      let objhub = clients.find(({ clientId }) => clientId === socket.id);
      let hub = await Hub.findOne({ hubCatNumber: objhub.customId });
      let objUser = clients.find(({ customId }) => customId === hub.userId.toString());

      await plantProduct.moistureSensor.tests.push({ status: idResultsObj.moistureStatus });
      await plantProduct.lightSensor.tests.push({ status: idResultsObj.lightStatus });
      await plantProduct.save();

      console.log(idResultsObj.moistureStatus, idResultsObj.lightStatus);
      io.to(objUser.clientId).emit('showData', { 'lightSensor': idResultsObj.lightStatus, 'muisterSensor': idResultsObj.moistureStatus });

      //**need to add- send the user the date get from the router if user online
    })
    );


    // socket entering water status from ESP32
    socket.on('irrigatedata', asyncHandler(async (data) => {
      var myJSON = JSON.stringify(eval('(' + data + ')'));
      var idResultsObj = JSON.parse(myJSON);
      let plantProduct = await PlantProduct.findOne({
        productCatNumber: idResultsObj.productCatNumber,
      });
      let objhub = clients.find(({ clientId }) => clientId === socket.id);
      let hub = await Hub.findOne({ hubCatNumber: objhub.customId, });
      let objUser = clients.find(({ customId }) => customId === hub.userId.toString());
      plantProduct.waterMotor.state = idResultsObj.motorState;
      plantProduct.waterSensor.waterState.state = idResultsObj.waterState;
      plantProduct.autoIrrigateState = idResultsObj.autoIrrigateState;

      //console.log(idResultsObj);
      if (idResultsObj.motorState === true)
        plantProduct.waterMotor.timeOn = Date.now();
      else plantProduct.waterMotor.timeOff = Date.now();
      //await PlantProduct.findByIdAndUpdate({ _id: plantProduct._id }, { $set: { waterMotor: idResultsObj.motorState } })
      await plantProduct.save();
      io.to(objUser.clientId).emit('changeMotorState', { 'motorState': idResultsObj.motorState, 'waterState': idResultsObj.waterState, 'autoIrrigateState': idResultsObj.autoIrrigateState });
      console.log('motor succes changed');
    })
    );

    // socket entering water status from ESP32
    socket.on('updatingSuccessed', asyncHandler(async (data) => {
      console.log(data);
      let myJSON = JSON.stringify(eval('(' + data + ')'));
      let idResultsObj = JSON.parse(myJSON);
      let plantProduct = await PlantProduct.findOne({ productCatNumber: idResultsObj.productCatNumber });

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
    socket.on('Update_Progrem_hub', asyncHandler(async (data) => {
      console.log(data);
      let myJSON = JSON.stringify(eval('(' + data + ')'));
      let idResultsObj = JSON.parse(myJSON);
      let hub = await Hub.findOne({ hubCatNumber: idResultsObj.id });
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
    socket.on('disconnect', asyncHandler(async (data) => {
      console.log('Client disconnected');
      for (var i = 0, len = clients.length; i < len; ++i) {
        var c = clients[i];
        if (c.clientId == socket.id) {
          let hub = await Hub.findOne({
            hubCatNumber: c.customId,
          });

          if (hub) {
            hub.onlineConnected = false;
            let objUser = clients.find(({ customId }) => customId === hub.userId.toString());
            if (objUser) {
              console.log('socket has sent')
              io.to(objUser.clientId).emit('hubConnected', { 'hubStatus': hub.onlineConnected });
            }
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

