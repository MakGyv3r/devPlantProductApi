const express = require('express');
const {
  uploadPicture,
  creatplantProduct,
  updateOnePlantProduct,
  addPlantProductToHub,
  getUserPlantProducts,
  plantInitialization,
  removePlantProduct,
  getOnePlantProduct,
  getPlantProductData,
  getUserPlantProductsUpdates,
  addDataPlantProduct,
  removePlantProductHub
} = require('../controllers/restApi/plantProduct');

const router = express.Router();
const PlantProduct = require('../models/PlantProduct');
const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');
const upload = require("../middleware/upload");

router.post('/creatplantProduct', creatplantProduct);
router.post('/updateOnePlantProduct', updateOnePlantProduct);
router.put('/uploadPicture', upload.single("file"), uploadPicture);
router.put('/addPlantProductToHub', protect, addPlantProductToHub);
router.put('/getPlantProductData', protect, getPlantProductData);
router.get('/getUserPlantProductsUpdates', protect, getUserPlantProductsUpdates);
router.get('/getUserPlantProducts', protect/*,advancedResults(PlantProduct)*/, getUserPlantProducts);
router.put('/getOnePlantProduct', protect, getOnePlantProduct);
router.put('/plantInitialization', protect, plantInitialization);
router.put('/removePlantProduct', protect, removePlantProduct);
router.put('/removePlantProductHub', protect, removePlantProductHub);
router.put('/addDataPlantProduct', protect, addDataPlantProduct);


module.exports = router;
