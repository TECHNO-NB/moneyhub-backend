"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
exports.cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    // domain: '.moneyhub.store',
    maxAge: 60 * 24 * 60 * 60 * 1000,
};
