"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ffOrderControllers_1 = require("../controllers/ffOrderControllers");
const router = express_1.default.Router();
router.route('/buy-diamond').post(authMiddleware_1.jwtVerify, ffOrderControllers_1.buyDiamondControllers);
exports.default = router;
