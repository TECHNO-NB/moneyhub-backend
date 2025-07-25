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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateRefreshAcessToken = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = yield jsonwebtoken_1.default.sign({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        fullName: userData.fullName,
        balance: userData.balance,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    const accessToken = yield jsonwebtoken_1.default.sign({
        id: userData.id,
        email: userData.email,
    }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return { refreshToken, accessToken };
});
