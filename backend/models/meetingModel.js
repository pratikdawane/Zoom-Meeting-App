
const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
    user_id: { 
        type: String 
    },
    meetingCode: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now, 
        required: true 
    },

    time: { 
        type: String, 
        default: () => new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }), 
        required: true 
    }
})

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = { Meeting };
