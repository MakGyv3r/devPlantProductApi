const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const Hub = require('../../models/Hub');
const User = require('../../models/User');
const PlantProduct = require('../../models/PlantProduct');
let clients = require('../../models/clients');



// @desc    creat new getaway
// @route   POST /api/v1/getaway
// @access privete/admin *** need to add and auth ***
exports.creatHub = asyncHandler(async (req, res, next) => {
  const hub = await Hub.create(req.body);
  return res.status(201).json({ success: true, data: hub });
});

// @desc    get user Getaway
// @route   Get /api/v1/getaway
// @access  privete/protected
exports.getUserHub = asyncHandler(async (req, res, next) => {
  const hub = await Hub.find({ userId: req.user.id });

  res.status(200).json({
    success: true,
    data: hub,
  });
});

// @desc    update one hub software
// @route   post /api/v1/hub/updateOnehub
// @access  privet
exports.updateOnehub = asyncHandler(async (req, res, next) => {
  const { hubCatNumber, versionNumber, type } = req.body;
  const hub = await Hub.findOne({
    hubCatNumber: hubCatNumber,
  });
  let UpdateUrl;

  if (type === 'slave') {
    hub.progremVersionHubSlave.versionNumber = versionNumber;
    UpdateUrl = hub.progremVersionHubSlave.updateUrl;
    hub.progremVersionHubSlave.updateDone = false;
  }
  else if (type === 'hub') {
    hub.progremVersionHubMaster.versionNumber = versionNumber;
    UpdateUrl = hub.progremVersionHubMaster.updateUrl;
    hub.progremVersionHubMaster.updateDone = false;
  }
  await hub.save();
  //socket
  const io = req.app.get('socketio');
  let obj = clients.find(
    ({ customId }) => customId === hub.hubCatNumber
  );
  console.log(obj)
  if (obj) {
    hub.onlineConnected = true;
    io.to(obj.clientId).emit('Update_Progrem_hub', { task: "11", hubhubCatNumber: hubCatNumber, ssid: "", pass: "", VERSION_NUMBER: versionNumber, UPDATE_URL: UpdateUrl, type: type });
  } else {
    hub.onlineConnected = false;
  }

  res.status(200).json({
    success: true,
    data: hub,
  });
});