# 🧠 Facebook Marketing Leads App (Node.js + Firebase)

## 📋 Overview  
**Facebook Leads App** is a **Node.js web application** that integrates with the **Meta (Facebook) Marketing API** to fetch, store, and display **Lead Ads data** in real time.  

The system allows secure **OAuth2 login via Facebook**, retrieves **Ad Accounts → Campaigns → Lead Forms → Leads**, and provides a **dashboard view** where users can browse and **export leads to CSV**.  
Data is stored securely in **Firebase Firestore**.

---

## 🚀 Key Features  
✅ **Facebook OAuth2 Login** — Connect your Meta account securely.  
✅ **Token Management** — Handles both short-lived and long-lived access tokens.  
✅ **Ad Accounts & Campaigns** — Automatically fetches linked ad accounts and campaigns.  
✅ **Lead Retrieval** — Fetches form leads with name, email, phone, and created time.  
✅ **Firebase Firestore Integration** — Secure token and leads storage.  
✅ **CSV Export** — Quickly export leads for external use or analysis.  
✅ **Clean UI** — EJS-powered views for dashboard and login pages.  
✅ **Modular Structure** — Organized routes, services, and utilities for scalability.  

---

## ⚙️ Tech Stack
| Layer | Technology |
|-------|-------------|
| **Backend** | Node.js (Express.js) |
| **Frontend** | EJS Templates + HTML + CSS |
| **Database** | Firebase Firestore |
| **Auth** | Facebook OAuth2 (Meta for Developers) |
| **Export** | CSV Writer |
| **Environment** | dotenv for config, Firebase Admin SDK for access |

---

## 📂 Project Structure
```
facebook-leads-app/
│
├── src/
│   ├── app.js                  # Express.js server (entry point)
│   │
│   ├── routes/                 # Application routes
│   │   ├── auth.js             # Facebook OAuth2 login flow
│   │   ├── facebook.js         # Fetch ad accounts, campaigns, leads
│   │   └── export.js           # Export collected leads to CSV
│   │
│   ├── services/               # API & data layer
│   │   ├── facebookService.js  # Handles Meta API requests
│   │   └── firebaseService.js  # Firestore CRUD operations
│   │
│   ├── utils/                  # Utility functions
│   │   └── csvExporter.js      # Converts JSON data to CSV format
│   │
│   └── views/                  # Frontend (EJS templates)
│       ├── login.ejs           # Login screen for Facebook OAuth
│       └── dashboard.ejs       # Leads dashboard UI
│
├── firebase-service-account.json  # Firebase credentials (Admin SDK key)
├── .env                           # Environment configuration file
├── package.json                   # Node.js dependencies and scripts
└── README.md                      # Project documentation
```

---

## 🔑 Environment Variables
The application uses environment variables stored in a `.env` file:
```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/callback
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
SESSION_SECRET=your_random_secret_key
```

> ⚠️ Keep your `.env` and `firebase-service-account.json` files private.  
> Never share them or push them to public repositories.

---

## 🧾 License
```
Copyright (c) 2025 _searchr_
All Rights Reserved.

This source code and all associated files are the intellectual property
of the author. No part of this project may be used, copied, modified,
merged, published, distributed, sublicensed, or sold without prior
written permission from the author.

For licensing inquiries or permissions, please contact:
📧 Email: parampanchal914@gmail.com
```

---

## 👤 Author
**`_searchr_ (Param Panchal)`**  
📧 Email: [ parampanchal914@gmail.com ](mailto:parampanchal914@gmail.com)  
🌐 Instagram: [ _searchr_ ](https://www.instagram.com/_searchr_/)

---

## 🏷️ Tags
`#nodejs` `#firebase` `#facebook-api` `#marketing-api` `#leads` `#dashboard` `#oauth2` `#webapp` `#expressjs`
