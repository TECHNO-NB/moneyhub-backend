"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(success = true, status = 200, message = '', data) {
        this.success = success;
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
exports.default = ApiResponse;
