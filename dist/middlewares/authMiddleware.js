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
exports.isAdminSubAdmin = exports.isAdmin = exports.jwtVerify = void 0;
const apiError_1 = __importDefault(require("../utils/apiError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../DB/db"));
const jwtVerify = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accessToken, refreshToken } = yield req.cookies;
        if (!accessToken || !refreshToken) {
            throw new apiError_1.default(false, 401, 'Access token and refresh token are required');
        }
        const decodeAccessToken = (yield jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET));
        if (!decodeAccessToken) {
            throw new apiError_1.default(false, 401, 'Invalid access token');
        }
        const user = yield db_1.default.user.findUnique({ where: { id: decodeAccessToken.id } });
        if (!user || user.refreshToken !== refreshToken) {
            throw new apiError_1.default(false, 401, 'Invalid refresh token deu to mismatch of token in db and cookie');
        }
        const decodeRefreshToken = yield jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        if (!decodeRefreshToken) {
            throw new apiError_1.default(false, 401, 'Invalid refresh token due to not decoded');
        }
        // @ts-ignore
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
}));
exports.jwtVerify = jwtVerify;
const isAdmin = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accessToken, refreshToken } = yield req.cookies;
        if (!accessToken || !refreshToken) {
            throw new apiError_1.default(false, 401, 'Access token and refresh token are required');
        }
        const decodeAccessToken = (yield jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET));
        if (!decodeAccessToken) {
            throw new apiError_1.default(false, 401, 'Invalid access token');
        }
        const user = yield db_1.default.user.findUnique({ where: { id: decodeAccessToken.id } });
        if (!user || user.refreshToken !== refreshToken) {
            throw new apiError_1.default(false, 401, 'Invalid refresh token');
        }
        const decodeRefreshToken = yield jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        if (!decodeRefreshToken) {
            throw new apiError_1.default(false, 401, 'Invalid refresh token');
        }
        if (user.role === 'admin') {
            // @ts-ignore
            req.user = user;
            return next();
        }
        else {
            throw new apiError_1.default(false, 403, 'Forbidden: Admins only');
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.isAdmin = isAdmin;
const isAdminSubAdmin = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accessToken, refreshToken } = yield req.cookies;
        if (!accessToken || !refreshToken) {
            throw new apiError_1.default(false, 401, 'Access token and refresh token are required');
        }
        const decodeAccessToken = (yield jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET));
        if (!decodeAccessToken) {
            throw new apiError_1.default(false, 401, 'Invalid access token');
        }
        const user = yield db_1.default.user.findUnique({ where: { id: decodeAccessToken.id } });
        if (!user || user.refreshToken !== refreshToken) {
            throw new apiError_1.default(false, 401, 'Invalid refresh token');
        }
        const decodeRefreshToken = yield jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        if (!decodeRefreshToken) {
            throw new apiError_1.default(false, 401, 'Invalid refresh token');
        }
        if (user.role === 'admin' || user.role === 'subadmin') {
            // @ts-ignore
            req.user = user;
            return next();
        }
        else {
            throw new apiError_1.default(false, 403, 'Forbidden: Admins And Subadmin only');
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.isAdminSubAdmin = isAdminSubAdmin;
