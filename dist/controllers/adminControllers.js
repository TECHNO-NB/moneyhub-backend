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
exports.deleteTournament = exports.getAllTournament = exports.addRoomIdAndPassword = exports.createFreeFireTournament = exports.removeCoinFromUser = exports.addCoinToUser = exports.changeUserRole = exports.deleteUser = exports.completeFfOrder = exports.allFfOrderControllers = exports.getAllUserDetails = exports.loadCoinToUserWallet = exports.checkAllLoadBalanceScreenshot = void 0;
const app_1 = require("../app");
const db_1 = __importDefault(require("../DB/db"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const cloudinary_1 = require("../utils/cloudinary");
const sendNotification = (token, title, body, link) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token)
        return; // No token, skip sending
    const message = {
        notification: { title, body },
        token,
        webpush: {
            fcmOptions: {
                link: link || 'https://moneyhub.store', // default link
            },
        },
    };
    try {
        // @ts-ignore
        yield app_1.admin.messaging().send(message);
    }
    catch (error) {
        console.error('Notification send failed:', error);
    }
});
// check  All load balance screenshot
const checkAllLoadBalanceScreenshot = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const screenshotALLData = yield db_1.default.user.findMany({
        where: {
            loadBalance: {
                some: {},
            },
        },
        include: {
            loadBalance: {
                orderBy: {
                    updatedAt: 'desc',
                },
            },
        },
    });
    if (!screenshotALLData || screenshotALLData.length === 0) {
        throw new apiError_1.default(false, 500, 'unabale to fetch user load balance data');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Fetch all load balance request ', screenshotALLData));
}));
exports.checkAllLoadBalanceScreenshot = checkAllLoadBalanceScreenshot;
// load coin to user wallet after screenshot verfication
const loadCoinToUserWallet = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, status, userId, paymentScreenshot } = req.body;
    const { orderId } = req.params;
    if (!orderId) {
        throw new apiError_1.default(false, 500, 'orderId is required');
    }
    if (!message || !status || !userId || !paymentScreenshot) {
        throw new apiError_1.default(false, 500, 'invalid request body');
    }
    const findLoadBalanceOrder = yield db_1.default.loadBalance.update({
        where: {
            id: orderId,
        },
        data: {
            status,
            message,
        },
    });
    if (!findLoadBalanceOrder) {
        throw new apiError_1.default(false, 500, 'invalid order id');
    }
    const realAmount = findLoadBalanceOrder.amount;
    if (!realAmount) {
        throw new apiError_1.default(false, 500, 'invalid amount');
    }
    if (status === 'approved') {
        const updateUserAmount = yield db_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                balance: {
                    increment: realAmount,
                },
            },
        });
        if (!updateUserAmount) {
            throw new apiError_1.default(false, 500, 'invalid user id');
        }
        yield sendNotification(updateUserAmount.token, message, 'Thank you for load coin.');
        const deleteScreeshot = yield (0, cloudinary_1.deleteCloudinaryImage)(paymentScreenshot);
        if (!deleteScreeshot) {
            throw new apiError_1.default(false, 500, 'Screenshot not delete');
        }
        return res.status(200).json(new apiResponse_1.default(true, 200, 'Amount load successfully', status));
    }
    else {
        const user = yield db_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        yield sendNotification(user === null || user === void 0 ? void 0 : user.token, message, 'Please upload valid screenshot.');
        const deleteScreeshot = yield (0, cloudinary_1.deleteCloudinaryImage)(paymentScreenshot);
        return res.status(200).json(new apiResponse_1.default(true, 200, 'Status updated successfully', status));
    }
}));
exports.loadCoinToUserWallet = loadCoinToUserWallet;
// fetch all user details
const getAllUserDetails = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUser = yield db_1.default.user.findMany({
        orderBy: {
            updatedAt: 'desc',
        },
    });
    if (!allUser) {
        throw new apiError_1.default(false, 500, 'Unable to fetch all user');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'All user fetched successfully', allUser));
}));
exports.getAllUserDetails = getAllUserDetails;
// fetch all ff order
const allFfOrderControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allFfOrder = yield db_1.default.ffOrder.findMany({
        orderBy: {
            updatedAt: 'desc',
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    balance: true,
                },
            },
        },
    });
    if (!allFfOrder || allFfOrder.length === 0) {
        throw new apiError_1.default(false, 500, 'unabale to fetch user load balance data');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Fetch all load balance request ', allFfOrder));
}));
exports.allFfOrderControllers = allFfOrderControllers;
// ff order fullfill
const completeFfOrder = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, status, userId } = req.body;
    const { orderId } = req.params;
    if (!orderId)
        throw new apiError_1.default(false, 400, 'orderId is required');
    if (!message || !status || !userId)
        throw new apiError_1.default(false, 400, 'Invalid request body');
    const ffOrder = yield db_1.default.ffOrder.update({
        where: { id: orderId },
        data: { status, message },
    });
    if (!ffOrder)
        throw new apiError_1.default(false, 404, 'Invalid order ID');
    const userData = yield db_1.default.user.findUnique({ where: { id: userId } });
    if (status === 'delivered') {
        yield sendNotification(userData === null || userData === void 0 ? void 0 : userData.token, 'Your diamond top-up is delivered.', 'Thank you for your top-up!');
        return res
            .status(200)
            .json(new apiResponse_1.default(true, 200, 'FF order fulfilled successfully', ffOrder));
    }
    else if (status === 'rejected') {
        yield db_1.default.user.update({
            where: { id: userId },
            data: { balance: { increment: Number(ffOrder.diamondPrice) } },
        });
        yield sendNotification(userData === null || userData === void 0 ? void 0 : userData.token, 'Your top-up order was rejected', 'The amount has been refunded to your balance.');
        return res.status(200).json(new apiResponse_1.default(true, 200, 'FF order rejected', ffOrder));
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Status updated successfully', ffOrder));
}));
exports.completeFfOrder = completeFfOrder;
// delete user
const deleteUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id } = req.user;
    const { userId } = req.params;
    if (!id) {
        throw new apiError_1.default(false, 401, 'invalid user id should login with admin');
    }
    if (!userId) {
        throw new apiError_1.default(false, 400, 'invalid user id');
    }
    if (id === userId) {
        throw new apiError_1.default(false, 500, 'User can not delete himself');
    }
    const user = yield db_1.default.user.delete({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'User deleted successfully', user));
}));
exports.deleteUser = deleteUser;
// change user role
const changeUserRole = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id } = req.user;
    const { userId } = req.params;
    const { newRole } = req.body;
    if (!id) {
        throw new apiError_1.default(false, 401, 'invalid user id should login with admin');
    }
    if (!userId) {
        throw new apiError_1.default(false, 400, 'invalid user id');
    }
    if (!newRole) {
        throw new apiError_1.default(false, 400, 'invalid new role');
    }
    const updateRole = yield db_1.default.user.update({
        where: {
            id: userId,
        },
        data: {
            role: newRole,
        },
    });
    if (!updateRole) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'User role changes successfully', updateRole));
}));
exports.changeUserRole = changeUserRole;
// add coin to user by admin himself after cash payment
const addCoinToUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id } = req.user;
    const { userId } = req.params;
    const { coin } = req.body;
    if (!id) {
        throw new apiError_1.default(false, 401, 'invalid user id should login with admin');
    }
    if (!userId) {
        throw new apiError_1.default(false, 400, 'invalid user id');
    }
    if (!coin) {
        throw new apiError_1.default(false, 400, 'invalid coin amount');
    }
    const addCoin = yield db_1.default.user.update({
        where: {
            id: userId,
        },
        data: {
            balance: {
                increment: coin,
            },
        },
    });
    if (!addCoin) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    yield sendNotification(addCoin === null || addCoin === void 0 ? void 0 : addCoin.token, `You are Credited ${coin} Coin.`, 'Thank u for using moneyhub');
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Coin added successfully', addCoin));
}));
exports.addCoinToUser = addCoinToUser;
// removed coin from user balance
const removeCoinFromUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id } = req.user;
    const { userId } = req.params;
    const { coin } = req.body;
    if (!id) {
        throw new apiError_1.default(false, 401, 'invalid user id should login with admin');
    }
    if (!userId) {
        throw new apiError_1.default(false, 400, 'invalid user id');
    }
    if (!coin) {
        throw new apiError_1.default(false, 400, 'invalid coin amount');
    }
    const removeCoin = yield db_1.default.user.update({
        where: {
            id: userId,
        },
        data: {
            balance: {
                decrement: coin,
            },
        },
    });
    if (!removeCoin) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    yield sendNotification(removeCoin === null || removeCoin === void 0 ? void 0 : removeCoin.token, `You Are Debited ${coin} Coin.`, 'Thank u for using moneyhub');
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Coin added successfully', removeCoin));
}));
exports.removeCoinFromUser = removeCoinFromUser;
// create freefire tournament
const createFreeFireTournament = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id } = req.user;
    if (!id) {
        throw new apiError_1.default(false, 401, 'invalid user id should login with admin');
    }
    const { title, time, owner, ammo, skill, reward, cost } = req.body;
    console.log(time);
    console.log(title, time, owner, ammo, skill, reward, cost);
    const convertedReward = parseInt(reward);
    const convertedCost = parseInt(cost);
    if (!title || !time || !owner || !reward || !cost) {
        throw new apiError_1.default(false, 400, 'invalid tournament details');
    }
    const tournament = yield db_1.default.ffTournament.create({
        data: {
            userId: id,
            title,
            time: new Date(time),
            owner,
            ammo,
            skill,
            reward: convertedReward,
            cost: convertedCost,
        },
    });
    if (!tournament) {
        throw new apiError_1.default(false, 404, 'Tournament not found');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Tournament created successfully'));
}));
exports.createFreeFireTournament = createFreeFireTournament;
// get all tournament
const getAllTournament = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getAllTournament = yield db_1.default.ffTournament.findMany({
        include: {
            enteredFfTournament: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    if (!getAllTournament) {
        throw new apiError_1.default(false, 404, 'Tournament not found');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Successfully get all tournament', getAllTournament));
}));
exports.getAllTournament = getAllTournament;
// add roomId and Password in ff tournament
const addRoomIdAndPassword = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { tournamentId } = req.params;
    const { roomId, password } = req.body;
    if (!tournamentId) {
        throw new apiError_1.default(false, 404, 'tournament id not found');
    }
    if (!roomId || !password) {
        throw new apiError_1.default(false, 400, 'invalid room id and password');
    }
    const updateRoomIdAndPassword = yield db_1.default.ffTournament.update({
        where: {
            id: tournamentId,
        },
        data: {
            roomId,
            password,
        },
        include: {
            enteredFfTournament: {
                select: {
                    userId: true,
                    user: {
                        select: {
                            token: true,
                        },
                    },
                },
            },
        },
    });
    if (!updateRoomIdAndPassword) {
        throw new apiError_1.default(false, 404, 'Tournament not found');
    }
    yield Promise.all(updateRoomIdAndPassword.enteredFfTournament.map((val) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if ((_a = val.user) === null || _a === void 0 ? void 0 : _a.token) {
            yield sendNotification(val.user.token, 'FF Tournament Is Started.', `Room Id: ${roomId}  Password: ${password}`);
        }
    })));
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Room id and password'));
}));
exports.addRoomIdAndPassword = addRoomIdAndPassword;
// delete the tournament
const deleteTournament = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { tournamentId } = req.params;
    const deleteTournament = yield db_1.default.ffTournament.delete({
        where: {
            id: tournamentId,
        },
    });
    if (!deleteTournament) {
        throw new apiError_1.default(false, 404, 'Tournament not found');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Successfully delete tournament'));
}));
exports.deleteTournament = deleteTournament;
