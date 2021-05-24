const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const PlantProduct = require('../models/PlantProduct');
const User = require('../models/User');
const Hub = require('../models/Hub');
let clients = require('../models/clients');


// @desc    creat new plantProduct
// @route   POST /api/v1/plantProduct
// @access privete/admin *** need to add and auth admin***
exports.creatplantProduct= asyncHandler(async (req, res, next) => {
  const plantProduct = await PlantProduct.create(req.body);
  return res.status(201).json({ success: true, data: plantProduct });
});

// @desc    add a plantProduct to a hub
// @route   put/api/v1/PlantProduct/addPlantProductToHub
// @access  privet/protected
exports.addPlantProductToHub= asyncHandler(async (req, res, next) => { 
  console.log("i am here");
  const user = await User.findById(req.user.id);
  const { productCatNumber } = req.body;
  const hub = await Hub.findById(user.hubId);
  const plantProduct = await PlantProduct.findOne({
    productCatNumber: productCatNumber,
  });
// chacking if planti plant is not asind
    if (
      !plantProduct ||
      plantProduct.userId !== undefined
    ) {
      return res
        .status(402)
        .send({ error: "Must provide valid Planti's catloge number " });
    }
  //plantInitialization
  const io = req.app.get('socketio');
  let obj = clients.find(
    ({ customId }) => customId === hub.hubCatNumber
  );
  if (obj != undefined) {
    hub.onlineConnected = true;
    io.sockets.connected[obj.clientId].emit( 'task',{ task: "1",macAddress: plantProduct.macAddress,motorCurrentSub:plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber} );
  } else {
    hub.onlineConnected = false;
  }

//   // await sleep(2000).then(() => {
//   //   console.log('1');
//   //   res.status(200).json({
//   //     success: true,
//   //     data: plantiplant,
//   //   });
//   // });
  res.status(200).json({
    success: true,
  });
});

// @desc    get user PlantProducts
// @route   Get /api/v1/PlantProduct
// @access  privete/protected
exports.getUserPlantProducts = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const plantProducts = await PlantProduct.find({hubId: user.hubId});
  console.log(user.hubId);
  console.log(plantProducts);
  res.status(200).json({
    success: true,
    data: plantProducts,
  });
});


// @desc    add a plantProduct to a hub
// @route   put /api/v1/PlantProduct/plantInitialization
// @access  privet/protected
exports.plantInitialization = asyncHandler(async (req, res, next) => { 
  const user = await User.findById(req.user.id);
  const { productCatNumber } = req.body;
  const hub = await Hub.findById(user.hubId);
  const plantProduct = await PlantProduct.findOne({
    productCatNumber: productCatNumber,
  });
  //plantInitialization
  const io = req.app.get('socketio');
  let obj = clients.find(
    ({ customId }) => customId === hub.hubCatNumber
  );
  if (obj != undefined) {
    hub.onlineConnected = true;
    io.sockets.connected[obj.clientId].emit( 'task',{ task: "1",macAddress: plantProduct.macAddress,motorCurrentSub:plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber} );
  } else {
    hub.onlineConnected = false;
  }
  
  res.status(200).json({
    success: true,
    data: hub,
  });
});



// @desc    delete plantProduct 
// @route   delete /api/v1/plantProduct/removePlantProduct
// @access  privet/protected
exports.removePlantProduct = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const hub = await Hub.findById(user.hubId);
  const {plantproductId} =req.body;
  hub.plantProductId.pull(plantproductId);
  const plantProduct = await PlantProduct.findById(plantproductId);
  console.log(plantProduct.hubId);
  plantProduct.hubId=undefined;
  await hub.save();
  await plantProduct.save();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    update PlantProduct software
// @route   post /api/v1/PlantProduct/updateOnePlantProduct
// @access  privet
exports.updateOnePlantProduct = asyncHandler(async (req, res, next) => { 
  const { productCatNumber,versionNumber } = req.body;
  const plantProduct = await PlantProduct.findOne({
    productCatNumber: productCatNumber,
  });
  const hub = await Hub.findById(plantProduct.hubId);
  plantProduct.progremVersion.versionNumber=versionNumber;
  plantProduct.progremVersion.updateDone=false;
  await plantProduct.save();
//socket
  const io = req.app.get('socketio');
  let obj = clients.find(
    ({ customId }) => customId === hub.hubCatNumber
  );
  if (obj != undefined) {
    hub.onlineConnected = true;
    io.sockets.connected[obj.clientId].emit( 'Update_Progrem_plant',{ task: "8",macAddress: plantProduct.macAddress, productCatNumber: plantProduct.productCatNumber,ssid:"",pass:"",VERSION_NUMBER:plantProduct.progremVersion.versionNumber,UPDATE_URL:plantProduct.progremVersion.updateUrl} );
  } else {
    hub.onlineConnected = false;
  }
  
  res.status(200).json({
    success: true,
    data: plantProduct,
  });
});

// @desc    update PlantProduct software
// @route   post /api/v1/PlantProduct/updateOnePlantProduct
// @access  privet
exports.try1 = asyncHandler(async (req, res, next) => { 
  res.status(200).json({
    success: true,
  });
});