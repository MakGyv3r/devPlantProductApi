const mongoose = require('mongoose');
const User = require('../models/User');
//const PlantProduct = require('../models/PlantProduct');

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

  // imageSchema: {
  //   name: { type: String },
  //   desc: { type: String },
  //   img:
  //   {
  //     data: Buffer,
  //     contentType: String
  //   }
  // },
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
    waterState: {
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

PlantProductSchema.statics.checkAmountOfData = async function (hubId, id) {
  const user = await User.findOne({
    hubId: hubId,
  });

  if (user)
    if (user.role === "user") {
      const obj = await this.model('PlantProduct').findOne({ "_id": id })
      //console.log(obj.lightSensor.tests.slice(obj.lightSensor.tests.length - 10))
      if (obj.lightSensor.tests.length > 10)
        try {
          let letest10 = obj.lightSensor.tests.slice(obj.lightSensor.tests.length - 10)
          let updatedData = obj
          updatedData.lightSensor.tests = [...letest10]
          await this.model('PlantProduct').findByIdAndUpdate(id, updatedData)
        } catch (e) {
          print(e);
        }

      if (obj.moistureSensor.tests.length > 20)
        try {
          let latest10 = obj.moistureSensor.tests.slice(obj.moistureSensor.tests.length - 10)
          let moistureSensorupdatedData = obj
          moistureSensorupdatedData.moistureSensor.tests = [...latest10]
          await this.model('PlantProduct').findByIdAndUpdate(id, moistureSensorupdatedData)
        } catch (e) {
          print(e);
        }
    }
}

PlantProductSchema.post('save', function () {
  if ((this._id) && (this.hubId))
    this.constructor.checkAmountOfData(this.hubId, this._id);
})



module.exports = mongoose.model('PlantProduct', PlantProductSchema);
