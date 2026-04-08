# Juice Bar POS System

A full-stack Point of Sale (POS) system for Juice Bars, featuring a React frontend and a Serverless Node.js backend (Netlify Functions) with MongoDB.

## Project Structure

- **/Frontend**: React + Vite application.
- **/Backend**: Node.js API implemented as Netlify Functions.
- **netlify.toml**: Main configuration for Netlify deployment.

## Getting Started

### Prerequisites

- Node.js installed.
- MongoDB Atlas account (or local MongoDB).

### 1. Setup Environment
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies
Run from the root:
```bash
npm install --prefix Frontend
npm install --prefix Backend
```

### 3. Local Development
Start the full-stack app using Netlify CLI:
```bash
npx netlify dev
```
Alternatively, start them separately:
- **Backend**: `node Backend/dev.js`
- **Frontend**: `npm run dev --prefix Frontend`

## Deployment

This project is optimized for **Netlify**.
- Push the code to your GitHub repository.
- Connect the repository to Netlify.
- Configure `MONGODB_URI` and `JWT_SECRET` in Netlify's environment variables.
