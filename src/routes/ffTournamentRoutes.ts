import express from "express";
import { jwtVerify } from "../middlewares/authMiddleware";
import { joinFfTournamentControllers, showAllreadyEnteredTournament } from "../controllers/ffTournamentControllers";

const router=express.Router();




router.route("/join-ff-tournament/:tournamentId").post(jwtVerify,joinFfTournamentControllers);
router.route("/get-entered-tournament").get(jwtVerify,showAllreadyEnteredTournament);



export default router;