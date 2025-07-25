"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const adminControllers_1 = require("../../controllers/adminControllers");
const router = express_1.default.Router();
router.route('/check-payment').get(authMiddleware_1.isAdmin, adminControllers_1.checkAllLoadBalanceScreenshot);
router.route('/update-balance/:orderId').patch(authMiddleware_1.isAdmin, adminControllers_1.loadCoinToUserWallet);
router.route('/get-alluser').get(authMiddleware_1.isAdmin, adminControllers_1.getAllUserDetails);
router.route('/get-allfforder').get(authMiddleware_1.isAdminSubAdmin, adminControllers_1.allFfOrderControllers);
router.route('/complete-fforder/:orderId').post(authMiddleware_1.isAdminSubAdmin, adminControllers_1.completeFfOrder);
router.route('/delete-user/:userId').delete(authMiddleware_1.isAdmin, adminControllers_1.deleteUser);
router.route('/change-role/:userId').patch(authMiddleware_1.isAdmin, adminControllers_1.changeUserRole);
router.route('/add-coin/:userId').patch(authMiddleware_1.isAdmin, adminControllers_1.addCoinToUser);
router.route('/remove-coin/:userId').patch(authMiddleware_1.isAdmin, adminControllers_1.removeCoinFromUser);
exports.default = router;
