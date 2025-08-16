"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const balanceControllers_1 = require("../controllers/balanceControllers");
const router = express_1.default.Router();
router
    .route('/load-balance')
    .post(authMiddleware_1.jwtVerify, multerMiddleware_1.default.single('paymentImage'), balanceControllers_1.loadBalanceControllers);
router.route('/balance-status').get(authMiddleware_1.jwtVerify, balanceControllers_1.checkStatusNotificationOfBalance);
router.route('/balance-exchange').post(authMiddleware_1.jwtVerify, multerMiddleware_1.default.single('screenshot'), balanceControllers_1.exchangeCoin);
exports.default = router;
