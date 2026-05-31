# Backend - Digital Udhaar Khata

This is the backend component of the Digital Udhaar Khata application, built using Node.js, Express, and MongoDB. It serves as the REST API and database manager for the application.

## Entry Point
- server.js: The main entry point of the backend application. It configures the Express server, connects to the MongoDB database, sets up middleware, and defines the base API routes.

## Models
These files define the MongoDB database structure using Mongoose.
- models/User.js: Defines the store owner account structure, handling authentication and profile details like UPI ID.
- models/Customer.js: Defines the customer structure, storing contact information and calculating their overall balance.
- models/Transaction.js: Defines individual ledger entries (Udhaar or Jama) linked to a specific customer.
- models/Cashbook.js: Defines daily store cash-in and cash-out entries, separate from customer credit.

## Controllers
These files contain the core business logic for processing requests.
- controllers/authController.js: Manages user registration, secure login, profile updates, and JWT token generation.
- controllers/customerController.js: Manages creating, reading, updating, and deleting customers, as well as generating and emailing account statements.
- controllers/transactionController.js: Processes new credit/debit transactions and recalculates customer balances.
- controllers/cashbookController.js: Handles the creation and retrieval of daily cashbook entries for shop expenses.
- controllers/reminderController.js: Responsible for triggering payment reminder emails to customers with outstanding balances.

## Routes
These files map specific URL endpoints to the corresponding controller functions.
- routes/authRoutes.js: Routes for authentication endpoints.
- routes/customerRoutes.js: Routes for customer management endpoints.
- routes/transactionRoutes.js: Routes for transaction operations.
- routes/cashbookRoutes.js: Routes for cashbook operations.
- routes/reminderRoutes.js: Routes for triggering reminders.

## Middleware and Services
- middleware/authMiddleware.js: Protects private routes by verifying JSON Web Tokens (JWT) provided in the request headers.
- services/mailService.js: Connects to a Google Apps Script endpoint to securely send emails (reminders and statements) bypassing standard SMTP port blocks.
