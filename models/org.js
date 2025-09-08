const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    orgId: { type: Number, unique: true },
    org: { type: Number, required: true },
    title: { type: String, required: false },
    bio: { type: String, required: false },
    public: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    updated: { type: Date }
});

module.exports = mongoose.model('Org', modelSchema);;