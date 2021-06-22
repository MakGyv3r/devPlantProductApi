const mongoose = require('mongoose');

const PlantProductSchema = new mongoose.Schema({
  // add the user conected to products
  productCatNumber: {
    type: String,
    require: [true, 'Please add Product catalog number'],
    unique: true,
    trim: true,
    length: [9, 'Product catalog number should be 9 numbers'],
  },

  macAddress: {
    type: String,
    length: 12,
    require: [true, 'Please add Product Mac Address number'],
    unique: true,
    trim: true,
  },

  name: {
    type: String,
    maxlength: [50, 'Name can not be more than 50 characters'],
    default: 'PlantProduct',
    trim: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
  },

  //if product is connected to the router
  routerConnected: {
    type: Boolean,
    default: false,
  },

  updateProgrem: {
    type: Boolean,
    default: false,
  },

  autoIrrigateState: {
    type: Boolean,
    default: false,
  },

  irrigatePlantOption: {
    type: String,
    enum: ['0', '1', '2', '3'],
    default: '0',
  },

  waterSensor: {
    isThereWater: {
      type: Boolean,
      default: true,
    },
    motorCurrentSub: {
      type: String,
      default: "300",
    },
  },

  waterMotor: {
    state: {
      type: Boolean,
      default: false,
    },
    timeOn: { type: Date, default: Date.now },
    timeOff: { type: Date, default: Date.now }
  },

  lightSensor: {
    tests: [
      {
        time: { type: Date, default: Date.now },
        status: String,
        meta: {},
      },
    ],
  },

  moistureSensor: {
    tests: [
      {
        time: { type: Date, default: Date.now },
        status: String,
        meta: {},
      },
    ],
  },

  progremVersion: {
    versionNumber: {
      type: Number,
      default: 1,
    },
    versionString: {
      type: String,
      default: '0.1',
    },
    updateUrl: {
      type: String,
      default: 'http://morning-falls-78321.herokuapp.com/plantproduct.txt',
    },
    updateDone: {
      type: Boolean,
      default: true,
    },
  },

});


module.exports = mongoose.model('PlantProduct', PlantProductSchema);
