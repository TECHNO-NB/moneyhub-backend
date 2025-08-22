"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeCoin = exports.checkStatusNotificationOfBalance = exports.loadBalanceControllers = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const cloudinary_1 = require("../utils/cloudinary");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// load balance
const loadBalanceControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    //   @ts-ignore
    const userId = req.user.id;
    const amount = Number(req.body.amount);
    if (!userId || amount <= 0) {
        throw new apiError_1.default(false, 400, 'please fill all required field');
    }
    const paymentScreenshot = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!paymentScreenshot) {
        throw new apiError_1.default(false, 400, 'please upload payment screenshot');
    }
    const cloudinaryUrl = (yield (0, cloudinary_1.uploadToCloudinary)(paymentScreenshot));
    if (!cloudinaryUrl) {
        throw new apiError_1.default(false, 400, 'payment screenshot upload failed');
    }
    const loadBalance = yield db_1.default.loadBalance.create({
        data: {
            userId: userId,
            paymentScreenshot: cloudinaryUrl,
            amount: amount,
        },
    });
    if (!loadBalance) {
        throw new apiError_1.default(false, 500, 'Load balance  failed');
    }
    return res.status(201).json(new apiResponse_1.default(true, 201, 'Load Balance saved to db'));
}));
exports.loadBalanceControllers = loadBalanceControllers;
// get user balace update cancel or status
const checkStatusNotificationOfBalance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    if (!user) {
        throw new apiError_1.default(false, 400, 'User not found');
    }
    // Load balances
    const loadBalance = yield db_1.default.loadBalance.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
    });
    // FF Orders
    const ffOrders = yield db_1.default.ffOrder.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
    });
    // tournament notification
    const tournament = yield db_1.default.enteredFfTournament.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
    });
    // tournament notification
    const coinExchange = yield db_1.default.exChangeCoin.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
    });
    // If both empty
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Notifications found', {
        loadBalance,
        ffOrders,
        tournament,
        coinExchange,
    }));
}));
exports.checkStatusNotificationOfBalance = checkStatusNotificationOfBalance;
// exchnage coin
const exchangeCoin = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // @ts-ignore
    const screenshot = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!screenshot) {
        throw new apiError_1.default(false, 400, 'screenshot is required');
    }
    // @ts-ignore
    const { id } = req.user;
    if (!id) {
        throw new apiError_1.default(false, 400, 'User not found');
    }
    const { amount } = req.body;
    if (!amount) {
        throw new apiError_1.default(false, 400, 'amount is required');
    }
    const getQrUrl = yield (0, cloudinary_1.uploadToCloudinary)(screenshot);
    if (!getQrUrl) {
        throw new apiError_1.default(false, 400, 'Failed to upload screenshot to cloudinary');
    }
    const addToDb = yield db_1.default.exChangeCoin.create({
        data: {
            userId: id,
            amount: Number(amount),
            qrScreenshot: getQrUrl,
        },
    });
    if (!addToDb) {
        throw new apiError_1.default(false, 400, 'Failed to add to db');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Coin exchanged successfully', addToDb));
}));
exports.exchangeCoin = exchangeCoin;
