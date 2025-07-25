import express from 'express';
import {
  logoutUserControllers,
  signInControllers,
  verifyUserControllers,
} from '../controllers/userControllers';
import {jwtVerify} from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/sign-in').post(signInControllers);
router.route('/verify-user').post(jwtVerify, verifyUserControllers);
router.route('/log-out').get(jwtVerify, logoutUserControllers);
export default router;
