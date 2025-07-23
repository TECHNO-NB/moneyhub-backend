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
exports.buyDiamondControllers = void 0;
const db_1 = __importDefault(require("../DB/db"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// buy diamond freefire
const buyDiamondControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req === null || req === void 0 ? void 0 : req.user.id;
    if (!userId) {
        throw new apiError_1.default(false, 401, 'Please login first');
    }
    const { ffUid, ffName, diamondPrice, diamondTitle } = req.body;
    if (!ffUid || !ffName || !diamondPrice || !diamondTitle) {
        throw new apiError_1.default(false, 400, 'Please fill all the fields');
    }
    // Step 1: Check balance
    const user = yield db_1.default.user.findUnique({
        where: { id: userId },
        select: { balance: true },
    });
    if (!user) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    if (user.balance < diamondPrice) {
        throw new apiError_1.default(false, 400, 'Insufficient balance');
    }
    // Step 2: Transaction (create order + update balance)
    const [createOrder, _] = yield db_1.default.$transaction([
        db_1.default.ffOrder.create({
            data: {
                userId,
                ffUid,
                ffName,
                diamondPrice,
                diamondTitle: JSON.stringify(diamondTitle),
            },
        }),
        db_1.default.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: diamondPrice,
                },
            },
        }),
    ]);
    return res
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'Order created successfully', createOrder));
}));
exports.buyDiamondControllers = buyDiamondControllers;
