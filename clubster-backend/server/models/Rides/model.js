/*
* Model for Rides.
*/

//Include libraries
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
* Creation of User Schema. We specify a const variable with fields: name, email, password, avatar, array of clubs where user is member, and array of clubs where user is admin.
*/
const Rides = new Schema({
  driverID: {
    type: Schema.Types.ObjectId,   //Specifiers
    ref: 'users'
  },
  ridersID: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  passengerSeats: {
    type: String
  },
  time: {
    type: String
  },
  location: {
    type: String
  },
  description: {
    type: String
  }
});

Rides.statics.addRider = async function(rideID, riderID) {
  await this.findByIdAndUpdate(rideID, { $push: { ridersID: riderID } });
}

Rides.statics.removeRider = async function(rideID, riderID) {
  await this.findByIdAndUpdate(rideID, { $pull: { ridersID: riderID } });
}

/*
* Export so that other js files can use this schema
*/
module.exports = mongoose.model('Rides', Rides);
