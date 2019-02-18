/*
* This is the controller for the Profile schema.
* author: ayunus@ucsc.edu
*/

// grabs scheme in the profile/model
const User = require('../Users/model');
const Profile = require('./model');
const mongoose = require('mongoose');
const Img = require('../Images/model');
const fs = require('fs');

exports.changeProfile = (req, res) => {
  Profile.findOneAndUpdate({ user: req.user._id },{ $set: {"image": req.body.imageURL} }).then((profile) => {
    if(!profile) {
      return res.status(404).json({ 'Error': 'error' });
    } else {
      return res.status(201).json({'profile': profile});
    }
  });
};

exports.profileSubmission = (req, res) => {
  const { major, hobbies, facebook, instagram, linkedIn, description } = req.body; // destructure, pull value and assign it

  // making new profile object
  const newProfile = {
    user: req.user._id,
    major: major,
    hobbies: hobbies,
    social: {
      facebook: facebook,
      linkedin: linkedIn,
      instagram: instagram,
    },
    description: description
  };

  Profile.findOne({ user: req.user._id }).then((profile) => {
    if (profile) {
      Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: newProfile },    // overwrites the previous profile with new one
        { new: true }
      ).then((profile) => {
        Profile.findOne({ user: req.user._id }).populate('image').then((profile) => {
          if (profile)
            return res.status(201).json({ 'profile': profile });
          else
            return res.status(400).json({ 'err': 'err' });
        });
      })    // if sccueedd the return the profile
    } else {
      new Profile(newProfile).save().then((profile) => res.json(profile));
    }
  });
};

exports.retrieveProfile = (req, res) => {
  Profile.findOne({ user: req.user._id }).then((profile) => {
    return res.status(201).json({ 'profile': profile, 'name': req.user.name });
  });
};
