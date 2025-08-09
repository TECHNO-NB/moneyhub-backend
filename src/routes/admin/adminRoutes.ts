import express from 'express';
import { isAdmin, isAdminSubAdmin } from '../../middlewares/authMiddleware';
import {
  addCoinToUser,
  allFfOrderControllers,
  changeUserRole,
  checkAllLoadBalanceScreenshot,
  completeFfOrder,
  createFreeFireTournament,
  deleteUser,
  getAllUserDetails,
  loadCoinToUserWallet,
  removeCoinFromUser,
} from '../../controllers/adminControllers';

const router = express.Router();

router.route('/check-payment').get(isAdmin, checkAllLoadBalanceScreenshot);
router.route('/update-balance/:orderId').patch(isAdmin, loadCoinToUserWallet);
router.route('/get-alluser').get(isAdmin, getAllUserDetails);
router.route('/get-allfforder').get(isAdminSubAdmin, allFfOrderControllers);
router.route('/complete-fforder/:orderId').post(isAdminSubAdmin, completeFfOrder);
router.route('/delete-user/:userId').delete(isAdmin, deleteUser);
router.route('/change-role/:userId').patch(isAdmin, changeUserRole);
router.route('/add-coin/:userId').patch(isAdmin, addCoinToUser);
router.route('/remove-coin/:userId').patch(isAdmin, removeCoinFromUser);
router.route('/create-ff-tournament').post(isAdminSubAdmin, createFreeFireTournament);

export default router;
