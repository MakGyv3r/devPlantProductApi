const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  /*forgotPassword,
  resetPassword,
  updatePassword,*/
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/signup', register);
router.post('/signin', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
/*router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);*/

module.exports = router;
