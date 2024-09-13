const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const { OAuth2Client } = require("google-auth-library");

const register = async (req,res) => {
  const {fullName, email, password } = req.body;
  if(!fullName || !email || !password){
      let message = "";
      if(!fullName)   message = "Name is missing";
      else if(!email)   message = "Email Id is missing";
      else   message = "password is missing";
      return res.status(400).json({
          message,
          success: false
      })
  }
  try{
    const user = await User.findOne({ email });
    if(user){
        return res.status(200).json({
            message: "User already registered",
            user,
            success: false
        })
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newuser = new User({ email, password, fullName });
    const token = await newuser.generateAuthToken();
    await newuser.save();

    return res.status(201).json({
        message: "User registered Successfully",
        newuser,
        token,
        success: true
    })
    } catch(error){
        console.error("Error in registering the account ",error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const login = async (req,res) => {
  const { email, password } = req.body;
  if(!email || !password){
      let message = "";
      if(!email)   message = "Email Id is missing";
      else   message = "password is missing";
      return res.status(400).json({
          message,
          success: false
      })
  }
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(200).json({
                message: "User doesn't exist",
                success: false
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(200).json({
                message: "Invalid Password",
                success: false,
            });
        }
        const token = await user.generateAuthToken();
        await user.save();
          return res
            .status(201)
            .cookie("userToken", token, {
              maxAge: 1 * 24 * 60 * 60 * 1000,
              httpOnly: true,
            })
            .json({
              message: `welcome back ${user.fullName}`,
              user,
              token,
              success: true,
            });
        
    } catch(error){
        console.error("Error in logging in ",error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }

};

const validUser = async (req, res) => {
  try {
    const validuser = await User
      .findOne({ _id: req.rootUserId })
      .select('-password');
    if (!validuser) res.json({ message: 'user is not valid' });
    res.status(201).json({
      message:"User is valid",
      user: validuser,
      token: req.token,
    });
  } catch (error) {
    res.status(500).json({ error: error });
    console.log(error);
  }
};

const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });
    const { email_verified, email, name, picture } = verify.payload;
    if (!email_verified) res.json({ message: 'Email Not Verified' , success: false});
    const userExist = await user.findOne({ email }).select('-password');
    if (userExist) {
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "Logged In Successfully", token: tokenId, user: userExist, success: true });
    } else {
      const password = email + process.env.CLIENT_ID;
      await User.create({ 
        name: name,
        profilePic: picture,
        password,
        email,
      });
      // await newUser.save();
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200)
        .json({ message: 'User registered Successfully',success: true, token: tokenId });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error,
      success: true 
    });
    console.log('Error in googleAuth backend' + error);
  }
};

const searchUsers = async (req, res) => {
  // const { search } = req.query;
  const search = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(search).find({ _id: { $ne: req.rootUserId } });
  let message = "User found";
  if(users.length == 0) message = "User not found";
  return res.status(200).json({
    message,
    users,
    success: true
  });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedUser = await User.findOne({ _id: id }).select('-password');
    res.status(200).json({
      message:"User",
      selectedUser,
    success: true});
  } catch (error) {
    res.status(500).json({ 
      message:"Internal Error occurred while searching the user", error: error, success: true });
  }
};

const updateInfo = async (req, res) => {
  const { id } = req.params;
  const { bio, name } = req.body;
  const updatedUser = await User.findByIdAndUpdate(id, { name, bio });
  return res.status(200).json({
    message: "Updated Successfully",
    success: true,
    updatedUser});
};

const logout = async (req, res) => {
    try {
      console.log(req.rootUser);
      req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
      return res.status(200).cookie("userToken", "", { maxAge: 0 }).json({
        message: "Logged out successfully",
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "An Internal error occurred while logging out the user",
        success: false,
      });
    }
  };

module.exports = {register, login, validUser, googleAuth, searchUsers, getUserById, updateInfo ,logout}