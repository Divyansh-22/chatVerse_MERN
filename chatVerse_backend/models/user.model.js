const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
      type: String,
      default: 'Available',
    },
    profilePic: {
      type: String,
      default:
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    
},{ timestamps: true});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  });
  userSchema.methods.generateAuthToken = async function () {
    try {
      let token = jwt.sign(
        { id: this._id, email: this.email },
        process.env.SECRET_KEY,
        {
          expiresIn: '24h',
        }
      );
  
      return token;
    } catch (error) {
      console.log('error while generating token');
    }
  };

const User = mongoose.model("User",userSchema);
module.exports = User