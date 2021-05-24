const mongoose = require('mongoose');

const PlantTypeSchema = new mongoose.Schema({
  name: {
    default: '',
    type: String,
    require: [false, 'Please add a name'],
  },
  moisture: {
    default: '',
    type: String,
    require: [false, 'Please add a name'],
  },
  light: {
    default: '',
    type: String,
    require: [false, 'Please add a name'],
  },
  timeForWater: {
    default: '',
    type: String,
    require: [false, 'Please add a name'],
  },
});

module.exports = mongoose.model('PlantType', PlantTypeSchema);
