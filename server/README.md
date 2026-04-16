# FamilyTrip Backend

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)

## Features
- 🚀 User Authentication (Apple, Google)
- 📦 MongoDB connection
- 🔧 RESTful API setup
- 📂 Basic project structure
- 📂 Subscription Status for IAP
- 📂 Expo Notifications Infrastructure


## Prerequisites
- Node.js
- npm (Node Package Manager)
- MongoDB (mongoose)
- JWT (jsonwebtoken)
- RevenueCat (Apple/Google IAP)


## Installation
1. **Install dependencies:**
    ```bash
    npm install
    ```


## Configuration
2. **Create a `.env` file** in the root directory and add your MongoDB connection string and other environment variables:
    ```plaintext
    MONGODB_USERNAME=mongodb Username
    MONGODB_PASSWORD=mongodb Password
    MONGODB_URI=mongodb URI

    JWT_SECRET=jwt secret decode key
    PORT=4000

    AWS_BASE_URL=https://-----.s3.us-east-1.amazonaws.com/
    AWS_S3_REGION= 
    AWS_S3_ACCESS_KEY_ID= 
    AWS_S3_SECRET_ACCESS_KEY= 
    AWS_S3_BUCKET_NAME= 

    REVENUECAT_API_KEY=sk_wBOZTZivcWOUsZBRzUzfFFatTxgAK
    
    ```


## Running the Application (Build)
To start the server, you can use either of the following commands:
### Using Node
Build a dist and run it
```bash
npm run build && node dist/index.js
```
### (Watches changes and reloads automatically)
```bash
npm run dev
```

