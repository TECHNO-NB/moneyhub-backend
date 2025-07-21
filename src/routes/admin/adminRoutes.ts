import express from 'express';
import { isAdmin, isAdminSubAdmin } from '../../middlewares/authMiddleware';
import { allFfOrderControllers, checkAllLoadBalanceScreenshot, completeFfOrder, getAllUserDetails, loadCoinToUserWallet } from '../../controllers/adminControllers';


const router = express.Router();

router.route('/check-payment').get(isAdmin, checkAllLoadBalanceScreenshot);
router.route('/update-balance/:orderId').patch(isAdmin, loadCoinToUserWallet);
router.route('/get-alluser').get(isAdmin, getAllUserDetails);
router.route('/get-allfforder').get(isAdminSubAdmin,allFfOrderControllers );
router.route('/complete-fforder/:orderId').post(isAdminSubAdmin,completeFfOrder );

export default router;
