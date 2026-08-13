NexMeet : Connect Instantly, Collaborate Seamlessly

NexMeet is an enterprise-grade, high-performance, real-time video conferencing platform built to mirror and enhance the core functionalities of modern unified communication suites like Zoom and Google Meet. Designed with a sleek, minimalist, technical deep-slate user interface, NexMeet leverages ultra-low latency peer-to-peer data channels and cutting-edge media capture systems to deliver fluid, highly synchronized audio, video, and text interaction across distributed networks.

✨ Advanced Features & Capabilities
⚡ Sub-Millisecond Peer-to-Peer Media Streams: Engineered on top of the native browser WebRTC framework, utilizing Google’s public STUN infrastructure (stun.l.google.com:19302) to bypass complex NAT barriers and achieve direct, lightning-fast audio and video synchronization.

🔗 Dynamic Room Routing & Parameter Extraction: Implements a zero-overhead room creation framework. Integrated React Router DOM hooks (useParams) allow users to spawn unique, highly secure meeting spaces on the fly simply by appending a dynamic parameter string to the base URL path (e.g., /t6yuhu).

🔐 Robust Authentication & Session Lifecycle: Features a unified, context-driven access management ecosystem (AuthContext). Offers clean, modular state switching between multi-step User Registration and Login flows, securely passing credential states down the tree while handling token distribution and form state persistence.

🎨 Immersive Slate-Midnight Aesthetics: Applies a customized, unified theme using Material UI (MUI v5). The viewport replaces jarring contrasts with a modern tech palette using midnight blues, clean slate containers, and brilliant electric-blue accents designed for extended sessions.

🛡️ Bulletproof Error Handling & Component Resilience: Outfitted with structural fallbacks, React runtime guardrails, automated server-status feedback loops, and interactive Snackbar toast alerts to gracefully capture and display validation issues without interrupting active sessions.

🛠️ Tech Stack & Architecture
Client Engine (Frontend)
React 18+ & Vite: Supercharged with a next-generation build toolchain providing sub-millisecond Hot Module Replacement (HMR) and optimized single-page bundle optimization.

Material UI (MUI v5) Core & Icons: Custom themes embedded via deep ThemeProvider decoration, enforcing visual separation between background canvases and elevated components.

React Router DOM v6: Configured with declarative dynamic path matrices to instantly register and render contextual workspaces across multi-tiered layouts.

WebRTC API: Native real-time media abstraction layer handling camera/microphone stream capture and media constraint assignment.

Orchestration Layer (Backend API)
Node.js & Express Framework: An asynchronous, event-driven architecture managing high-throughput HTTP REST routes and security interceptors.

MongoDB & Mongoose ODM: Schema-driven non-relational database storage tracking user identities, secure session records, and room session histories.

Socket.io Signaling Server: A dedicated bi-directional WebSocket connection matrix orchestrating WebRTC SDP (Session Description Protocol) offers, answers, and ICE candidate exchanges between remote peers.

📁 Repository Directory Structure

ZoomClone/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManagers.js
│   │   │   └── user.controller.js
│   │   ├── models/
│   │   │   ├── meeting.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   └── users.routes.js
│   │   └── app.js
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── desktop.ini
│   │   ├── phoneImage.png
│   │   └── vc.jpg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   └── react.svg
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── authentication.jsx
│   │   │   ├── history.jsx
│   │   │   ├── home.jsx
│   │   │   ├── landing.jsx
│   │   │   └── NexMeet.jsx
│   │   ├── styles/
│   │   │   └── videoComponent.module.css
│   │   ├── utils/
│   │   │   └── withAuth.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── App.test.js
│   │   ├── environment.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── Readme.md

⚙️ Deployment & Environment Orchestration
Prerequisites
Node.js Environment: Active LTS Distribution Build (v18.x or higher strongly recommended).

MongoDB Database: A local MongoDB community server daemon or a cloud-hosted MongoDB Atlas Cluster credential profile.

1. Spin Up the Backend API System
Open your terminal, navigate into the backend directory, install all production-grade dependencies, and map out your environment secrets:

Bash
cd backend
npm install
Create a .env file directly within the backend/ root folder:

Code snippet
PORT=8000
MONGO_URL=your_secured_mongodb_connection_string
JWT_SECRET=your_custom_cryptographic_signing_key_for_tokens
Execute the start script to initialize the Node server pipeline:

Bash
npm start
Expected Terminal Output:

Plaintext
MONGO connected DB Host: ac-dpslrrh-shard...
Listening on port 8000

2. Launch the React Frontend Client
Open a secondary terminal tab, navigate into the frontend directory, and install dependencies:

Bash
cd frontend
npm install
Boot up the Vite local dev server:

Bash
npm run dev
Expected Terminal Output:

Plaintext
VITE ready in 228 ms

➜  Local:   http://localhost:5173/
🎮 Workflow Execution Blueprint
Accessing the Portal: Open a browser profile and navigate to http://localhost:5173.

Establishing an Active Session: Choose between the Register or Login options. Fill out the stylized dark-mode form fields to generate your JWT access token and pass context downward.

Spawning or Entering Rooms: Create an ad-hoc session room by typing or appending a custom unique token identifier into your browser URL path (e.g., http://localhost:5173/my-secure-meeting-session).

Authorizing Media Streams: When prompted by your web browser, grant camera and microphone access. This triggers the internal WebRTC lifecycle hook, establishing peer handshake tunnels and rendering synchronized video canvases on screen.