const Message = require("../models/message.model.js")
const Chat = require("../models/chat.model.js")

const sendMessage = async (req,res) => {
    const { chatId, message } = req.body;
    try{
        let msg = await Message.create({
            "sender":req.rootUserId,
            message,
            chatId,
        });
        msg = await (
            await msg.populate("sender","fullName profilePic email")
        ).populate({
            path: "chatId",
            select:"chatName isGroup users",
            model:"Chat",
            populate:{
                path:'users',
                select:'name email profilePic',
                model:'User',
            }
        });
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: msg
        });

        return res.status(200).json({
            message:"message sent",
            success:true,
            latestMessage:msg
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Internal Server Error Occurred",
            error,
            success:false
        })
    }

};

const getMessages = async (req,res) => {
    const { chatId } = req.params;
    try {
        const  messages = await Message.find({ chatId });
        messages = await messages.populate({
            path: 'sender',
            select: "fullName profilePic email",
            model: 'User'
        }).populate({
            path:'chatId',
            model:'Chat'
        })
        return res.status(200).json({
            message:"Messages found",
            success:true,
            messages
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Internal Error Occured",
            success: false,
            error,
        });
    }
}

module.exports = {sendMessage, getMessages}