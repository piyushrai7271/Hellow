
# 💬 Hello — Real-Time Chat Application

> A modern, full-stack real-time chat application built with React, Node.js, Socket.IO, and MongoDB.

Hellow enables seamless one-to-one messaging with typing indicators, online status tracking, message delivery receipts, file sharing, and comprehensive profile management—all in real-time.

---

## 🌟 Highlights

- ⚡ **Real-time messaging** powered by Socket.IO
- 🔐 **Secure authentication** with JWT and HTTP-only cookies
- 📱 **WhatsApp-like UI** with delivery/seen indicators
- 📁 **Media support** with Cloudinary integration
- 🚀 **Production-ready** deployment on Vercel + Render
- 🎨 **Modern UI** built with React and Tailwind CSS

---

## ✨ Features

### 💬 Chat Functionality
- Real-time private messaging
- Typing indicators (start/stop)
- Message delivery status (✔ Delivered)
- Message seen status (✔✔ Seen)
- Auto-scroll to latest message
- Chat list with last message preview

### 👤 User Management
- JWT-based authentication with HTTP-only cookies
- Online/Offline status tracking
- Last seen timestamp
- WhatsApp-inspired profile panel
- Edit profile (name, bio)
- Change password
- Avatar management (upload, update, delete)
- Default avatar with initials fallback

### 📁 Media & Files
- Image upload and preview
- File sharing capabilities
- Cloud storage via Cloudinary
- Optimized media delivery

### ⚡ Real-Time System
- Socket.IO-powered instant messaging
- User presence tracking
- Room-based communication
- Instant UI updates without page reload

---

## 🛠️ Tech Stack

### Frontend
- **React** (Vite) - Fast, modern build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database & ODM
- **Socket.IO** - WebSocket server
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Cloud & Deployment
- **Cloudinary** - File uploads and storage
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

---

## 📂 Project Structure
Hellow/
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API configuration
│   │   ├── components/
│   │   │   ├── chat/         # Chat components
│   │   │   └── ProfilePanel/ # Profile components
│   │   ├── pages/            # Login, Register, Welcome
│   │   ├── routes/           # Route configuration
│   │   ├── socket/           # Socket.IO client setup
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Auth, error handling
│   │   ├── socket/
│   │   │   ├── handlers/     # Socket event handlers
│   │   │   └── index.js
│   │   ├── utils/            # Helper functions
│   │   └── app.js
│   └── package.json
│
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/hellow.git
   cd hello
```

2. **Setup Backend**
```bash
   cd backend
   npm install
```

   Create `.env` file:
```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
```

   Start server:
```bash
   npm run dev
```

3. **Setup Frontend**
```bash
   cd frontend
   npm install
```

   Create `.env` file:
```env
   VITE_API_BASE_URL=http://localhost:4000
```

   Start development server:
```bash
   npm run dev
```

4. **Open application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:4000`

---

## 🔄 Application Flow
User Login
↓
Socket Connection Established
↓
Join Room (based on userId)
↓
Send Message
↓
Store in MongoDB
↓
Emit to Receiver via Socket.IO
↓
Update Delivery/Seen Status
↓
Real-time UI Update

---

## 🔐 Authentication

- **JWT tokens** stored in HTTP-only cookies (secure & XSS-safe)
- Backend validates tokens via middleware
- Frontend sends credentials with every request (`credentials: "include"`)
- Automatic token refresh mechanism

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | User login |
| POST | `/api/user/logout` | User logout |

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/get-user-details` | Get user profile |
| PUT | `/api/user/update-profile` | Update profile info |
| POST | `/api/user/change-password` | Change password |

### Avatar Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/addAvatar` | Upload avatar |
| PUT | `/api/user/updateAvatar` | Update avatar |
| DELETE | `/api/user/deleteAvatar` | Delete avatar |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/create-new-chat` | Create chat |
| GET | `/api/chat/messages/:chatId` | Get messages |

---

## ⚡ Socket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `private-message` | Send message to user |
| `typing-start` | Notify typing started |
| `typing-stop` | Notify typing stopped |
| `mark-as-seen` | Mark messages as seen |
| `check-user-status` | Check if user is online |

### Server → Client
| Event | Description |
|-------|-------------|
| `receive-private-message` | Receive new message |
| `user-typing` | User is typing |
| `user-stop-typing` | User stopped typing |
| `message-delivered` | Message delivered |
| `messages-seen` | Messages marked as seen |
| `user-online` | User came online |
| `user-offline` | User went offline |

---

## 🌍 Deployment

### Branch Workflow
- `feature/*` branches → Preview deployments (Vercel)
- `main` branch → Production deployment

### Deployment Strategy
1. Create feature branch from `main`
2. Develop and test locally
3. Push to trigger preview deployment
4. Verify preview deployment
5. Create PR and merge to `main`
6. Auto-deploy to production

### Live Deployment
- **Frontend**: [Deployed on Vercel](https://your-app.vercel.app)
- **Backend**: [Deployed on Render](https://your-api.onrender.com)

---

## 🎯 Key Learnings

- ✅ Architected real-time communication with Socket.IO
- ✅ Implemented scalable chat system design
- ✅ Secured authentication with JWT and HTTP-only cookies
- ✅ Configured multi-environment deployment (dev/prod)
- ✅ Established Git workflow (feature → preview → main)
- ✅ Built optimistic UI updates for better UX
- ✅ Structured modular, maintainable backend

---

## 🚧 Roadmap

- [ ] **Group chat** support
- [ ] **Redis integration** for horizontal scaling
- [ ] **Message pagination** for performance
- [ ] **Push notifications** (PWA)
- [ ] **Advanced read receipts** per user
- [ ] **Media compression** before upload
- [ ] **Voice messages**
- [ ] **Video calls** (WebRTC)

---

## 🧑‍💻 Development Guidelines

### Best Practices
- ✅ Always work on feature branches
- ✅ Never push directly to `main`
- ✅ Match frontend & backend environments
- ✅ Use loading states instead of alerts
- ✅ Avoid page reloads — update state
- ✅ Write meaningful commit messages
- ✅ Test before creating PR

### Code Style
- Use ESLint + Prettier for consistent formatting
- Follow component-based architecture
- Keep functions small and focused
- Add comments for complex logic

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

---

## 👨‍💻 Author

**Piyush Rai**

- GitHub: [https://github.com/piyushrai7271](https://github.com/yourusername)
- LinkedIn: [https://www.linkedin.com/in/piyush-rai-2322771a1/](https://linkedin.com/in/yourprofile)
- Portfolio: [yourportfolio.com](https://yourportfolio.com)

---

## 🙏 Acknowledgments

- Socket.IO documentation
- MongoDB documentation
- React community
- Tailwind CSS team

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐️!

---

<p align="center">Made with ❤️ by Piyush Rai</p>

