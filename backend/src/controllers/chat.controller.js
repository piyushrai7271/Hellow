import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

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

  // 3 Pagination (safe limits)
  const limit = Math.min(parseInt(req.query.limit) || 20, 50); // max 50
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  // 4 Fetch messages
  const messages = await Message.find({ chatId })
    .select("senderId message createdAt") // only needed fields
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "fullName avatar");

  // 5 Total count (optional but pro-level)
  const totalMessages = await Message.countDocuments({ chatId });

  // 6 Reverse for UI (old → new)
  const formattedMessages = messages.reverse();

  // 7 Response
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
      select: "message senderId createdAt",
      populate: {
        path: "senderId",
        select: "fullName",
      },
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // 3 Total count (for pagination UI)
  const totalChats = await Chat.countDocuments({ members: userId });

  // 4 Format response
  const formattedChats = chats.map((chat) => {
    let otherMembers = chat.members;

    // remove current user only for private chat
    if (!chat.isGroupChat) {
      otherMembers = chat.members.filter(
        (member) => member._id.toString() !== userId.toString()
      );
    }

    return {
      _id: chat._id,
      isGroupChat: chat.isGroupChat,
      members: otherMembers,
      lastMessage: chat.lastMessage,
      updatedAt: chat.updatedAt,
    };
  });

  // 5️⃣ Send response
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
  return res.status(200).json(
    new ApiResponse(
      200,
      { chat: formattedChat },
      "Chat created/fetched successfully"
    )
  );
});


export { getChatMessages, getUserChats, createNewChat };
