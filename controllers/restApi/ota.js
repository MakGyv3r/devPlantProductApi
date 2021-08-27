
const asyncHandler = require('../../middleware/async');
path = require('path')
let reqPath = path.join(__dirname, '../../');
exports.plantproductTxt = asyncHandler(async (req, res, next) => {
  res.sendFile(reqPath + '/public/plantproduct.txt');
});
exports.plantproductBin = asyncHandler(async (req, res, next) => {
  res.sendFile(reqPath + '/public/ardorinoUpdate/plantproduct.bin');
});

exports.hubslaveTxt = asyncHandler(async (req, res, next) => {
  res.sendFile(reqPath + '/public/hubslave.txt');
});

exports.hubslaveBin = asyncHandler(async (req, res, next) => {
  res.sendFile(reqPath + '/public/ardorinoUpdate/hubslave.bin');
});

exports.hubmasterTxt = asyncHandler(async (req, res, next) => {
  res.sendFile(reqPath + '/public/hubmaster.txt');
});

exports.hubmasterBin = asyncHandler(async (req, res, next) => {
  res.sendFile(reqPath + '/public/ardorinoUpdate/hubmaster.bin');
});



/*
//OTA esp32
app.get('/plantproduct.txt', function (request, response) {
  response.sendFile(__dirname + '/public/plantproduct.txt');
});

app.get('/plantproduct.bin', function (request, response) {
  response.sendFile(__dirname + '/public/ardorinoUpdate/plantproduct.bin');
});

//OTA esp32
app.get('/hubslave.txt', function (request, response) {
  response.sendFile(__dirname + '/public/hubslave.txt');
});

app.get('/hubslave.bin', function (request, response) {
  response.sendFile(__dirname + '/public/ardorinoUpdate/hubslave.bin');
});

//OTA esp32
app.get('/hubmaster.txt', function (request, response) {
  response.sendFile(__dirname + '/public/hubmaster.txt');
});

app.get('/hubmaster.bin', function (request, response) {
  response.sendFile(__dirname + '/public/ardorinoUpdate/hubmaster.bin');
});
*/