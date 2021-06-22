const mongoose = require('mongoose');

const HubSchema = new mongoose.Schema({
  // add the user conected to products

  hubCatNumber: {
    type: String,
    require: [true, 'Please add Product catalog number'],
    unique: true,
    trim: true,
    length: [9, 'Product catalog number should be 9 numbers'],
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  plantProductId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantProduct',
      meta: {},
      unique: true,
    },
  ],

  name: {
    type: String,
    maxlength: [50, 'Name can not be more than 50 characters'],
    default: 'Getaway',
    trim: true,
  },


  //if product is connected to the server
  onlineConnected: {
    type: Boolean,
    default: true,
  },

  progremVersionHubMaster: {
    updateProgrem: {
      type: Boolean,
      default: false,
    },
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
      default: 'http://morning-falls-78321.herokuapp.com/hubmaster.txt',
    },
  },

  progremVersionHubSlave: {
    updateProgrem: {
      type: Boolean,
      default: false,
    },
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
      default: 'http://morning-falls-78321.herokuapp.com/hubslave.txt',
    },
  },
});


module.exports = mongoose.model('Hub', HubSchema);