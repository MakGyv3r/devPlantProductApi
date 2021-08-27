const express = require('express');
const {
  plantproductTxt,
  plantproductBin,
  hubslaveTxt,
  hubslaveBin,
  hubmasterTxt,
  hubmasterBin
} = require('../controllers/restApi/ota');

const router = express.Router();


router.get('/plantproduct.txt', plantproductTxt);
router.get('/plantproduct.bin', plantproductBin);
router.get('/hubslave.txt', hubslaveTxt);
router.get('/hubslave.bin', hubslaveBin);
router.get('/hubmaster.txt', hubmasterTxt);
router.get('/hubmaster.bin', hubmasterBin);


module.exports = router;