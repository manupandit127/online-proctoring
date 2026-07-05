# Enterprise CRM System

A modern **Enterprise Customer Relationship Management (CRM) System** built to help organizations manage leads, customers, sales pipelines, and team performance. The application streamlines the sales process by providing a centralized platform for tracking customer interactions, monitoring deals, and analyzing sales metrics.

## 🚀 Features

* **Lead Management**

  * Create, update, and delete leads.
  * Track lead status throughout the sales lifecycle.
  * Convert qualified leads into customers.

* **Sales Pipeline**

  * Manage deals across multiple stages.
  * Monitor deal progress from initial contact to closure.
  * Visualize the sales pipeline for better decision-making.

* **Sales Performance Dashboard**

  * Interactive dashboards with sales analytics.
  * Track revenue, conversion rates, and team performance.
  * Generate insights for business growth.

* **Email & Activity Logs**

  * Maintain a history of customer interactions.
  * Record calls, meetings, notes, and emails.
  * Keep all communication centralized for easy access.

* **Role-Based Access Control (RBAC)**

  * Secure authentication and authorization.
  * Different access levels for Admin, Sales Manager, and Sales Executive.
  * Protect sensitive business data.

## 🛠️ Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript (ES6+)

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### APIs

* REST APIs

## 📂 Project Structure

```text
Enterprise-CRM/
│
├── client/          # React frontend
├── server/          # Node.js & Express backend
├── models/          # Database models
├── routes/          # API routes
├── controllers/     # Business logic
├── middleware/      # Authentication & authorization
├── config/          # Database configuration
└── README.md
```

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/your-username/enterprise-crm.git
cd enterprise-crm
```

### Install backend dependencies

```bash
cd server
npm install
```

### Install frontend dependencies

```bash
cd ../client
npm install
```

## ▶️ Running the Application

### Start the backend

```bash
cd server
npm start
```

### Start the frontend

```bash
cd client
npm start
```

The application will typically be available at:

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:5000`

## 🔐 User Roles

* **Admin**

  * Manage users and permissions
  * Access all CRM features

* **Sales Manager**

  * Monitor team performance
  * Manage leads and deals
  * View analytics and reports

* **Sales Executive**

  * Manage assigned leads
  * Update deal stages
  * Log customer activities

## 📌 Future Enhancements

* Email integration
* Calendar and meeting scheduling
* Customer support ticket management
* File and document uploads
* Notifications and reminders
* Advanced analytics and reporting
* Mobile-responsive UI
* Third-party integrations (Slack, Google Calendar, etc.)

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository, create a feature branch, and submit a pull request.

## 📄 License

This project is intended for educational and learning purposes.
