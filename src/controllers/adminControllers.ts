import { Request, Response } from 'express';
import { admin } from '../app';
import prisma from '../DB/db';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';
import { deleteCloudinaryImage } from '../utils/cloudinary';

const sendNotification = async (
  token: string | null | undefined,
  title: string,
  body: string,
  link?: string
) => {
  if (!token) return; // No token, skip sending

  const message = {
    notification: { title, body },
    token,
    webpush: {
      fcmOptions: {
        link: link || 'https://moneyhub.store', // default link
      },
    },
  };

  try {
    // @ts-ignore
    await admin.messaging().send(message);
  } catch (error) {
    console.error('Notification send failed:', error);
  }
};

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
    await sendNotification(updateUserAmount.token, message, 'Thank you for load coin.');
    const deleteScreeshot = await deleteCloudinaryImage(paymentScreenshot);

    if (!deleteScreeshot) {
      throw new ApiError(false, 500, 'Screenshot not delete');
    }

    return res.status(200).json(new ApiResponse(true, 200, 'Amount load successfully', status));
  } else {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    await sendNotification(user?.token, message, 'Please upload valid screenshot.');
    const deleteScreeshot = await deleteCloudinaryImage(paymentScreenshot);

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
          id: true,
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
const completeFfOrder = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { message, status, userId } = req.body;
  const { orderId } = req.params;

  if (!orderId) throw new ApiError(false, 400, 'orderId is required');
  if (!message || !status || !userId) throw new ApiError(false, 400, 'Invalid request body');

  const ffOrder = await prisma.ffOrder.update({
    where: { id: orderId },
    data: { status, message },
  });

  if (!ffOrder) throw new ApiError(false, 404, 'Invalid order ID');

  const userData = await prisma.user.findUnique({ where: { id: userId } });

  if (status === 'delivered') {
    await sendNotification(
      userData?.token,
      'Your diamond top-up is delivered.',
      'Thank you for your top-up!'
    );
    return res
      .status(200)
      .json(new ApiResponse(true, 200, 'FF order fulfilled successfully', ffOrder));
  } else if (status === 'rejected') {
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: Number(ffOrder.diamondPrice) } },
    });
    await sendNotification(
      userData?.token,
      'Your top-up order was rejected',
      'The amount has been refunded to your balance.'
    );
    return res.status(200).json(new ApiResponse(true, 200, 'FF order rejected', ffOrder));
  }

  return res.status(200).json(new ApiResponse(true, 200, 'Status updated successfully', ffOrder));
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
  await sendNotification(
    addCoin?.token,
    `You are Credited ${coin} Coin.`,
    'Thank u for using moneyhub'
  );
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
  await sendNotification(
    removeCoin?.token,
    `You Are Debited ${coin} Coin.`,
    'Thank u for using moneyhub'
  );
  return res.status(200).json(new ApiResponse(true, 200, 'Coin added successfully', removeCoin));
});

// create freefire tournament
const createFreeFireTournament = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id } = req.user;
  if (!id) {
    throw new ApiError(false, 401, 'invalid user id should login with admin');
  }

  const { title, time, owner, ammo, skill, reward, cost } = req.body;

  console.log(time)
  console.log(title, time, owner, ammo, skill, reward, cost)
  const convertedReward = parseInt(reward);
  const convertedCost = parseInt(cost);
  if (!title || !time || !owner || !reward || !cost) {
    throw new ApiError(false, 400, 'invalid tournament details');
  }
  const tournament = await prisma.ffTournament.create({
    data: {
      userId: id,
      title,
      time: new Date(time),
      owner,
      ammo,
      skill,
      reward: convertedReward,
      cost: convertedCost,
    },
  });
  if (!tournament) {
    throw new ApiError(false, 404, 'Tournament not found');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'Tournament created successfully'));
});

// get all tournament
const getAllTournament = asyncHandler(async (req, res): Promise<any> => {
  const getAllTournament = await prisma.ffTournament.findMany({
    include: {
      enteredFfTournament: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  if (!getAllTournament) {
    throw new ApiError(false, 404, 'Tournament not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Successfully get all tournament', getAllTournament));
});

// add roomId and Password in ff tournament
const addRoomIdAndPassword = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { tournamentId } = req.params;

  const { roomId, password } = req.body;

  if (!tournamentId) {
    throw new ApiError(false, 404, 'tournament id not found');
  }
  if (!roomId || !password) {
    throw new ApiError(false, 400, 'invalid room id and password');
  }
  const updateRoomIdAndPassword = await prisma.ffTournament.update({
    where: {
      id: tournamentId,
    },
    data: {
      roomId,
      password,
    },
    include: {
      enteredFfTournament: {
        select: {
          userId: true,
          user: {
            select: {
              token: true,
            },
          },
        },
      },
    },
  });

  if (!updateRoomIdAndPassword) {
    throw new ApiError(false, 404, 'Tournament not found');
  }
  await Promise.all(
    updateRoomIdAndPassword.enteredFfTournament.map(async (val) => {
      if (val.user?.token) {
        await sendNotification(
          val.user.token,
          'FF Tournament Is Started.',
          `Room Id: ${roomId}  Password: ${password}`
        );
      }
    })
  );

  return res.status(200).json(new ApiResponse(true, 200, 'Room id and password'));
});

// delete the tournament
const deleteTournament = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { tournamentId } = req.params;
  const deleteTournament = await prisma.ffTournament.delete({
    where: {
      id: tournamentId,
    },
  });
  if (!deleteTournament) {
    throw new ApiError(false, 404, 'Tournament not found');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'Successfully delete tournament'));
});

// make the tournament winner
// const makeWinnerInTournament = asyncHandler(async (req, res): Promise<any> => {
//   // @ts-ignore
//   const { userId } = req.params;
//   const deleteTournament = await prisma.ffTournament.delete({
//     where: {
//       id: tournamentId,
//     },
//   });
//   if (!deleteTournament) {
//     throw new ApiError(false, 404, 'Tournament not found');
//   }
//   return res.status(200).json(new ApiResponse(true, 200, 'Successfully delete tournament'));
// });
export {
  checkAllLoadBalanceScreenshot,
  loadCoinToUserWallet,
  getAllUserDetails,
  allFfOrderControllers,
  completeFfOrder,
  deleteUser,
  changeUserRole,
  addCoinToUser,
  removeCoinFromUser,
  createFreeFireTournament,
  addRoomIdAndPassword,
  getAllTournament,
  deleteTournament,
};
