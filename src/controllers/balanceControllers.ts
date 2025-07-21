import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import prisma from '../DB/db';
import { uploadToCloudinary } from '../utils/cloudinary';
import ApiResponse from '../utils/apiResponse';

// load balance
const loadBalanceControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  //   @ts-ignore
  const userId = req.user.id;
  const amount = Number(req.body.amount);

  if (!userId || amount <= 0) {
    throw new ApiError(false, 400, 'please fill all required field');
  }

  const paymentScreenshot = req.file?.path;
  if (!paymentScreenshot) {
    throw new ApiError(false, 400, 'please upload payment screenshot');
  }

  const cloudinaryUrl = (await uploadToCloudinary(paymentScreenshot)) as any;
  if (!cloudinaryUrl) {
    throw new ApiError(false, 400, 'payment screenshot upload failed');
  }

  const loadBalance = await prisma.loadBalance.create({
    data: {
      userId: userId,
      paymentScreenshot: cloudinaryUrl,
      amount: amount,
    },
  });

  if (!loadBalance) {
    throw new ApiError(false, 500, 'Load balance  failed');
  }
  return res.status(201).json(new ApiResponse(true, 201, 'Load Balance saved to db'));
});

// get user balace update cancel or status
const checkStatusNotificationOfBalance = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
  
    // @ts-ignore
    const user = req.user;
    if (!user) {
      throw new ApiError(false, 400, 'User not found');
    }

    // Load balances
    const loadBalance = await prisma.loadBalance.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    // FF Orders
    const ffOrders = await prisma.ffOrder.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    // If both empty
    if (!loadBalance.length && !ffOrders.length) {
      throw new ApiError(false, 400, 'No load balance or FF orders found');
    }

    return res.status(200).json(
      new ApiResponse(true, 200, 'Notifications found', {
        loadBalance,
        ffOrders,
      })
    );
  }
);

export {loadBalanceControllers,checkStatusNotificationOfBalance}
