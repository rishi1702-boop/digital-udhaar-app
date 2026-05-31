# Frontend - Digital Udhaar Khata

This is the frontend component of the Digital Udhaar Khata application, built using React.js and Vite. It serves as the Single Page Application (SPA) providing the user interface for store owners to manage their customers, transactions, and cash flow.

## Core Setup
- src/App.jsx: The root component setting up React Router for navigation and global context providers.
- src/main.jsx: Renders the React application into the DOM.
- src/index.css: Contains all global CSS styles, custom design systems, and responsive layout rules.

## API Configuration
- src/api/axios.js: Configures the Axios HTTP client with the correct base URL for making requests to the backend server.

## State Management (Context)
- src/context/AuthContext.jsx: Manages global user authentication state, handling login sessions and profile data across the app.
- src/context/LanguageContext.jsx: Provides multi-language support (English and Telugu) across all UI components.
- src/hooks/useAuth.js: A custom React hook for easily accessing authentication state in any component.

## Pages
These files represent the main screens of the application.
- src/pages/HomePage.jsx: The public landing page showcasing the application features to new users.
- src/pages/LoginPage.jsx & RegisterPage.jsx: Authentication screens for logging in or creating a new store owner account.
- src/pages/DashboardPage.jsx: The main dashboard providing a high-level overview of total outstanding amounts, cash on hand, and recent activity.
- src/pages/CustomersPage.jsx: A page displaying a searchable list of all registered customers and their current balances.
- src/pages/CustomerDetailPage.jsx: A detailed ledger for a specific customer, allowing the owner to add new transactions, view history, and email statements.
- src/pages/CashbookPage.jsx: A dedicated tracker for daily shop expenses and cash-in hand, completely separate from customer credit.
- src/pages/SettingsPage.jsx: Allows the store owner to update their profile information and securely manage their UPI ID behind a password prompt.
- src/pages/NotFoundPage.jsx: A fallback error page displayed when a user navigates to an invalid URL.

## Components
- src/components/Layout/Header.jsx: The top navigation bar displaying the current page title and user actions.
- src/components/Layout/Sidebar.jsx: The side navigation menu for switching between different pages in the dashboard.
- src/components/Common/Modal.jsx: A reusable popup component used for forms throughout the application.
- src/components/Common/Loader.jsx: A visual loading spinner displayed during API requests.
