import express from "express";
import {jwtVerify} from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";
import { checkStatusNotificationOfBalance, loadBalanceControllers } from "../controllers/balanceControllers";

const router =express.Router();

router.route("/load-balance").post(jwtVerify,upload.single("paymentImage"),loadBalanceControllers);
router.route("/balance-status").get(jwtVerify,checkStatusNotificationOfBalance);

export default router;