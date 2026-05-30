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

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => res.send('API is running...'));
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started`);
});
