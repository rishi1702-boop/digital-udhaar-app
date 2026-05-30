const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  downloadStatement
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id/statement').get(downloadStatement);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);

module.exports = router;
