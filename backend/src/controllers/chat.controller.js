import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import mongoose from "mongoose";

const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  // 1 Validate chatId
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Valid Chat ID is required");
  }

  // 2 Check if chat exists AND user is part of it
  const chat = await Chat.findOne({
    _id: chatId,
    members: userId,
  }).select("_id");

  if (!chat) {
    throw new ApiError(404, "Chat not found or access denied");
  }

  // 3 Pagination
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  // ✅ 4 Fetch messages (IMPORTANT FIX)
  const messages = await Message.find({
    chatId,
    deletedFor: { $ne: userId }, // 🔥 hide "delete for me"
  })
    .select("senderId message messageType fileUrl createdAt isDeleted")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "fullName avatar");

  const totalMessages = await Message.countDocuments({
    chatId,
    deletedFor: { $ne: userId },
  });

  // ✅ 5 Normalize
  const formattedMessages = messages.reverse().map((msg) => ({
    messageId: msg._id,
    message: msg.isDeleted ? "This message was deleted" : msg.message,
    messageType: msg.isDeleted ? "text" : msg.messageType || "text",
    fileUrl: msg.isDeleted ? "" : msg.fileUrl || "",
    fromUserId:
      msg.senderId?._id?.toString() || msg.senderId.toString(),
    createdAt: msg.createdAt,
    isDeleted: msg.isDeleted || false, // 🔥 NEW
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        messages: formattedMessages,
      },
      "Chat messages fetched successfully !!"
    )
  );
});
const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1 Pagination (safe)
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  // 2 Fetch chats
  const chats = await Chat.find({ members: userId })
    .select("members isGroupChat lastMessage updatedAt")
    .populate("members", "fullName avatar")
    .populate({
      path: "lastMessage",
      select: "message messageType fileUrl senderId createdAt", // ✅ FIXED
      populate: {
        path: "senderId",
        select: "fullName",
      },
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // 3 Total count
  const totalChats = await Chat.countDocuments({ members: userId });

  // 4 Format response
  const formattedChats = chats.map((chat) => {
    let otherMembers = chat.members;

    if (!chat.isGroupChat) {
      otherMembers = chat.members.filter(
        (member) => member._id.toString() !== userId.toString()
      );
    }

    return {
      _id: chat._id,
      isGroupChat: chat.isGroupChat,
      members: otherMembers,
      lastMessage: chat.lastMessage, // now contains messageType ✅
      updatedAt: chat.updatedAt,
    };
  });

  // 5 Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalChats,
        totalPages: Math.ceil(totalChats / limit),
        chats: formattedChats,
      },
      "Chats fetched successfully !!"
    )
  );
});
const createNewChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.body;

  // 1️⃣ Validate input
  if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
    throw new ApiError(400, "Valid otherUserId is required");
  }

  // 2️⃣ Prevent self chat
  if (userId.toString() === otherUserId.toString()) {
    throw new ApiError(400, "You cannot create chat with yourself");
  }

  // 3️⃣ Check if chat already exists
  let chat = await Chat.findOne({
    isGroupChat: false,
    members: { $all: [userId, otherUserId] },
  })
    .populate("members", "fullName avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "senderId",
        select: "fullName",
      },
    });

  // 4️⃣ If not exists → create new chat
  if (!chat) {
    chat = await Chat.create({
      members: [userId, otherUserId],
    });

    // populate after creation
    chat = await Chat.findById(chat._id)
      .populate("members", "fullName avatar")
      .populate("lastMessage");
  }

  // 5️⃣ Format response (remove current user for private chat)
  const formattedMembers = chat.members.filter(
    (member) => member._id.toString() !== userId.toString()
  );

  const formattedChat = {
    _id: chat._id,
    isGroupChat: chat.isGroupChat,
    members: formattedMembers,
    lastMessage: chat.lastMessage,
    updatedAt: chat.updatedAt,
  };

  // 6️⃣ Send response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { chat: formattedChat },
        "Chat created/fetched successfully"
      )
    );
});
const uploadMessageFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Message file is missing");
    }

    // ✅ Upload
    const result = await uploadOnCloudinary(req.file, "chat-files");

    if (!result) {
      throw new ApiError(500, "File upload failed");
    }

    // ✅ Detect type
    let messageType = "file";

    if (req.file.mimetype.startsWith("image")) {
      messageType = "image";
    } else if (req.file.mimetype.startsWith("video")) {
      messageType = "video";
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          fileUrl: result.secure_url,
          messageType,
          public_id: result.public_id,
        },
        "File uploaded successfully"
      )
    );
  } catch (error) {
    console.error("Upload Message Error:", error.message);
    throw new ApiError(500, error.message || "Upload failed");
  }
});

export { getChatMessages, getUserChats, createNewChat, uploadMessageFile };
