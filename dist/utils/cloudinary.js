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
exports.deleteCloudinaryImage = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const apiError_1 = __importDefault(require("./apiError"));
const fs_1 = __importDefault(require("fs"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
        console.log('Cloudinary connected');
    }
    catch (error) {
        console.log('Connection error to cloudinary');
    }
}))();
const uploadToCloudinary = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url) {
        throw new apiError_1.default(false, 400, 'Image url neaded');
    }
    try {
        const cloudinaryUrl = yield cloudinary_1.v2.uploader.upload(url, {
            resource_type: 'auto',
        });
        fs_1.default.unlinkSync(url);
        return cloudinaryUrl.secure_url;
    }
    catch (error) {
        console.log('Failed to upload image to cloudinary', error);
        fs_1.default.unlinkSync(url);
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
const deleteCloudinaryImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!url) {
        throw new apiError_1.default(false, 400, 'Image url needed');
    }
    try {
        const publicId = (_a = url.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        if (!publicId) {
            throw new apiError_1.default(false, 400, 'Invalid image url');
        }
        const deleteImg = yield cloudinary_1.v2.uploader.destroy(publicId);
        return deleteImg;
    }
    catch (error) {
        console.log('Cloudinary img delete failed', error);
    }
});
exports.deleteCloudinaryImage = deleteCloudinaryImage;
