const express = require('express');
const {
  creatHub,
  getUserHub,
  updateOnehub
} = require('../controllers/hub');
const Hub = require('../models/Hub');
const router = express.Router();
const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router.post('/creatHub',creatHub);
router.get('/getUserHub',protect,advancedResults(Hub),getUserHub);
router.post('/updateOnehub',updateOnehub);


module.exports = router;