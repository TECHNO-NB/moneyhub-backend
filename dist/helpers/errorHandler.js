"use strict";
// error handling
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = () => {
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err.message);
        process.exit(1);
    });
    process.on('unhandledRejection', (promise, reason) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
    process.on('SIGINT', (err) => {
        console.log('Received SIGINT. Gracefully shutting down.');
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('Received SIGTERM. Gracefully shutting down.');
        process.exit(0);
    });
};
exports.default = errorHandler;
