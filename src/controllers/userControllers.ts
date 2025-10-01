import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import prisma from '../DB/db';
import ApiResponse from '../utils/apiResponse';
import generateRefreshAcessToken from '../helpers/generateJwtTokens';
import { cookieOptions } from '../helpers/cookieOption';
import { uploadToCloudinary } from '../utils/cloudinary';
import { comparePassword, hashPassword } from '../utils/hash';

const signInControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { token } = req.body;

  if (!token.email || !token.name || !token.picture) {
    throw new ApiError(false, 400, 'Please fill the all required field');
  }

  const alreadyLoginUser = await prisma.user.findUnique({ where: { email: token.email } });

  if (alreadyLoginUser) {
    const dataOfUser = {
      id: alreadyLoginUser?.id,
      email: alreadyLoginUser?.email,
      fullName: alreadyLoginUser?.fullName,
      avatar: alreadyLoginUser?.avatar,
      balance: alreadyLoginUser?.balance,
    };
    const generateJwtToken = await generateRefreshAcessToken(dataOfUser);
    if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
      throw new ApiError(false, 500, 'Jwt Token Generate failed');
    }
    return res
      .cookie('accessToken', generateJwtToken.accessToken, cookieOptions)
      .cookie('refreshToken', generateJwtToken.refreshToken, cookieOptions)
      .status(200)
      .json(new ApiResponse(true, 200, 'User signin successfully', alreadyLoginUser));
  }

  const userData = {
    email: token.email,
    fullName: token.name,
    avatar: token.picture,
  };

  const createUser = await prisma.user.create({
    data: userData,
  });

  if (!createUser) {
    throw new ApiError(false, 500, 'User signin failed');
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token.email,
    },
  });

  const dataOfUser = {
    id: user?.id,
    email: user?.email,
    fullName: user?.fullName,
    avatar: user?.avatar,
    balance: user?.balance,
  };

  const generateJwtToken = await generateRefreshAcessToken(dataOfUser);
  if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
    throw new ApiError(false, 500, 'Jwt Token Generate failed');
  }

  return res
    .cookie('accessToken', generateJwtToken.accessToken, cookieOptions)
    .cookie('refreshToken', generateJwtToken.refreshToken, cookieOptions)
    .status(201)
    .json(new ApiResponse(true, 201, 'User signin successfully', user));
});

// user register
const registerUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { email, fullName, password } = req.body;
  const avatar = req.file?.path;
  if (!avatar) {
    throw new ApiError(false, 400, 'Avatar is required');
  }

  if (!email || !fullName || !password) {
    throw new ApiError(false, 400, 'Please fill the all required field');
  }
  const alreadyRegisterUser = await prisma.user.findUnique({ where: { email: email } });
  if (alreadyRegisterUser) {
    throw new ApiError(false, 409, 'User already register with this email');
  }
  const hashedPassword = await hashPassword(password);
  if (!hashedPassword) {
    throw new ApiError(false, 500, 'Password hash failed');
  }

  const cloudinaryUrl = await uploadToCloudinary(avatar);
  if (!cloudinaryUrl) {
    throw new ApiError(false, 500, 'Avatar upload failed');
  }

  const userData = {
    email: email,
    fullName: fullName,
    avatar: cloudinaryUrl,
    password: hashedPassword,
  };
  const createUser = await prisma.user.create({
    data: userData,
  });
  if (!createUser) {
    throw new ApiError(false, 500, 'User register failed');
  }
  return res.status(201).json(new ApiResponse(true, 201, 'User register successfully', createUser));
});

// login user
const loginUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(false, 400, 'Please fill the all required field');
  }
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user || !user.password) {
    throw new ApiError(false, 404, 'User not found');
  }
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(false, 400, 'Invalid password');
  }
  const dataOfUser = {
    id: user?.id,
    email: user?.email,
    fullName: user?.fullName,
    avatar: user?.avatar,
    balance: user?.balance,
  };
  const generateJwtToken = await generateRefreshAcessToken(dataOfUser);
  if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
    throw new ApiError(false, 500, 'Jwt Token Generate failed');
  }
  return res
    .cookie('accessToken', generateJwtToken.accessToken, cookieOptions)
    .cookie('refreshToken', generateJwtToken.refreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(true, 200, 'User login successfully', user));
});

