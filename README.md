# Digital Udhaar Khata

Digital Udhaar Khata is a modern web application designed for small business owners and shopkeepers to manage their daily ledgers, customer credit (Udhaar), and cash flow. It digitizes the traditional notebook system, providing automated tracking, PDF statements, and direct payment reminders.

## Project Structure

The project is divided into two main folders:
1. frontend: Built with React.js and Vite
2. backend: Built with Node.js, Express, and MongoDB

---

## Backend Directory

The backend serves as the REST API and database manager for the application.

### Entry Point
- server.js: The main entry point of the backend application. It configures the Express server, connects to the MongoDB database, sets up middleware, and defines the base API routes.

### Models
These files define the MongoDB database structure using Mongoose.
- models/User.js: Defines the store owner account structure, handling authentication and profile details like UPI ID.
- models/Customer.js: Defines the customer structure, storing contact information and calculating their overall balance.
- models/Transaction.js: Defines individual ledger entries (Udhaar or Jama) linked to a specific customer.
- models/Cashbook.js: Defines daily store cash-in and cash-out entries, separate from customer credit.

### Controllers
These files contain the core business logic for processing requests.
- controllers/authController.js: Manages user registration, secure login, profile updates, and JWT token generation.
- controllers/customerController.js: Manages creating, reading, updating, and deleting customers, as well as generating and emailing account statements.
- controllers/transactionController.js: Processes new credit/debit transactions and recalculates customer balances.
- controllers/cashbookController.js: Handles the creation and retrieval of daily cashbook entries for shop expenses.
- controllers/reminderController.js: Responsible for triggering payment reminder emails to customers with outstanding balances.

### Routes
These files map specific URL endpoints to the corresponding controller functions.
- routes/authRoutes.js: Routes for authentication endpoints.
- routes/customerRoutes.js: Routes for customer management endpoints.
- routes/transactionRoutes.js: Routes for transaction operations.
- routes/cashbookRoutes.js: Routes for cashbook operations.
- routes/reminderRoutes.js: Routes for triggering reminders.

### Middleware and Services
- middleware/authMiddleware.js: Protects private routes by verifying JSON Web Tokens (JWT) provided in the request headers.
- services/mailService.js: Connects to a Google Apps Script endpoint to securely send emails (reminders and statements) bypassing standard SMTP port blocks.

---

## Frontend Directory

The frontend is a Single Page Application (SPA) providing the user interface for store owners.

### Core Setup
- src/App.jsx: The root component that sets up React Router for navigation and wraps the application in global context providers.
- src/main.jsx: Renders the React application into the DOM.
- src/index.css: Contains all global CSS styles, custom design systems, and responsive layout rules.

### API Configuration
- src/api/axios.js: Configures the Axios HTTP client with the correct base URL for making requests to the backend server.

### State Management (Context)
- src/context/AuthContext.jsx: Manages global user authentication state, handling login sessions and profile data across the app.
- src/context/LanguageContext.jsx: Provides multi-language support (English and Telugu) across all UI components.
- src/hooks/useAuth.js: A custom React hook for easily accessing authentication state in any component.

### Pages
These files represent the main screens of the application.
- src/pages/HomePage.jsx: The public landing page showcasing the application features to new users.
- src/pages/LoginPage.jsx & RegisterPage.jsx: Authentication screens for logging in or creating a new store owner account.
- src/pages/DashboardPage.jsx: The main dashboard providing a high-level overview of total outstanding amounts, cash on hand, and recent activity.
- src/pages/CustomersPage.jsx: A page displaying a searchable list of all registered customers and their current balances.
- src/pages/CustomerDetailPage.jsx: A detailed ledger for a specific customer, allowing the owner to add new transactions, view history, and email statements.
- src/pages/CashbookPage.jsx: A dedicated tracker for daily shop expenses and cash-in hand, completely separate from customer credit.
- src/pages/SettingsPage.jsx: Allows the store owner to update their profile information and securely manage their UPI ID behind a password prompt.
- src/pages/NotFoundPage.jsx: A fallback error page displayed when a user navigates to an invalid URL.

### Components
- src/components/Layout/Header.jsx: The top navigation bar displaying the current page title and user actions.
- src/components/Layout/Sidebar.jsx: The side navigation menu for switching between different pages in the dashboard.
- src/components/Common/Modal.jsx: A reusable popup component used for forms throughout the application.
- src/components/Common/Loader.jsx: A visual loading spinner displayed during API requests.
