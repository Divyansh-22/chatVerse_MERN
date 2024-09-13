const { accessChats, fetchAllChats, createGroup, renameGroup, addToGroup, removeFromGroup, removeContact} = require("../controllers/chat.controller.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js")
const express = require("express");
const router = express.Router();

router.post('/', isAuthenticated, accessChats);
router.get('/', isAuthenticated, fetchAllChats);
router.post('/group', isAuthenticated, createGroup);
router.patch('/group/rename', isAuthenticated, renameGroup);
router.patch('/groupAdd', isAuthenticated, addToGroup);
router.patch('/groupRemove', isAuthenticated, removeFromGroup);
router.delete('/removeuser', isAuthenticated);

module.exports = router