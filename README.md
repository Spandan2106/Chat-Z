# Chat_Z - Real-Time Messaging Platform

![Chat_Z Logo](https://via.placeholder.com/150?text=Chat_Z)

Chat_Z is a revolutionary real-time messaging platform designed to connect people globally with simplicity, security, and reliability. Built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io, it offers a seamless communication experience across devices.

## 🚀 Features

### 💬 Real-Time Communication
*   **Instant Messaging:** Send and receive messages instantly with Socket.io.
*   **Group Chats:** Create and manage group conversations with multiple participants.
*   **Typing Indicators:** See when others are typing in real-time.
*   **Online Status:** View who is currently online and when they were last active.
*   **Read Receipts:** Know when your messages have been read (✓✓).

### 🔐 Security & Privacy
*   **End-to-End Encryption:** Messages are encrypted to ensure privacy.
*   **Authentication:** Secure user authentication using JWT (JSON Web Tokens).
*   **User Blocking:** Block unwanted contacts to maintain a safe environment.

### 🎨 User Experience
*   **Responsive Design:** Fully optimized for both desktop and mobile devices.
*   **Profile Management:** Update your profile picture, status, and personal details.
*   **Dark Mode:** (Coming Soon) Easy on the eyes for night-time chatting.
*   **File Sharing:** Share images, videos, and documents seamlessly.

### 🛠️ Advanced Features
*   **Video Calls:** Initiate peer-to-peer video calls with WebRTC.
*   **Status Updates:** Share temporary text or image updates with your contacts.
*   **Admin Panel:** Comprehensive dashboard for administrators to manage users and view system stats.
*   **Support Ticket System:** Integrated ticketing system for user support and inquiries.
*   **Global Search:** Find users and groups easily with a powerful search function.

## 🏗️ Tech Stack

*   **Frontend:** React.js, Vite, Context API
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Real-Time Engine:** Socket.io
*   **Video/Audio:** Simple-Peer (WebRTC)
*   **Styling:** CSS3, Responsive Flexbox/Grid

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/Real-time-chat--app-2026.git
    cd Real-time-chat--app-2026
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Variables:**
    Create a `.env` file in the `backend` directory with the following:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```
    Create a `.env` file in the `frontend` directory with the following:
    ```env
    VITE_API_URL=http://localhost:5001
    ```

5.  **Run the Application:**
    *   **Backend:** `cd backend && npm start`
    *   **Frontend:** `cd frontend && npm run dev`

## 🚀 Deployment

### Backend (Render)
1.  Connect your repo to Render.
2.  Set Root Directory to `backend`.
3.  Set Build Command to `npm install`.
4.  Set Start Command to `npm start`.
5.  Add Environment Variables from your `.env` file.

### Frontend (Vercel)
1.  Connect your repo to Vercel.
2.  Set Root Directory to `frontend`.
3.  Set Framework Preset to `Vite`.
4.  Add `VITE_API_URL` environment variable pointing to your deployed backend URL.

## 🤝 Contributing

Contributions are welcome! Please read our CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created by **Spandan Das** | © 2026 Chat_Z