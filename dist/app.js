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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const balanceRoutes_1 = __importDefault(require("./routes/balanceRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/admin/adminRoutes"));
const ffOrderRoutes_1 = __importDefault(require("./routes/ffOrderRoutes"));
const ffTournamentRoutes_1 = __importDefault(require("./routes/ffTournamentRoutes"));
const app = (0, express_1.default)();
// default middleware
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_ADMIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE', 'PATCH'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({
    limit: '5mb',
}));
app.use(body_parser_1.default.urlencoded({
    extended: true,
    limit: '5mb',
}));
app.use(express_1.default.static('./public'));
// user routes api
app.use('/api/v1/users', userRoutes_1.default);
app.use('/api/v1/balance', balanceRoutes_1.default);
app.use('/api/v1/admin', adminRoutes_1.default);
app.use('/api/v1/fforder', ffOrderRoutes_1.default);
app.use('/api/v1/tournament', ffTournamentRoutes_1.default);
// server check api
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('MoneyHub Server is running');
}));
exports.default = app;
