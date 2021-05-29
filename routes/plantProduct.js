const express = require('express');
const {
  creatplantProduct,
  updateOnePlantProduct,
  addPlantProductToHub,
  getUserPlantProducts,
  plantInitialization,
  removePlantProduct,
  getOnePlantProduct
} = require('../controllers/plantProduct');

const router = express.Router();
const PlantProduct = require('../models/PlantProduct');

const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router.post('/creatplantProduct',creatplantProduct);
router.post('/updateOnePlantProduct',updateOnePlantProduct);
router.put('/addPlantProductToHub',protect,addPlantProductToHub);
router.get('/getUserPlantProducts', protect,advancedResults(PlantProduct), getUserPlantProducts);
router.put('/getOnePlantProduct', protect,getOnePlantProduct);
router.put('/plantInitialization', protect, plantInitialization);
router.put('/removePlantProduct',protect,removePlantProduct);

module.exports = router;
