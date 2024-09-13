const Chat = require("../models/chat.model.js");
const accessChats = async (req, res) => {
  const { userId } = req.body;
  if (!userId)
    return res.status(400).json({
      message: "User Id is missing",
      success: false,
    });
  let chats = await Chat.find({
    isGroup: false,
    $and: [
      {
        users: {
          $eleMatch: { $eq: userId },
        },
      },
      {
        users: {
          $eleMatch: { $eq: req.rootUserId },
        },
      },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  chats = await User.populate({
    path: "latestMessage.sender",
    select: "fullName email profilePic",
  });

  if (!chats.length > 0)
    return res.status(200).json({
      message: "Chat found",
      success: true,
      chat: chats[0],
    });

  data = {
    isGroup: false,
    chatName: "sender",
    users: [userId, req.rootUserId],
  };
  try {
    let newChat = await Chat.create(data);
    const chat = await Chat.find({ id: newChat._id }).populate(
      "users",
      "-password"
    );
    return res.status(200).json({
      message: "Chat found",
      success: true,
      chat,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error Occurred",
      success: false,
      error,
    });
  }
};

const fetchAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: {
        $eleMatch: { $eq: req.rootUserId },
      },
    })
      .populate("users")
      .populate("latestMessage")
      .populate("groupAdmin")
      .sort({ updated_at: -1 });

    const finalChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email profilePic",
    });

    return res.status(200).json({
      message: "Chats found",
      success: true,
      finalChats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Error Occurred",
      success: false,
    });
  }
};

const createGroup = async (req,res) => {
    const { chatName, users } = req.body;
    if (!chatName || !users) {
        res.status(400).json({ message: 'Please fill the fields',
            success: false
         });
      }
      let parsedUsers = JSON.parse(users);
      if(parsedUsers.length < 2)    return res.status(400).json({
        message: "Please add atleast one more user to form a group",
        success: false
      });
      try{
    let grp = await Chat.create({
        chatName,
        isGroup: true,
        users: parsedUsers,
        groupAdmin: req.rootUserId,

    });
    const createdGrp = await Chat.find({ id:grp._id }).populate('users','-password').populate("groupAdmin","-password");

    return res.status(201).json({
        message: "Group created successfully",
        success: true,
        createdGrp
    });
    } catch(error){
        console.error(error);
        return res.status(500).json({
            message:"Internal error Occured",
            success: false
        });
    }
};

const renameGroup = async (req,res) => {
    const { chatId,chatName } = req.body;
    if (!chatId || !chatName)
        return res.status(400).json({
    message: 'Provide Chat id and Chat name',
    success: false
    });
    try {
        const chat = Chat.findByIdAndUpdate(chatId,{$set: { chatName }
        }).populate('users','-password')
        .populate('groupAdmin',"-password");

        if(!chat) return res.status(404).json({
            message:"Group not found",
            success: false,
        });
        return res.status(202).json({
            message:"Group name updated successfully",
            success:true,
            chat
        })

    } catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal Error Occurred while renaming",
            success:false,
        });
    }
};

const addToGroup = async (req,res) => {
    const { chatId, userId } = req.body;
    try{
    const existing = await Chat.findOne({id: chatId}); //grp exists?
    if(!existing) return res.status(404).json({
        message:"Group not exist",
        success: false,
    });

    if(!existing.users.includes(userId)){
        const chat = await Chat.findByIdAndUpdate(chatId, {
            $push: {users: userId}
        }).populate("users", "-password")
        .populate("groupAdmin","-password");
        if(!chat) return res.status(404).json({
            message:"Group not found",
            success:false,
        })
        return res.status(202).json({
            message: "User added successfully",
            success: true,
            chat,
        });
    } else{
        return res.status(409).json({
            message: "User already exists",
            success:false
        });
    }

    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal error occurred while adding user",
            success:false
        });
    }

};

const removeFromGroup = async (req,res) => {
    const {userId, chatId } = req.body;
    try{
    const existing = await Chat.findOne({id: chatId});
    if(!existing) return res.status(404).json({
        message:"Group not exist",
        success: false,
    });
    if(!existing.users.includes(userId)){
        return res.status(409).json({
            message:"User not in the group",
            success:false,
        });
    }
    else{
        const chat = await Chat.findByIdAndUpdate(chatId, {
            $pull: {users: userId}
        }).populate("users", "-password")
        .populate("groupAdmin","-password");
        if(!chat) return res.status(404).json({
            message:"Group not found",
            success:false,
        })
        return res.status(202).json({
            message: "User removed successfully",
            success: true,
            chat,
        });
    }

    }catch(error){
        console.error(error);
        return res.status(500).json({
            message:"Internal error occurred",
            success:false
        });
    }

};

const removeContact = async (req, res) => {};

module.exports = { accessChats, fetchAllChats, createGroup, renameGroup, addToGroup, removeFromGroup, removeContact}