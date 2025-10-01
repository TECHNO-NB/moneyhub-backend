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
exports.sendCoinControllers = exports.getAllBanner = exports.loginUserControllers = exports.registerUserControllers = exports.saveNotificationTokenControllers = exports.getAllFfTournamentControllers = exports.getAllFfTopUpListControllers = exports.logoutUserControllers = exports.verifyUserControllers = exports.signInControllers = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const generateJwtTokens_1 = __importDefault(require("../helpers/generateJwtTokens"));
const cookieOption_1 = require("../helpers/cookieOption");
const cloudinary_1 = require("../utils/cloudinary");
const hash_1 = require("../utils/hash");
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
// user register
const registerUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, fullName, password } = req.body;
    const avatar = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!avatar) {
        throw new apiError_1.default(false, 400, 'Avatar is required');
    }
    if (!email || !fullName || !password) {
        throw new apiError_1.default(false, 400, 'Please fill the all required field');
    }
    const alreadyRegisterUser = yield db_1.default.user.findUnique({ where: { email: email } });
    if (alreadyRegisterUser) {
        throw new apiError_1.default(false, 409, 'User already register with this email');
    }
    const hashedPassword = yield (0, hash_1.hashPassword)(password);
    if (!hashedPassword) {
        throw new apiError_1.default(false, 500, 'Password hash failed');
    }
    const cloudinaryUrl = yield (0, cloudinary_1.uploadToCloudinary)(avatar);
    if (!cloudinaryUrl) {
        throw new apiError_1.default(false, 500, 'Avatar upload failed');
    }
    const userData = {
        email: email,
        fullName: fullName,
        avatar: cloudinaryUrl,
        password: hashedPassword,
    };
    const createUser = yield db_1.default.user.create({
        data: userData,
    });
    if (!createUser) {
        throw new apiError_1.default(false, 500, 'User register failed');
    }
    return res.status(201).json(new apiResponse_1.default(true, 201, 'User register successfully', createUser));
}));
exports.registerUserControllers = registerUserControllers;
// login user
const loginUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new apiError_1.default(false, 400, 'Please fill the all required field');
    }
    const user = yield db_1.default.user.findUnique({ where: { email: email } });
    if (!user || !user.password) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    const isPasswordMatch = yield (0, hash_1.comparePassword)(password, user.password);
    if (!isPasswordMatch) {
        throw new apiError_1.default(false, 400, 'Invalid password');
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
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'User login successfully', user));
}));
exports.loginUserControllers = loginUserControllers;
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
    const getAllFfTopUpList = yield db_1.default.ffTopUpRate.findMany({
        select: {
            id: true,
            diamondTitle: true,
            price: true,
            realPrice: true,
        },
    });
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
    const getAllFfTournament = yield db_1.default.ffTournament.findMany({
        orderBy: {
            updatedAt: 'desc',
        },
    });
    if (!getAllFfTournament) {
        throw new apiError_1.default(false, 404, 'No ff tournament found');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Get all ff tournament', getAllFfTournament));
}));
exports.getAllFfTournamentControllers = getAllFfTournamentControllers;
// saved notification token in db
const saveNotificationTokenControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    // @ts-ignore
    const { id } = req.user;
    if (!id || !token) {
        throw new apiError_1.default(false, 400, 'Invalid request');
    }
    const user = yield db_1.default.user.update({
        where: {
            id: id,
        },
        data: {
            token: token,
        },
    });
    if (!user) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Save notification token', user));
}));
exports.saveNotificationTokenControllers = saveNotificationTokenControllers;
// get all banner
const getAllBanner = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getBanner = yield db_1.default.banner.findMany();
    if (!getBanner) {
        throw new apiError_1.default(false, 500, 'Failed to get all Banner');
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Get all banner successfully', getBanner));
}));
exports.getAllBanner = getAllBanner;
// Transfer coin to another account
const sendCoinControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, coin } = req.body;
    const { userId } = req.params;
    if (!userId) {
        throw new apiError_1.default(false, 400, 'User ID is Required');
    }
    if (!id || !coin) {
        throw new apiError_1.default(false, 400, 'Coin And Id is Required');
    }
    const getUserCoin = yield db_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            balance: true,
        },
    });
    if (!getUserCoin) {
        throw new apiError_1.default(false, 400, 'User not found');
    }
    if (getUserCoin.balance <= coin) {
        throw new apiError_1.default(false, 400, 'Coin is less then have');
    }
    const decrementCoin = yield db_1.default.user.update({
        where: {
            id: userId
        },
        data: {
            balance: {
                decrement: coin
            }
        }
    });
    if (!decrementCoin) {
        throw new apiError_1.default(false, 400, 'Error to Decrement coin');
    }
    const updateCoin = yield db_1.default.user.update({
        where: {
            id: id,
        },
        data: {
            balance: {
                increment: coin,
            },
        },
    });
    if (!updateCoin) {
        throw new apiError_1.default(false, 400, 'Error to Increment coin');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, "Coin Trasfer successfully"));
}));
exports.sendCoinControllers = sendCoinControllers;
