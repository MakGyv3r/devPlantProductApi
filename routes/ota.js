const express = require('express');
const {
  plantproductTxt,
  plantproductBin,
  hubslaveTxt,
  hubslaveBin,
  hubmasterTxt,
  hubmasterBin
} = require('../controllers/ota');

const router = express.Router();


router.post('/plantproduct.txt',plantproductTxt);
router.get('/plantproduct.bin',plantproductBin);
router.post('/hubslave.txt',hubslaveTxt);
router.post('/hubslave.bin',hubslaveBin);
router.get('/hubmaster.txt',hubmasterTxt);
router.post('/hubmaster.bin',hubmasterBin);


module.exports = router;