import prisma from '../DB/db';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

const joinFfTournamentControllers = asyncHandler(async (req, res): Promise<any> => {
  const { gameName, cost } = req.body;
  const { tournamentId } = req.params;

  //   @ts-ignore
  const { id } = req.user;
  if (!tournamentId) {
    throw new ApiError(false, 400, 'TournamentId required');
  }
  if (!id) {
    throw new ApiError(false, 400, 'User id required');
  }

  if (!gameName) {
    throw new ApiError(false, 400, 'Game name required');
  }

  const tournament = await prisma.ffTournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      title: true,
      enteredFfTournament: true,
    },
  });

  if (!tournament?.id && !tournament?.title) {
    throw new ApiError(false, 404, 'Tournament not found');
  }

  const alreadyEntered = tournament.enteredFfTournament.some((entry: { userId: string }) => {
    return entry.userId === id;
  });

  if (alreadyEntered) {
    throw new ApiError(false, 409, 'You are already in this tournament');
  }
  if (tournament?.enteredFfTournament.length > 48) {
    throw new ApiError(false, 400, 'Tournament is full');
  }

  const findUserCoin = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      balance: true,
    },
  });

  if (!findUserCoin) {
    throw new ApiError(false, 400, 'User not found');
  }
  if ((findUserCoin.balance ?? 0) < cost) {
    throw new ApiError(false, 400, 'Low balance');
  }

  const updateBalance = await prisma.user.update({
    where: { id: id },
    data: {
      balance: {
        decrement: cost,
      },
    },
  });
  if (!updateBalance) {
    throw new ApiError(false, 400, 'Failed to update balance');
  }

  const joinTournament = await prisma.enteredFfTournament.create({
    data: {
      userId: id,
      gameName: gameName,
      tournamentId,
    },
  });
  if (!joinTournament) {
    throw new ApiError(false, 400, 'Failed to join tournament');
  }

  return res
    .status(201)
    .json(new ApiResponse(true, 201, 'Successfully join to tournament', joinTournament));
});

// get entered tournament details
const showAllreadyEnteredTournament = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id } = req.user;

  if (!id) {
    throw new ApiError(false, 401, 'Unauthorized');
  }
  const findUserEnteredTournament = await prisma.ffTournament.findMany({
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
    .json(new ApiResponse(true, 201, 'Successfully join to tournament', findUserEnteredTournament));
});

// update enterTournament notifications
const updateEnterTournamentNotifications = asyncHandler(async (req, res): Promise<any> => {
  const { message, status } = req.body;

  if (!message || !status) {
    throw new ApiError(false, 400, 'Failed to update enterTournament notifications');
  }

  const update = await prisma.enteredFfTournament.updateMany({
    data: {
      message,
      status,
    },
  });
  if (!update) {
    throw new ApiError(false, 400, 'Failed to update enterTournament notifications');
  }

  res.status(200).json(new ApiResponse(true, 200, 'successfully updated tourna notifications'));
});
export {
  joinFfTournamentControllers,
  showAllreadyEnteredTournament,
  updateEnterTournamentNotifications,
};
