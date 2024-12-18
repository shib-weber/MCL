const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    pic: { type: String,default:'basic.png' },
    slno:{type:String,required:true},
    name: { type: String, required: true },
    year:{type:String,required:true},
    role:{type:String, required:true},
    createdAt: { type: Date, default: Date.now }, // Optional: to track when the image was uploaded
});

const Player = mongoose.model('player', playerSchema);

module.exports = Player;
