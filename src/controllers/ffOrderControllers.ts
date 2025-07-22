import prisma from '../DB/db';
import { ffOrderTypes } from '../types/types';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

// buy diamond freefire
const buyDiamondControllers = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const userId = req?.user.id;
  if (!userId) {
    throw new ApiError(false, 401, 'Please login first ');
  }

  const { ffUid, ffName, diamondPrice, diamondTitle } = req.body;

  console.log("ffUid",ffUid);

  if (!ffUid || !ffName || !diamondPrice || !diamondTitle) {
    throw new ApiError(false, 400, 'Please fill all the fields ');
  }
  const orderData: ffOrderTypes = {
    userId: userId,
    ffUid: BigInt(ffUid),
    ffName: ffName,
    diamondPrice: diamondPrice,
    diamondTitle: JSON.stringify(diamondTitle),
  };
  const createOrder = await prisma.ffOrder.create({
    // @ts-ignore
    data: orderData,
  });

  if (!createOrder) {
    throw new ApiError(false, 500, 'Failed to create order ');
  }

  const minusBalance = await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: diamondPrice } },
  });
  if (!minusBalance) {
    throw new ApiError(false, 500, 'Failed to update balance ');
  }

  return res
    .status(201)
    .json(new ApiResponse(true, 201, 'Order created successfully ', createOrder));
});

export { buyDiamondControllers };
