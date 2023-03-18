const User = require('./../models/userModel');
const factory = require('./handleFactory');


// With FACTORY
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
// Do NOT update password with this (I already prevent it)
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);