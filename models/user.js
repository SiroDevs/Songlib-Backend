const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    name: { type: String },
    username: { type: String, unique: true },
    email: { type: String },
    phone: { type: String },
    bio: { type: String },
    lastseen: { type: Date, default: Date.now },
    created: { type: Date },
    updated: { type: Date }
});

module.exports = mongoose.model('User', modelSchema);;