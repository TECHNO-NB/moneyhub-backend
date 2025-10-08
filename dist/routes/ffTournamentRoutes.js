"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ffTournamentControllers_1 = require("../controllers/ffTournamentControllers");
const router = express_1.default.Router();
router.route('/join-ff-tournament/:tournamentId').post(authMiddleware_1.jwtVerify, ffTournamentControllers_1.joinFfTournamentControllers);
router.route('/get-entered-tournament').get(authMiddleware_1.jwtVerify, ffTournamentControllers_1.showAllreadyEnteredTournament);
exports.default = router;
