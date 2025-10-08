import express from 'express';
import { isAdmin, isAdminSubAdmin } from '../../middlewares/authMiddleware';
import {
  addBannerControllers,
  addCoinToUser,
  addFfTopupList,
  addRoomIdAndPassword,
  allFfOrderControllers,
  cancelTournament,
  changeUserRole,
  checkAllLoadBalanceScreenshot,
  completeFfOrder,
  createFreeFireTournament,
  deleteBanner,
  deleteTournament,
  deleteUser,
  getAllTournament,
  getAllUserDetails,
  getAllWithdrawalRequests,
  loadCoinToUserWallet,
  makeWinner,
  removeCoinFromUser,
} from '../../controllers/adminControllers';
import upload from '../../middlewares/multerMiddleware';

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
router.route('/update-roomid-password/:tournamentId').patch(isAdminSubAdmin, addRoomIdAndPassword);
router.route('/get-all-tournament').get(isAdminSubAdmin, getAllTournament);
router.route('/delete-tournament/:tournamentId').delete(isAdminSubAdmin, deleteTournament);
router.route('/make-winner/:winnerId').patch(isAdminSubAdmin, makeWinner);
router.route('/cancel-tournament/:tournamentId').post(isAdminSubAdmin, cancelTournament);
router.route('/add-ff-toupup-rate').patch(isAdminSubAdmin, addFfTopupList);
router.route('/withdrawal-requests').get(isAdmin, getAllWithdrawalRequests);
router.route('/add-banner').post(isAdminSubAdmin, upload.single('banner'), addBannerControllers);
router.route('/delete-banner').delete(isAdmin, deleteBanner);

export default router;
