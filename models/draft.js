const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    draftId: { type: Number, unique: true },
    book: { type: Number, default: 0 },
    songNo: { type: Number, default: 0 },
    title: { type: String, required: true, unique: true },
    alias: { type: String },
    content: { type: String },
    key: { type: String },
    author: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    liked: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    updated: { type: Date }
});

module.exports = mongoose.model('Draft', modelSchema);