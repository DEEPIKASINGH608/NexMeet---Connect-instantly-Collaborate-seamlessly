NexMeet
Connect Instantly, Collaborate Seamlessly
NexMeet is a real-time video conferencing application designed to replicate core Zoom/Google Meet features. Built on a modern tech stack, it enables peer-to-peer audio and video communication, dynamic meeting room generation, and user authentication wrapped in a dark-blue user interface.

🚀 Key Features
Real-Time Video & Audio Calling: Powered by WebRTC and Google's public STUN servers for seamless peer-to-peer media streams.

Dynamic Room Routing: Join or create custom meetings instantly via unique URLs (e.g., /room-id).

Secure User Management: Full authentication system offering Registration and Login flows.

Modern Blue Tech UI: Styled with a dark-slate theme using React Material UI (MUI) components.

Robust Backend: Node.js/Express server backed by MongoDB to manage users, sessions, and meeting histories.

🛠️ Tech Stack
Frontend
React (Powered by Vite for ultra-fast builds)

Material UI (MUI v5) for component design

React Router DOM for dynamic room routing

WebRTC for peer-to-peer connection streams

Backend
Node.js & Express

MongoDB (via Mongoose)

Socket.io (used for WebRTC signaling and coordinate room entry)

📦 Project Structure
Plaintext
ZoomClone/
├── backend/            # Express server, database connections & routing
│   ├── src/
│   │   └── app.js     # Server entry point (Port 8000)
│   └── package.json
└── frontend/           # React client-side application
    ├── src/
    │   ├── pages/     # Landing, Authentication, and Room components
    │   ├── App.jsx    # Client router setup
    │   └── main.jsx
    └── package.json    # Vite configurations (Port 5173)
⚙️ Setup & Installation
Prerequisites
Node.js (v16.x or higher recommended)

MongoDB Atlas account or a local MongoDB instance

1. Backend Setup
Navigate to the backend directory:

Bash
cd backend
Install the server dependencies:

Bash
npm install
Create a .env file in the backend root directory and add your MongoDB connection string and server port:

Code snippet
PORT=8000
MONGO_URL=your_mongodb_connection_string
Start your development API server:

Bash
npm start
Your backend server should now be listening on http://localhost:8000

2. Frontend Setup
Open a new terminal window and navigate to the frontend directory:

Bash
cd frontend
Install the web dependencies:

Bash
npm install
Spin up the Vite development server:

Bash
npm run dev
Your frontend application will launch on http://localhost:5173

🎮 How to Use NexMeet
Open http://localhost:5173 in your browser.

Click Get Started or Login to create an account or authenticate.

Once logged in, generate a meeting link or type in a unique meeting ID (e.g., http://localhost:5173/my-custom-room) to begin an active video call stream!