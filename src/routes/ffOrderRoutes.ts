import express from 'express';
import { jwtVerify } from '../middlewares/authMiddleware';
import { buyDiamondControllers } from '../controllers/ffOrderControllers';

const router = express.Router();

router.route('/buy-diamond').post(jwtVerify, buyDiamondControllers);

export default router;
