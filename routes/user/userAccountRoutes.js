import express from 'express';
const userAccountRoutes = express.Router();
import { User } from '../../models/userModels.js'

import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'
import { sendResetPasswordToken } from '../../utils/sendVerificationOTP.js';
import { updateUserData } from '../../controllers/user/userProfileController.js';


userAccountRoutes.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    user.address = [
      {
        name: 'John Doe',
        addressLine1: '123 Maple Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1 555-123-4567'
      },
      {
        name: 'Jane Smith',
        addressLine1: '456 Oak Avenue',
        addressLine2: '',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        phone: '+1 555-987-6543'
      }
    ]

    // console.log(user.address)

    res.render('Layouts/users/userAccountPage', {
      user
    });
  } catch (err) {
    console.error('Error loading user profile:', err);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
});


userAccountRoutes.get('/send-reset-link', authenticateUser, async (req, res) => {

  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    await sendResetPasswordToken(user);
    res.redirect('/user/profile');
  } catch (error) {
    console.log(error);

  }
})


userAccountRoutes.patch('/profile/update',authenticateUser,updateUserData)

export default userAccountRoutes;
