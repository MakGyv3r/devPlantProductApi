
const PlantProduct = require('../models/PlantProduct');
const Hub = require('../models/Hub');
let clients = require('../models/clients');
const asyncHandler = require('../middleware/async');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = (app,io) =>  {
// socket connecting to ESP32 and adding it to the clients
//app.set('socketio', io);

io.sockets.on('connection', function (socket) {
//   console.log('try to connect');
//   console.log('made socket connection', socket.id);
  
  
//   socket.on('disconnect', reason => {
//     console.log('user disconnected');
//   });
  socket.on(
    'storeClientInfo',
    asyncHandler(async (data) => {
      // looking for Router with the catNumber id that the product has
      let hub = await Hub.findOne({
        hubCatNumber: data,
      });

      // looking for User with the Number id in the data base
        // let User = await User.findOne({
        //   _id: data,
     // });
      //check if client don't have a socket 
      if(hub){
      // looking if client has a socket allready if yes add it to obj
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
          console.log('connected custom id:', clients);
        }
        await sleep(10).then(() => {
          console.log(hub.onlineConnected);
        });
      };

    })
  );


socket.on(
  'plantInitialization',
  asyncHandler(async (data) => {
    console.log(data);
    var myJSON = JSON.stringify(eval('(' + data + ')'));
    var idResultsObj = JSON.parse(myJSON);
    let plantProduct = await PlantProduct.findOne({
      productCatNumber: idResultsObj.productCatNumber,
    });
    let objhub=clients.find(({ clientId }) => clientId === socket.id);
    let hub = await Hub.findOne({
      hubCatNumber: objhub.customId,
    }); 
    console.log(plantProduct._id);
    console.log(hub.plantProductId);

  if(idResultsObj.massgeSuccess===true){
    await hub.plantProductId.push(plantProduct._id);
    await hub.save();
    // saving the  user and hub in plantiplant
    plantProduct.hubId = hub._id;
    await plantProduct.save();
  }
    //**need to add- send the user the date get from the router if user online
   console.log(hub);
  })
);

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
      plantProduct.waterSensor.isThereWater=idResultsObj.waterState;
      plantProduct.waterMotor.state= idResultsObj.motorState;
      plantProduct.autoIrrigateState.state= idResultsObj.autoIrrigateState;
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

        if(idResultsObj.wifiWorked===false){
          console.log('coudn\'t connect to wifi, no update' );
        }  
        if((idResultsObj.wifiWorked===true)&&(idResultsObj.versionNumber===plantProduct.progremVersion.versionNumber)){
          console.log(' connect to wifi, no update needed same version' );
          plantProduct.progremVersion.updateDone=true;
        }
        if((idResultsObj.wifiWorked===true)&&(idResultsObj.versionNumber!==plantProduct.progremVersion.versionNumber)){
          console.log(' didnt update' );
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
        if(idResultsObj.type==="hub"){
            if(idResultsObj.versionNumber===hub.progremVersion.versionNumber){
              console.log(' connect to wifi, no update needed same version' );
            }
            if(idResultsObj.versionNumber!==hub.progremVersion.versionNumber){
              console.log(' didnt update' );
            }
        }
        if(idResultsObj.type==="slave"){
          if(idResultsObj.versionNumber===hub.progremVersionHubSlave.versionNumber){
            console.log(' connect to wifi, no update needed same version' );
          }
          if(idResultsObj.versionNumber!==hub.progremVersionHubSlave.versionNumber){
            console.log(' didnt update' );
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
          let hub = await PlantProduct.findOne({
            hubCatNumber: c.customId,
          });
          hub.onlineConnected = false;
          await hub.save();
          clients.splice(i, 1);
          break;
        }
      }
    })
  );
});
 };
