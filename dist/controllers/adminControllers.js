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
exports.createFreeFireTournament = exports.removeCoinFromUser = exports.addCoinToUser = exports.changeUserRole = exports.deleteUser = exports.completeFfOrder = exports.allFfOrderControllers = exports.getAllUserDetails = exports.loadCoinToUserWallet = exports.checkAllLoadBalanceScreenshot = void 0;
const db_1 = __importDefault(require("../DB/db"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const cloudinary_1 = require("../utils/cloudinary");
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
        const deleteScreeshot = yield (0, cloudinary_1.deleteCloudinaryImage)(paymentScreenshot);
        if (!deleteScreeshot) {
            throw new apiError_1.default(false, 500, 'Screenshot not delete');
        }
        return res.status(200).json(new apiResponse_1.default(true, 200, 'Amount load successfully', status));
    }
    else {
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
    if (!orderId) {
        throw new apiError_1.default(false, 500, 'orderId is required');
    }
    if (!message || !status || !userId) {
        throw new apiError_1.default(false, 500, 'invalid request body');
    }
    const findFfOrder = yield db_1.default.ffOrder.update({
        where: {
            id: orderId,
        },
        data: {
            status,
            message,
        },
    });
    if (!findFfOrder) {
        throw new apiError_1.default(false, 500, 'invalid order id');
    }
    if (status === 'delivered') {
        return res
            .status(200)
            .json(new apiResponse_1.default(true, 200, 'Ff order fullfill successfully', findFfOrder));
    }
    else if (status === 'rejected') {
        const addBalance = yield db_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                balance: {
                    increment: Number(findFfOrder.diamondPrice),
                },
            },
        });
        if (!addBalance) {
            throw new apiError_1.default(false, 500, 'unabale to add user balance');
        }
        return res.status(200).json(new apiResponse_1.default(true, 200, 'Ff order rejected', findFfOrder));
    }
    else {
        return res
            .status(200)
            .json(new apiResponse_1.default(true, 200, 'Status updated successfully', findFfOrder));
    }
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
