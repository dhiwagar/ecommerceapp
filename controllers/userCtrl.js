const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const { generateToken } = require("../config/jwtToken");
// const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validateMongoDbId = require("../utlis/validateMongodbId");
const createUser = asyncHandler(async (req, res) => {
    /**
     * TODO:Get the email from req.body
     */
    const email = req.body.email;
    /**
     * TODO:With the help of email find the user exists or not
     */
    const findUser = await User.findOne({ email: email });
  
    if (!findUser) {
      /**
       * TODO:if user not found user create a new user
       */
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      /**
       * TODO:if user found then thow an error: User already exists
       */
      throw new Error("User Already Exists");
    }
  });
// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({ email });
   
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?._id);
    
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: generateToken(findUser?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  });

  
  // logout functionality
  


  const getallUser = asyncHandler(async (req, res) => {
    try {
      const getUsers = await User.find();
      res.json(getUsers);
    } catch (error) {
      throw new Error(error);
    }
  });

  // Get a single user

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const getaUser = await User.findById(id);
      if(!getaUser){
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        getaUser,
      });
    } catch (error) {
      throw new Error(error);
    }
  });
  const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // validateMongoDbId(id);
    try {
      const deleteaUser = await User.findByIdAndDelete(id);
      if(!deleteaUser){
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        deleteaUser,
        message:"User deleted successfully"
      });
    } catch (error) {
      throw new Error(error);
    }
  });
  const handleRefreshToken = asyncHandler(async (req, res) => {
   
    const cookie = req.cookies;
    
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error(" No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("There is something wrong with refresh token");
      }
      const accessToken = generateToken(user?._id);
     
      res.json({ accessToken });
    });
  });
  const updatedUser = asyncHandler(async (req, res) => {
    
    const { _id } = req.user;

    validateMongoDbId(_id);
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          firstname: req?.body?.firstname,
          lastname: req?.body?.lastname,
          email: req?.body?.email,
          mobile: req?.body?.mobile,
        },
        {
          new: true,
        }
      );
      res.json(updatedUser);
    } catch (error) {
      throw new Error(error);
    }
  });

  const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const blockusr = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: true,
        },
        {
          new: true,
        }
      );
      res.json(blockusr);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const unblock = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
        },
        {
          new: true,
        }
      );
      res.json({
        message: "User UnBlocked",
        unblock
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
  
    console.log(cookie);
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate(
      { refreshToken }, // Filter object
      { refreshToken: "" } // Update object
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // forbidden
  });
  const updatePassword = asyncHandler(async (req, res) => {

    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  });
  const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  });
  const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found with this email");
    try {
      const token = await user.createPasswordResetToken();
      console.log(token,"token");
      await user.save();
      const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:1000/api/user/reset-password/${token}'>Click Here</>`;
      const data = {
        to: email,
        text: "Hey User",
        subject: "Forgot Password Link",
        htm: resetURL,
      };
      sendEmail(data);
      res.json(token);
    } catch (error) {
      throw new Error(error);
    }
  });
  

  module.exports = {
    createUser,
    blockUser,
    unblockUser,
    updatePassword,
    resetPassword,
    loginUserCtrl,
    updatedUser,
    getallUser,
    forgotPasswordToken,
    getaUser,
    deleteaUser,
    handleRefreshToken,
    logout,
  };  