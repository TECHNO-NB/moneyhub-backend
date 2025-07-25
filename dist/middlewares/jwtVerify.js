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
const apiError_1 = __importDefault(require("../utils/apiError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const jwtVerify = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const accessToken = yield ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.accessToken);
    const refreshToken = yield ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.refreshToken);
    if (!accessToken || !refreshToken) {
        throw new apiError_1.default(false, 401, 'Access token and refresh token are required');
    }
    const decodeAccessToken;
}));
exports.default = jwtVerify;
