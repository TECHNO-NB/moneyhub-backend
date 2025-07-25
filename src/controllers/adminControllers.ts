import prisma from '../DB/db';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';
import { deleteCloudinaryImage } from '../utils/cloudinary';

// check  All load balance screenshot
const checkAllLoadBalanceScreenshot = asyncHandler(async (req, res): Promise<any> => {
  const screenshotALLData = await prisma.user.findMany({
    where: {
      loadBalance: {
        some: {},
      },
    },
    include: {
      loadBalance: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  });

  if (!screenshotALLData || screenshotALLData.length === 0) {
    throw new ApiError(false, 500, 'unabale to fetch user load balance data');
  }
  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Fetch all load balance request ', screenshotALLData));
});

// load coin to user wallet after screenshot verfication

const loadCoinToUserWallet = asyncHandler(async (req, res): Promise<any> => {
  const { message, status, userId, paymentScreenshot } = req.body;
  const { orderId } = req.params;

  if (!orderId) {
    throw new ApiError(false, 500, 'orderId is required');
  }

  if (!message || !status || !userId || !paymentScreenshot) {
    throw new ApiError(false, 500, 'invalid request body');
  }

  const findLoadBalanceOrder = await prisma.loadBalance.update({
    where: {
      id: orderId,
    },
    data: {
      status,
      message,
    },
  });
  if (!findLoadBalanceOrder) {
    throw new ApiError(false, 500, 'invalid order id');
  }
  const realAmount = findLoadBalanceOrder.amount;
  if (!realAmount) {
    throw new ApiError(false, 500, 'invalid amount');
  }

  if (status === 'approved') {
    const updateUserAmount = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: {
          increment: realAmount,
        },
      },
    });
    if (!updateUserAmount) {
      throw new ApiError(false, 500, 'invalid user id');
    }
    const deleteScreeshot = await deleteCloudinaryImage(paymentScreenshot);

    if (!deleteScreeshot) {
      throw new ApiError(false, 500, 'Screenshot not delete');
    }

    return res.status(200).json(new ApiResponse(true, 200, 'Amount load successfully', status));
  } else {
    return res.status(200).json(new ApiResponse(true, 200, 'Status updated successfully', status));
  }
});

// fetch all user details
const getAllUserDetails = asyncHandler(async (req, res): Promise<any> => {
  const allUser = await prisma.user.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });
  if (!allUser) {
    throw new ApiError(false, 500, 'Unable to fetch all user');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'All user fetched successfully', allUser));
});

// fetch all ff order
const allFfOrderControllers = asyncHandler(async (req, res): Promise<any> => {
  const allFfOrder = await prisma.ffOrder.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      user: {
        select: {
          fullName: true,
          balance: true,
        },
      },
    },
  });

  if (!allFfOrder || allFfOrder.length === 0) {
    throw new ApiError(false, 500, 'unabale to fetch user load balance data');
  }
  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Fetch all load balance request ', allFfOrder));
});

// ff order fullfill
const completeFfOrder = asyncHandler(async (req, res): Promise<any> => {
  const { message, status, userId } = req.body;
  const { orderId } = req.params;

  if (!orderId) {
    throw new ApiError(false, 500, 'orderId is required');
  }

  if (!message || !status || !userId) {
    throw new ApiError(false, 500, 'invalid request body');
  }

  const findFfOrder = await prisma.ffOrder.update({
    where: {
      id: orderId,
    },
    data: {
      status,
      message,
    },
  });
  if (!findFfOrder) {
    throw new ApiError(false, 500, 'invalid order id');
  }

  if (status === 'delivered') {
    return res
      .status(200)
      .json(new ApiResponse(true, 200, 'Ff order fullfill successfully', findFfOrder));
  } else if (status === 'rejected') {
    const addBalance = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: {
          increment: Number(findFfOrder.diamondPrice),
        },
      },
    });
    if (!addBalance) {
      throw new ApiError(false, 500, 'unabale to add user balance');
    }
    return res.status(200).json(new ApiResponse(true, 200, 'Ff order rejected', findFfOrder));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(true, 200, 'Status updated successfully', findFfOrder));
  }
});

// delete user
const deleteUser = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id } = req.user;
  const { userId } = req.params;

  if (!id) {
    throw new ApiError(false, 401, 'invalid user id should login with admin');
  }
  if (!userId) {
    throw new ApiError(false, 400, 'invalid user id');
  }

  if (id === userId) {
    throw new ApiError(false, 500, 'User can not delete himself');
  }

  const user = await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(false, 404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'User deleted successfully', user));
});

// change user role
const changeUserRole = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id } = req.user;
  const { userId } = req.params;
  const { newRole } = req.body;

  if (!id) {
    throw new ApiError(false, 401, 'invalid user id should login with admin');
  }
  if (!userId) {
    throw new ApiError(false, 400, 'invalid user id');
  }
  if (!newRole) {
    throw new ApiError(false, 400, 'invalid new role');
  }

  const updateRole = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: newRole,
    },
  });
  if (!updateRole) {
    throw new ApiError(false, 404, 'User not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'User role changes successfully', updateRole));
});

// add coin to user by admin himself after cash payment
const addCoinToUser = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id } = req.user;
  const { userId } = req.params;
  const { coin } = req.body;
  if (!id) {
    throw new ApiError(false, 401, 'invalid user id should login with admin');
  }
  if (!userId) {
    throw new ApiError(false, 400, 'invalid user id');
  }
  if (!coin) {
    throw new ApiError(false, 400, 'invalid coin amount');
  }
  const addCoin = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      balance: {
        increment: coin,
      },
    },
  });
  if (!addCoin) {
    throw new ApiError(false, 404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'Coin added successfully', addCoin));
});

// removed coin from user balance
const removeCoinFromUser = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id } = req.user;
  const { userId } = req.params;
  const { coin } = req.body;
   if (!id) {
    throw new ApiError(false, 401, 'invalid user id should login with admin');
  }
  if (!userId) {
    throw new ApiError(false, 400, 'invalid user id');
  }
  if (!coin) {
    throw new ApiError(false, 400, 'invalid coin amount');
  }
  const removeCoin = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      balance: {
        decrement: coin,
      },
    },
  });
  if (!removeCoin) {
    throw new ApiError(false, 404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'Coin added successfully', removeCoin));
  });
 


export {
  checkAllLoadBalanceScreenshot,
  loadCoinToUserWallet,
  getAllUserDetails,
  allFfOrderControllers,
  completeFfOrder,
  deleteUser,
  changeUserRole,
  addCoinToUser,
  removeCoinFromUser
};
