📌 Hellow — Real-Time Chat Application

Hellow is a full-stack real-time chat application that enables seamless one-to-one messaging with modern features like typing indicators, online status, message delivery tracking, file sharing, and profile management.

🚀 Features
💬 Chat Features
Real-time private messaging (Socket.IO)
Typing indicator (start/stop typing)
Message delivery status (✔ Delivered)
Message seen status (✔✔ Seen)
Auto-scroll chat window
Chat list with last message preview


👤 User Features
User authentication (JWT + Cookies)
Online / Offline status
Last seen tracking
Profile panel (like WhatsApp)
Edit profile (name, bio)
Change password
Avatar upload, update, delete
Default avatar (first letter fallback)


📁 Media Support
Image upload
File sharing
Cloud storage (Cloudinary)
⚡ Real-Time System
Socket-based messaging
User presence tracking
Room-based communication (userId)
Instant UI updates


🌐 Deployment Ready
Frontend deployed on Vercel
Backend deployed on Render
Environment-based API handling
CORS + Cookie-based authentication configured


🏗️ Tech Stack
Frontend
React (Vite)
Tailwind CSS
React Router
Socket.IO Client
Backend
Node.js
Express.js
MongoDB + Mongoose
Socket.IO
JWT Authentication
Cloud & Tools
Cloudinary (file uploads)
Vercel (frontend hosting)
Render (backend hosting)


📂 Project Structure
Hellow/
│
├── frontend/
│   ├── components/
│   │   ├── chat/
│   │   ├── ProfilePanel/
│   │   ├── Modals/
│   │
│   ├── pages/
│   ├── api/
│   ├── socket/
│   └── main.jsx
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── socket/
│   └── server.js
│
└── README.md


🔄 Application Flow
User Login →
Socket Connect →
Join Room (userId) →
Send Message →
Store in DB →
Emit to Receiver →
Update Delivered/Seen →
Update UI


⚙️ Environment Variables
Frontend (.env)
VITE_API_BASE_URL=http://localhost:4000
Backend (.env)
PORT=
MONGO_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=


🔐 Authentication Flow
JWT stored in HTTP-only cookies
Backend validates via middleware
Frontend uses credentials: "include"


🌍 Deployment Strategy
Branch Workflow
feature/* → Preview (Vercel)
main → Production
Best Practice
Feature branch → Test locally
Push → Preview deployment
Verify → Merge to main
Production auto deploy


🔗 API Endpoints (Sample)
Auth
POST /api/user/register
POST /api/user/login
POST /api/user/logout
Profile
GET /api/user/get-user-details
PUT /api/user/update-profile
POST /api/user/change-password
Avatar
POST /api/user/addAvatar
PUT /api/user/updateAvatar
DELETE /api/user/deleteAvatar
Chat
POST /api/chat/create-new-chat
GET /api/chat/messages/:chatId


⚡ Socket Events
Client → Server
private-message
typing-start
typing-stop
mark-as-seen
check-user-status
Server → Client
receive-private-message
user-typing
user-stop-typing
message-delivered
messages-seen
user-online
user-offline


🎯 Key Learnings
Real-time architecture using Socket.IO
Scalable chat system design
Authentication with cookies & JWT
Deployment with environment separation
Git workflow (feature → preview → main)
Optimistic UI updates
Clean modular backend structure


🚧 Future Improvements
Group chat support
Redis for scaling sockets
Message pagination
Push notifications
Read receipts per user (advanced)
Media compression


🧠 Developer Notes
Always work on feature branches
Never push directly to main
Match frontend & backend environments
Use loading states instead of alerts
Avoid page reloads — prefer state updates


🤝 Contribution

This project is currently under active development.
Feel free to fork and improve.

👨‍💻 Author
Piyush Rai

⭐ Final Note

Hellow is not just a chat app —
it’s a complete hands-on implementation of real-world backend + frontend architecture with real-time communication.