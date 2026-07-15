# 📸 InstaPost

InstaPost is a premium, full-stack photo-sharing application built using **React (Vite)** on the frontend and **Node.js (Express)** on the backend. The app features dynamic photo uploading (via **ImageKit**), favoriting, advanced searching/filtering, and a robust **Upload Quota & Limits System**.

---

## ✨ Features

* **Interactive Feed**: Live dashboard featuring tag-based filtering, text search, liking, lightbox presentation, caption-copying, and direct image downloads.
* **Smart Uploads**: Drag-and-drop file interface with automated client-side validation for image formats and sizes under 5MB.
* **Post View Tracking**: Every time a post is opened in the lightbox, its view count is incremented via a dedicated API call. The view count is displayed on each card, in the lightbox panel, and aggregated in a **Total Views** stat pill in the feed header. Posts can also be sorted by **Most Viewed**.
* **Upload Quota Management**:
  * **Daily Limit**: Users are restricted to **3 photo uploads** per sliding 24-hour window. The frontend displays a real-time countdown showing exactly when the next slot opens.
  * **Total Capacity**: The application limits total storage to **15 photos** in the database. Users must delete older posts to free up slots.
* **Responsive Styling**: Crafted using Tailwind CSS, glassmorphism UI elements, smooth micro-animations, and full dark-mode support.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express, Multer, ImageKit SDK, Mongoose |
| **Database** | MongoDB Atlas (Cloud Database) |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
* [ImageKit](https://imagekit.io/) account for image hosting

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and populate it with your keys:
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
   IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
   IMAGEKIT_URL_ENDPOINT="your-imagekit-url-endpoint"
   ```
4. Run the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:3000`.*

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/instantPost
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173` (or the next available port, e.g. `5174`).*

---

## 🌐 Deployment & CORS Setup

When deploying the application to production (e.g., frontend on **Vercel** and backend on **Render**), you must configure **CORS (Cross-Origin Resource Sharing)** correctly.

The backend's [app.js](backend/src/app.js) is pre-configured to read allowed origins from environment variables.

### Environment Configuration on Render:
Add these key-value pairs to your Render backend Environment Settings:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Whitelists your deployed React frontend URL. |
| `ALLOWED_ORIGINS` | `https://another-url.com,https://test.com` | (Optional) Comma-separated list of additional origins. |

---

## 📊 Database Schema & API Reference

### Post Schema (`backend/src/models.js/post.js`)
```javascript
{
  image: String,
  caption: String,
  tags: [String],
  likes: Number,
  views: Number,      // incremented each time a post is opened in the lightbox
  comments: [{ text: String, author: String, createdAt: Date }],
  createdAt: Date,
  updatedAt: Date
}
```

### Key API Routes
* `GET /posts` - Fetches all posts sorted by creation date (newest first).
* `POST /create-post` - Handles uploading images to ImageKit and creating posts in MongoDB (enforces the 3/day and 15 total limits).
* `GET /posts/limit-status` - Returns the current user storage statistics and calculations for the next available slot.
* `PUT /posts/:id/like` - Increments the like count for a specific post.
* `PUT /posts/:id/view` - Increments the view count for a specific post (called automatically when a post lightbox is opened).
* `POST /posts/:id/comment` - Adds a comment to a post.
* `DELETE /posts/:id/comment/:commentId` - Removes a comment from a post.
* `DELETE /posts/:id` - Deletes a post from the database (freeing up storage space).
