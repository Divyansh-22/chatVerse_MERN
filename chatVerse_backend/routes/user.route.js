const express = require("express");
const { register, login, validUser, googleAuth, searchUsers, getUserById, updateInfo, logout } = require("../controllers/user.controller.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js")
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/valid").get(isAuthenticated,validUser);
router.route("/google").post(googleAuth);
router.route("/logout").get(isAuthenticated,logout);
router.route('/users?').get(isAuthenticated, searchUsers);
router.route('/users/:id').get( isAuthenticated, getUserById);
router.route('/users/update/:id').patch( isAuthenticated, updateInfo);

module.exports = router;