/*
* This is the controller for the Users schema. In this file, we will code out the methods that will register or login a user.
* author: ayunus@ucsc.edu mmajidi@ucsc.edu
*
*/

//Import Node.js libraries.
const User = require('./model');              //import User Schema
const Galleries = require('../Galleries/model')
const bcrypt = require('bcrypt');             //bcrypt library is useful for salting, hashing passwords
const jwt = require('jsonwebtoken');          //jwt is used for making a token for logged in users

const numberOfSaltIterations = 12;

exports.createUser = (req, res) => {
  //Code to register a User in our Mongo Collection
  const { username, name, email, password } = req.body; // Destructuring the req.body (i.e. extracting info)
  if (username && name && email && password) {
    User.findOne({ username: username }).then((user_name) => {
      User.findOne({ email: email }).then((user) => {
        if (user || user_name) { // If the user already exists, reject duplicate account
          return res.status(400).json({ 'Error': 'User already exists' });
        } else {
          let newGallery = new Galleries({
            photos: []
          });
          newGallery.save().then(newGal => {
            // Creates a new User
            let newUser = new User({
              username: username,
              name: name,
              email: email,
              password: password,
              gallery: newGal._id
            });

            // Hashes the user's chosen password to make it more secure
            bcrypt.hash(password, numberOfSaltIterations, function (err, hash) {
              if (err) throw err;
              newUser.password = hash;
              newUser.save().then(user => res.status(201).json({ 'user': user })).catch(err => console.log(err)); // Push the new user onto the db if successful, else display error
            });
          })
        }
      });
    });
  } else {
    return res.status(400).json({ 'Error': 'Missing fields' });
  }
};

exports.findUser = (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username: username }).populate('gallery')
  .populate({ path: 'arrayClubsAdmin', select: 'name image _id president' })
  .populate({ path: 'arrayClubsMember', select: 'name image _id president' })
  .then((user) => {
    // checks if both username and password are valid
    if (!user) {
      return res.status(400).json({ 'Error': 'User does not exist' });
    } else {
      bcrypt.compare(password, user.password).then(same => {
        delete user.password;
        // both password and username are correct and sends success token to server
        if (same) {
          const payload = { _id: user._id, name: user.name };
          jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
              user: user
            });
          });
        } else {
          return res.status(400).json({ 'Error': 'Password is incorrect' });
        }
      }).catch((err) => console.log(err));
    }
  });
}

exports.changePhoto = (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { $set: { "image": req.body.imageURL } }).then((user) => {
    if (!user) {
      return res.status(404).json({ 'Error': 'error' });
    } else {
      return res.status(201).json({ 'image': req.body.imageURL });
    }
  });
};

exports.submitProfile = (req, res) => {
  const { major, hobbies, biography } = req.body; // destructure, pull value and assign it

  User.findOneAndUpdate({ _id: req.user._id },
    { $set: { "major": major, "hobbies": hobbies, "biography": biography } })
    .then(() => {
      User.findById(req.user._id).select('-username -email -password').then((user) => {
        if (user) {
          return res.status(201).json({ 'profile': user });
        } else {
          return res.status(400).json({ 'error': 'could not find user' });
        }
      });
    });
};

exports.retrieveProfile = (req, res) => {
  if (!req.user.gallery) {
    let newGallery = new Galleries({
      photos: []
    });
    newGallery.save().then(newGal => {
      User.findByIdAndUpdate(req.user._id).then(user => {
        user.gallery = newGal._id;
        user.save();
      });
    });
  }
  
  User.findById(req.user._id).select('-username -email -password').populate('gallery').then((user) => {
    return res.status(201).json({ 'profile': user });
  });
};

// get events of orgs that person is a part of
exports.getAllUserEvents = (req, res) => {
  let userID = req.user._id;
  let eventsArray = [];
  User.findById(userID).populate({path: 'arrayClubsAdmin', populate: {path: 'events'}}).populate({path: 'arrayClubsMember', populate: {path: 'events'}}).then(user => {
    for(let i = 0;i<user.arrayClubsAdmin.length;i++) {
      eventsArray.push(user.arrayClubsAdmin[i].events);
    }
    for(let j = 0;j<user.arrayClubsMember.length;j++) {
      eventsArray.push(user.arrayClubsMember[j].events);
    }
    eventsArray = eventsArray.flatten()
    return res.status(201).json({eventsArray});
 })
};