// verify user
const verifyUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  // @ts-ignore
  const user = req.user;
  if (!user.id) {
    throw new ApiError(false, 401, 'Id is required');
  }
  const dataOfUser = {
    id: user?.id,
    email: user?.email,
    fullName: user?.fullName,
    avatar: user?.avatar,
    balance: user?.balance,
  };

  const generateJwtToken = await generateRefreshAcessToken(dataOfUser);
  if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
    throw new ApiError(false, 500, 'Jwt Token Generate failed');
  }
  return res
    .cookie('accessToken', generateJwtToken.accessToken, cookieOptions)
    .cookie('refreshToken', generateJwtToken.refreshToken, cookieOptions)
    .status(201)
    .json(new ApiResponse(true, 201, 'User verify successfully', user));
});

// logout user
const logoutUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(true, 200, 'User logout successfully'));
});

// Get all ff topup list
const getAllFfTopUpListControllers = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const getAllFfTopUpList = await prisma.ffTopUpRate.findMany({
      select: {
        id: true,
        diamondTitle: true,
        price: true,
        realPrice: true,
      },
    });

    if (!getAllFfTopUpList) {
      throw new ApiError(false, 404, 'No ff top up list found');
    }
    return res
      .status(200)
      .json(new ApiResponse(true, 200, 'Get all ff topup list', getAllFfTopUpList));
  }
);

// get all ff tournament
const getAllFfTournamentControllers = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const getAllFfTournament = await prisma.ffTournament.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
    if (!getAllFfTournament) {
      throw new ApiError(false, 404, 'No ff tournament found');
    }
    return res
      .status(200)
      .json(new ApiResponse(true, 200, 'Get all ff tournament', getAllFfTournament));
  }
);

// saved notification token in db
const saveNotificationTokenControllers = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { token } = req.body;
    // @ts-ignore
    const { id } = req.user;

    if (!id || !token) {
      throw new ApiError(false, 400, 'Invalid request');
    }

    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        token: token,
      },
    });
    if (!user) {
      throw new ApiError(false, 404, 'User not found');
    }
    return res.status(200).json(new ApiResponse(true, 200, 'Save notification token', user));
  }
);

// get all banner
const getAllBanner = asyncHandler(async (req, res): Promise<any> => {
  const getBanner = await prisma.banner.findMany();
  if (!getBanner) {
    throw new ApiError(false, 500, 'Failed to get all Banner');
  }
  return res.status(200).json(new ApiResponse(true, 200, 'Get all banner successfully', getBanner));
});

// Transfer coin to another account
const sendCoinControllers = asyncHandler(async (req, res) :Promise<any>=> {
  const { id, coin } = req.body;
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(false, 400, 'User ID is Required');
  }

  if (!id || !coin) {
    throw new ApiError(false, 400, 'Coin And Id is Required');
  }

  const getUserCoin = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      balance: true,
    },
  });

  if (!getUserCoin) {
    throw new ApiError(false, 400, 'User not found');
  }

  if (getUserCoin.balance <= coin) {
    throw new ApiError(false, 400, 'Coin is less then have');
  }

  const decrementCoin=await prisma.user.update({
    where:{
      id:userId
    },
    data:{
      balance:{
        decrement:coin
      }
    }
  })

  if(!decrementCoin){
     throw new ApiError(false, 400, 'Error to Decrement coin');
  }

  const updateCoin = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      balance: {
        increment: coin,
      },
    },
  });
  if(!updateCoin){
    throw new ApiError(false, 400, 'Error to Increment coin');
  }

  return res
  .status(200)
  .json(new ApiResponse(true,200,"Coin Trasfer successfully"))
});

export {
  signInControllers,
  verifyUserControllers,
  logoutUserControllers,
  getAllFfTopUpListControllers,
  getAllFfTournamentControllers,
  saveNotificationTokenControllers,
  registerUserControllers,
  loginUserControllers,
  getAllBanner,
  sendCoinControllers,
};
