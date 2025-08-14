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
exports.updateEnterTournamentNotifications = exports.showAllreadyEnteredTournament = exports.joinFfTournamentControllers = void 0;
const db_1 = __importDefault(require("../DB/db"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const joinFfTournamentControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { gameName, cost } = req.body;
    const { tournamentId } = req.params;
    //   @ts-ignore
    const { id } = req.user;
    if (!tournamentId) {
        throw new apiError_1.default(false, 400, 'TournamentId required');
    }
    if (!id) {
        throw new apiError_1.default(false, 400, 'User id required');
    }
    if (!gameName) {
        throw new apiError_1.default(false, 400, 'Game name required');
    }
    const tournament = yield db_1.default.ffTournament.findUnique({
        where: { id: tournamentId },
        select: {
            id: true,
            title: true,
            enteredFfTournament: true,
        },
    });
    if (!(tournament === null || tournament === void 0 ? void 0 : tournament.id) && !(tournament === null || tournament === void 0 ? void 0 : tournament.title)) {
        throw new apiError_1.default(false, 404, 'Tournament not found');
    }
    const alreadyEntered = tournament.enteredFfTournament.some((entry) => {
        return entry.userId === id;
    });
    if (alreadyEntered) {
        throw new apiError_1.default(false, 409, 'You are already in this tournament');
    }
    if ((tournament === null || tournament === void 0 ? void 0 : tournament.enteredFfTournament.length) > 48) {
        throw new apiError_1.default(false, 400, 'Tournament is full');
    }
    const findUserCoin = yield db_1.default.user.findUnique({
        where: {
            id: id,
        },
        select: {
            balance: true,
        },
    });
    if (!findUserCoin) {
        throw new apiError_1.default(false, 400, 'User not found');
    }
    if (((_a = findUserCoin.balance) !== null && _a !== void 0 ? _a : 0) < cost) {
        throw new apiError_1.default(false, 400, 'Low balance');
    }
    const updateBalance = yield db_1.default.user.update({
        where: { id: id },
        data: {
            balance: {
                decrement: cost,
            },
        },
    });
    if (!updateBalance) {
        throw new apiError_1.default(false, 400, 'Failed to update balance');
    }
    const joinTournament = yield db_1.default.enteredFfTournament.create({
        data: {
            userId: id,
            gameName: gameName,
            tournamentId,
        },
    });
    if (!joinTournament) {
        throw new apiError_1.default(false, 400, 'Failed to join tournament');
    }
    return res
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'Successfully join to tournament', joinTournament));
}));
exports.joinFfTournamentControllers = joinFfTournamentControllers;
// get entered tournament details
const showAllreadyEnteredTournament = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id } = req.user;
    if (!id) {
        throw new apiError_1.default(false, 401, 'Unauthorized');
    }
    const findUserEnteredTournament = yield db_1.default.ffTournament.findMany({
        where: {
            enteredFfTournament: {
                some: {
                    userId: id,
                },
            },
        },
        include: {
            enteredFfTournament: {
                where: {
                    userId: id,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    return res
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'Successfully join to tournament', findUserEnteredTournament));
}));
exports.showAllreadyEnteredTournament = showAllreadyEnteredTournament;
// update enterTournament notifications
const updateEnterTournamentNotifications = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, status } = req.body;
    if (!message || !status) {
        throw new apiError_1.default(false, 400, 'Failed to update enterTournament notifications');
    }
    const update = yield db_1.default.enteredFfTournament.updateMany({
        data: {
            message,
            status,
        },
    });
    if (!update) {
        throw new apiError_1.default(false, 400, 'Failed to update enterTournament notifications');
    }
    res.status(200).json(new apiResponse_1.default(true, 200, 'successfully updated tourna notifications'));
}));
exports.updateEnterTournamentNotifications = updateEnterTournamentNotifications;
