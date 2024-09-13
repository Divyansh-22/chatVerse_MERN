const {sendMessage, getMessages } = require("../controllers/message.controller.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js")
const express = require("express");
const router = express.Router();

router.route("/").post(isAuthenticated,sendMessage);
router.route("/:chatId").get(isAuthenticated,getMessages);

module.exports = router