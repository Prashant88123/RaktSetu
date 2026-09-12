# RaktSetu

> Bridge the gap between blood donors and hospitals.

[![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/frontend-React-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/backend-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

## Overview

RaktSetu is a full-stack web application designed to bridge the gap between blood donors and hospitals. It provides a platform for users to register as donors, blood banks to manage their inventories, and hospitals to request blood efficiently. The system integrates real-time communication and interactive maps to streamline the blood donation and request process, making lifesaving resources more accessible to those in need.

## Tech Stack

- **Languages:** JavaScript, HTML, CSS
- **Frontend:** React, React Router DOM, React Leaflet, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose, Socket.io, groq-sdk (AI service)
- **Database:** MongoDB
- **APIs/Libraries:** Axios, bcryptjs, jsonwebtoken, dotenv, cors
- **Dev Tools:** ESLint, PostCSS, Nodemon

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- (Optional) [Vercel](https://vercel.com/) for deployment

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Prashant88123/RaktSetu.git
   cd RaktSetu
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   - In `server/`, create a `.env` file with the required environment variables (e.g., MongoDB URI, JWT secret, etc.).
   - Refer to any sample or documentation for required keys.

## Usage

1. **Start the backend server**

   In the `server/` directory:

   ```bash
   # For development (auto-restart)
   npm run server

   # Or for production
   npm run start
   ```

2. **Start the frontend development server**

   In the `client/` directory:

   ```bash
   npm run dev
   ```

3. **Access the application**

   Open your browser and navigate to [http://localhost:5173](http://localhost:5173) (default Vite port) to use RaktSetu.

4. **Build & preview the frontend (optional)**

   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
RaktSetu/
├── LICENSE
├── client/
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── App.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages/
│   │   └── utils/
│   └── tailwind.config.js
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection config
│   ├── controllers/           # Business logic for routes
│   ├── index.js               # Express app entry point
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/                # Mongoose models (User, Hospital, BloodBank, etc.)
│   ├── routes/                # Route handlers
│   └── utils/
│       └── aiService.js       # AI utility integration
```

## API Endpoints

| Method | Endpoint           | Description                  |
|--------|--------------------|------------------------------|
| POST   | `/auth/login`      | User login                   |
| POST   | `/auth/register`   | User registration            |
| GET    | `/auth/logout`     | User logout                  |
| GET    | `/bank`            | Get blood bank information   |
| POST   | `/bank`            | Add blood bank information   |
| GET    | `/donor`           | Get donor information        |
| POST   | `/donor`           | Add donor information        |
| GET    | `/hospital`        | Get hospital information     |
| POST   | `/hospital`        | Add hospital information     |

## Contributing

Contributions are welcome! To contribute:

1. **Fork** this repository.
2. **Create a branch** for your feature or fix.
3. **Commit** your changes.
4. **Open a Pull Request** describing your changes.

Please ensure your code follows the project's linting and formatting guidelines.

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this code with attribution.

---
[![README powered by ReadmeAI](https://img.shields.io/badge/README-powered%20by%20ReadmeAI-4c9be8?style=flat-square&logo=markdown)](https://www.readmeai.in)
