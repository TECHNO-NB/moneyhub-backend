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
exports.getAllFfTournamentControllers = exports.getAllFfTopUpListControllers = exports.logoutUserControllers = exports.verifyUserControllers = exports.signInControllers = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const generateJwtTokens_1 = __importDefault(require("../helpers/generateJwtTokens"));
const cookieOption_1 = require("../helpers/cookieOption");
const signInControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token.email || !token.name || !token.picture) {
        throw new apiError_1.default(false, 400, 'Please fill the all required field');
    }
    const alreadyLoginUser = yield db_1.default.user.findUnique({ where: { email: token.email } });
    if (alreadyLoginUser) {
        const dataOfUser = {
            id: alreadyLoginUser === null || alreadyLoginUser === void 0 ? void 0 : alreadyLoginUser.id,
            email: alreadyLoginUser === null || alreadyLoginUser === void 0 ? void 0 : alreadyLoginUser.email,
            fullName: alreadyLoginUser === null || alreadyLoginUser === void 0 ? void 0 : alreadyLoginUser.fullName,
            avatar: alreadyLoginUser === null || alreadyLoginUser === void 0 ? void 0 : alreadyLoginUser.avatar,
            balance: alreadyLoginUser === null || alreadyLoginUser === void 0 ? void 0 : alreadyLoginUser.balance,
        };
        const generateJwtToken = yield (0, generateJwtTokens_1.default)(dataOfUser);
        if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
            throw new apiError_1.default(false, 500, 'Jwt Token Generate failed');
        }
        return res
            .cookie('accessToken', generateJwtToken.accessToken, cookieOption_1.cookieOptions)
            .cookie('refreshToken', generateJwtToken.refreshToken, cookieOption_1.cookieOptions)
            .status(200)
            .json(new apiResponse_1.default(true, 200, 'User signin successfully', alreadyLoginUser));
    }
    const userData = {
        email: token.email,
        fullName: token.name,
        avatar: token.picture,
    };
    const createUser = yield db_1.default.user.create({
        data: userData,
    });
    if (!createUser) {
        throw new apiError_1.default(false, 500, 'User signin failed');
    }
    const user = yield db_1.default.user.findUnique({
        where: {
            email: token.email,
        },
    });
    const dataOfUser = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        avatar: user === null || user === void 0 ? void 0 : user.avatar,
        balance: user === null || user === void 0 ? void 0 : user.balance,
    };
    const generateJwtToken = yield (0, generateJwtTokens_1.default)(dataOfUser);
    if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
        throw new apiError_1.default(false, 500, 'Jwt Token Generate failed');
    }
    return res
        .cookie('accessToken', generateJwtToken.accessToken, cookieOption_1.cookieOptions)
        .cookie('refreshToken', generateJwtToken.refreshToken, cookieOption_1.cookieOptions)
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'User signin successfully', user));
}));
exports.signInControllers = signInControllers;
// verify user
const verifyUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    if (!user.id) {
        throw new apiError_1.default(false, 401, 'Id is required');
    }
    const dataOfUser = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        avatar: user === null || user === void 0 ? void 0 : user.avatar,
        balance: user === null || user === void 0 ? void 0 : user.balance,
    };
    const generateJwtToken = yield (0, generateJwtTokens_1.default)(dataOfUser);
    if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
        throw new apiError_1.default(false, 500, 'Jwt Token Generate failed');
    }
    return res
        .cookie('accessToken', generateJwtToken.accessToken, cookieOption_1.cookieOptions)
        .cookie('refreshToken', generateJwtToken.refreshToken, cookieOption_1.cookieOptions)
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'User verify successfully', user));
}));
exports.verifyUserControllers = verifyUserControllers;
// logout user
const logoutUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .clearCookie('accessToken', cookieOption_1.cookieOptions)
        .clearCookie('refreshToken', cookieOption_1.cookieOptions)
        .json(new apiResponse_1.default(true, 200, 'User logout successfully'));
}));
exports.logoutUserControllers = logoutUserControllers;
// Get all ff topup list
const getAllFfTopUpListControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getAllFfTopUpList = yield db_1.default.ffTopUpRate.findMany();
    if (!getAllFfTopUpList) {
        throw new apiError_1.default(false, 404, 'No ff top up list found');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Get all ff topup list', getAllFfTopUpList));
}));
exports.getAllFfTopUpListControllers = getAllFfTopUpListControllers;
// get all ff tournament
const getAllFfTournamentControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getAllFfTournament = yield db_1.default.ffTournament.findMany();
    if (!getAllFfTournament) {
        throw new apiError_1.default(false, 404, 'No ff tournament found');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Get all ff tournament', getAllFfTournament));
}));
exports.getAllFfTournamentControllers = getAllFfTournamentControllers;
