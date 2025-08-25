import express from 'express';
import {
  getAllFfTopUpListControllers,
  getAllFfTournamentControllers,
  loginUserControllers,
  logoutUserControllers,
  registerUserControllers,
  saveNotificationTokenControllers,
  signInControllers,
  verifyUserControllers,
} from '../controllers/userControllers';
import { jwtVerify } from '../middlewares/authMiddleware';
import upload from '../middlewares/multerMiddleware';

const router = express.Router();

router.route('/sign-in').post(signInControllers);
router.route('/register').post(upload.single('avatar'), registerUserControllers);
router.route('/login').post(loginUserControllers);
router.route('/verify-user').post(jwtVerify, verifyUserControllers);
router.route('/log-out').get(jwtVerify, logoutUserControllers);
router.route('/get-topup-list').get(getAllFfTopUpListControllers);
router.route('/get-ff-tournament').get(getAllFfTournamentControllers);
router.route('/token').post(jwtVerify, saveNotificationTokenControllers);
export default router;
