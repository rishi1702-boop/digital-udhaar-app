const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');


// Load env vars
dotenv.config();

// Connect to database
connectDB();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/cashbook', require('./routes/cashbookRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Udhaar Khata API is running ' });
});

// Error handler
app.use(errorHandler);

// Serve frontend
app.get('/', (req, res) => res.send('Digital Udhaar Khata API is running securely...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started`);
});
