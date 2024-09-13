const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    sender :{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    file: {
        type: String,
    },
    readStatus: {
        type: Boolean,
        default: false,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },

}, {timestamps: true});

module.exports = mongoose.model('Message',messageSchema);