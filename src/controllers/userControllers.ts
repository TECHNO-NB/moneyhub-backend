import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import prisma from '../DB/db';
import ApiResponse from '../utils/apiResponse';
import generateRefreshAcessToken from '../helpers/generateJwtTokens';
import { cookieOptions } from '../helpers/cookieOption';

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

export { signInControllers, verifyUserControllers,logoutUserControllers };
