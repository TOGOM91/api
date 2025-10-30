const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already exists"], 
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'}, 


    wishlist: [{
        type: Schema.Types.ObjectId, ref: 'Product' }], 

    profilPic: {
        type: String, 
    }     
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);