"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/sign-in').post(userControllers_1.signInControllers);
router.route('/verify-user').post(authMiddleware_1.jwtVerify, userControllers_1.verifyUserControllers);
router.route('/log-out').get(authMiddleware_1.jwtVerify, userControllers_1.logoutUserControllers);
router.route('/get-topup-list').get(userControllers_1.getAllFfTopUpListControllers);
router.route('/get-ff-tournament').get(userControllers_1.getAllFfTournamentControllers);
exports.default = router;
