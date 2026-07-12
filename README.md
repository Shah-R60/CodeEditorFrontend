# Cloud Code Editor & Remote Execution Engine

A comprehensive full-stack platform designed for technical interviews, featuring real-time collaborative coding, a secure remote code execution engine, and integrated video conferencing.

## Features

- **Real-Time Collaborative Coding**: Google Docs-style concurrent code editing powered by Yjs (CRDTs) and WebSockets, utilizing the Monaco Editor for a native IDE experience.
- **Secure Code Execution Engine**: A remote execution environment that uses Docker to run untrusted user code safely in isolated containers, evaluating outputs against predefined algorithmic test cases.
- **Integrated Video Calls**: Seamless in-browser video and audio communication powered by the Stream IO Video SDK, perfect for remote pair programming and technical interviews.
- **Role-Based Workflows**: Custom dashboards and UI flows tailored for both recruiters (creating drives, managing tests) and students (taking assessments, collaborating).
- **Serverless PostgreSQL Database**: Fast, scalable, and resilient database interactions using Prisma ORM with Neon DB.

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS
- **Code Editor Component:** Monaco Editor (`@monaco-editor/react`)
- **Real-Time Collaboration (CRDTs):** Yjs, `y-websocket`, `y-monaco`
- **Video/Audio Integration:** Stream IO (`@stream-io/video-react-sdk`)
- **Authentication:** Firebase Client
- **UI & Layout:** `lucide-react`, `@hello-pangea/dnd`, `react-resizable-panels`

### Backend
- **Runtime / Framework:** Node.js, Express.js
- **Secure Code Execution:** Docker (`dockerode`)
- **Database ORM:** Prisma
- **Database Engine:** PostgreSQL via Neon Serverless (`@neondatabase/serverless`)
- **Real-Time Infrastructure:** `socket.io`, `ws`, `y-websocket`
- **Authentication:** Firebase Admin, JSON Web Tokens (JWT), `bcryptjs`

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker Desktop (must be running for the code execution engine)
- Firebase Project (for Authentication)
- Stream IO Account (for Video SDK keys)
- Neon Database (for Serverless PostgreSQL)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CodeEditor
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Configure your environment variables
   # Copy .env.example to .env and fill in required keys:
   # - DATABASE_URL (Neon PostgreSQL)
   # - FIREBASE_PRIVATE_KEY & credentials
   
   # Run database migrations
   npx prisma generate
   npx prisma db push
   
   # Start the backend server (ensure Docker is running)
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   
   # Configure your environment variables
   # Create .env.local and add your API keys:
   # - NEXT_PUBLIC_FIREBASE_* configs
   # - NEXT_PUBLIC_STREAM_KEY
   
   # Start the frontend application
   npm run dev
   ```

4. **Access the Application:**
   Open `http://localhost:3000` in your browser.

## Core Architectures

1. **Code Execution Layer:** When code is submitted for execution, the Node.js backend provisions an ephemeral Docker container for the specific programming language. It executes the untrusted payload against hidden test cases, returning standard output/errors while strictly enforcing memory and timeout constraints to prevent host abuse.
2. **Real-time Synchronization:** The Monaco Editor's document state is bound to a Yjs document. This communicates over WebSockets (`y-websocket`) to the backend, utilizing Conflict-free Replicated Data Types (CRDTs) to ensure that multiple users typing simultaneously will never result in conflicted or out-of-sync code.
