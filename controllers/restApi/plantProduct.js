const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const PlantProduct = require('../../models/PlantProduct');
const User = require('../../models/User');
const Hub = require('../../models/Hub');
let clients = require('../../models/clients');


// @desc    creat new plantProduct
// @route   POST /api/v1/plantProduct
// @access privete/admin *** need to add and auth admin***
exports.creatplantProduct = asyncHandler(async (req, res, next) => {
  const plantProduct = await PlantProduct.create(req.body);
  return res.status(201).json({ success: true, data: plantProduct });
});

// @desc    add a plantProduct to a hub
// @route   put/api/v1/PlantProduct/addPlantProductToHub
// @access  privet/protected
exports.addPlantProductToHub = asyncHandler(async (req, res, next) => {
  const { hubId, productCatNumber } = req.body;
  const hub = await Hub.findById(hubId);
  const plantProduct = await PlantProduct.findOne({
    productCatNumber: productCatNumber,
  });
  // chacking if planti plant is not asind
  if (!plantProduct || !hub) {
    return res
      .status(402)
      .send({ error: "Must provide valid Planti's catloge number " });
  }
  else {
    await hub.plantProductId.push(plantProduct._id);
    await hub.save();
    // saving the  user and hub in plantiplant
    plantProduct.hubId = hub._id;
    await plantProduct.save();
  }
  res.status(200).json({
    success: true,
  });
});

// @desc    get user PlantProducts
// @route   Get /api/v1/PlantProduct
// @access  privete/protected
exports.getUserPlantProducts = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const plantProducts = await PlantProduct.find({ hubId: user.hubId });
  // console.log(user.hubId);
  // console.log(plantProducts);
  res.status(200).json({
    success: true,
    data: plantProducts,
  });
});

// @desc    get user PlantProducts check for updates
// @route   Get /api/v1/PlantProduct
// @access  privete/protected
exports.getUserPlantProductsUpdates = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const plantProducts = await PlantProduct.find({ hubId: user.hubId });
  //plantInitialization
  res.status(200).json({
    success: true,
    data: plantProducts,
  });
  const io = req.app.get('socketio');
  let obj = clients.find(
    ({ customId }) => customId === hub.hubCatNumber
  );
  if (obj != undefined) {
    hub.onlineConnected = true;
    plantProducts.forEach(async element => {
      await sleep(40).then(() => {
        io.sockets.connected[obj.clientId].emit('task', { task: "3", macAddress: element.macAddress, productCatNumber: element.productCatNumber });
      });
    });
  } else {
    hub.onlineConnected = false;
  }
});

// @desc    get one PlantProducts
// @route   Put /api/v1/getOnePlantProduct
// @access  privete/protected
exports.getOnePlantProduct = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const user = await User.findById(req.user.id);
  const plantProducts = await PlantProduct.find({ hubId: user.hubId });
  const ID = req.body.id;
  //console.log(ID)
  const plantProduct = await plantProducts.find(item => String(item._id) === ID);
  // console.log(user.hubId);.dirxml()
  console.group(plantProduct);
  res.status(200).json({
    success: true,
    data: plantProduct,
  });
});

// @desc    get user PlantProducts
// @route   Put /api/v1/getPlantProductData
// @access  privete/protected
exports.getPlantProductData = asyncHandler(async (req, res, next) => {
  //console.log(req.body);
  const { productCatNumber } = req.body;
  const plantProduct = await PlantProduct.findById(req.body.id);

  res.status(200).json({
    success: true,
    data: plantProduct,
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
    io.sockets.connected[obj.clientId].emit('task', { task: "1", macAddress: plantProduct.macAddress, motorCurrentSub: plantProduct.waterSensor.motorCurrentSub, productCatNumber: plantProduct.productCatNumber });
  } else {
    hub.onlineConnected = false;
  }
  res.status(200).json({
    success: true,
    data: hub,
  });
});

// @desc    add Data to plantProduct 
// @route   put /api/v1/PlantProduct/addDataPlantProduct
// @access  privet/protected
exports.addDataPlantProduct = asyncHandler(async (req, res, next) => {
  const { productCatNumber, moistureStatus, lightStatus } = req.body;
  console.log(productCatNumber);
  const plantProduct = await PlantProduct.findOne({
    productCatNumber: productCatNumber,
  });
  if (moistureStatus)
    await plantProduct.moistureSensor.tests.push({ status: moistureStatus });
  if (lightStatus)
    await plantProduct.lightSensor.tests.push({ status: lightStatus });
  await plantProduct.save();
  res.status(200).json({
    success: true,
    data: plantProduct,
  });
})

// @desc    delete plantProduct 
// @route   delete /api/v1/plantProduct/removePlantProduct
// @access  privet/protected
exports.removePlantProduct = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const hub = await Hub.findById(user.hubId);
  const { plantproductId } = req.body;
  hub.plantProductId.pull(plantproductId);
  const plantProduct = await PlantProduct.findById(plantproductId);
  console.log(plantProduct.hubId);
  plantProduct.hubId = undefined;
  await plantProduct.remove();
  await hub.save();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    remove plantProduct from hub
// @route   delete /api/v1/plantProduct/removePlantProductHub
// @access  privet/protected
exports.removePlantProductHub = asyncHandler(async (req, res, next) => {
  const { plantproductId } = req.body;
  const plantProduct = await PlantProduct.findById(plantproductId);
  const hub = await Hub.findById(plantProduct.hubId);
  hub.plantProductId.pull(plantProduct._id);
  console.log(plantProduct.hubId);
  plantProduct.moistureSensor.tests = [];
  plantProduct.lightSensor.tests = [];
  plantProduct.hubId = undefined;
  await plantProduct.save();
  await hub.save();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    update PlantProduct software
// @route   post /api/v1/PlantProduct/updateOnePlantProduct
// @access  privet
exports.updateOnePlantProduct = asyncHandler(async (req, res, next) => {
  const { productCatNumber, versionNumber } = req.body;
  const plantProduct = await PlantProduct.findOne({
    productCatNumber: productCatNumber,
  });
  const hub = await Hub.findById(plantProduct.hubId);
  plantProduct.progremVersion.versionNumber = versionNumber;
  plantProduct.progremVersion.updateDone = false;
  await plantProduct.save();
  //socket
  const io = req.app.get('socketio');
  let obj = clients.find(
    ({ customId }) => customId === hub.hubCatNumber
  );
  if (obj != undefined) {
    hub.onlineConnected = true;
    io.to(obj.clientId).emit('Update_Progrem_plant', { task: "8", macAddress: plantProduct.macAddress, productCatNumber: plantProduct.productCatNumber, ssid: "", pass: "", VERSION_NUMBER: plantProduct.progremVersion.versionNumber, UPDATE_URL: plantProduct.progremVersion.updateUrl });
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