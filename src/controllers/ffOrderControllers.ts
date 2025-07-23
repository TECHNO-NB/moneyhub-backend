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
    throw new ApiError(false, 401, 'Please login first');
  }

  const { ffUid, ffName, diamondPrice, diamondTitle } = req.body;

  if (!ffUid || !ffName || !diamondPrice || !diamondTitle) {
    throw new ApiError(false, 400, 'Please fill all the fields');
  }

  // Step 1: Check balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  if (!user) {
    throw new ApiError(false, 404, 'User not found');
  }

  if (user.balance < diamondPrice) {
    throw new ApiError(false, 400, 'Insufficient balance');
  }

  // Step 2: Transaction (create order + update balance)
  const [createOrder, _] = await prisma.$transaction([
    prisma.ffOrder.create({
      data: {
        userId,
        ffUid,
        ffName,
        diamondPrice,
        diamondTitle: JSON.stringify(diamondTitle),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: diamondPrice,
        },
      },
    }),
  ]);

  return res
    .status(201)
    .json(new ApiResponse(true, 201, 'Order created successfully', createOrder));
});


export { buyDiamondControllers };
