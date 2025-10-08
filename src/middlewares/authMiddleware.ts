import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError';
import asyncHandler from '../utils/asyncHandler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../DB/db';

const jwtVerify = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = await req.cookies;

    if (!accessToken || !refreshToken) {
      throw new ApiError(false, 401, 'Access token and refresh token are required');
    }
    const decodeAccessToken = (await jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    )) as JwtPayload;
    if (!decodeAccessToken) {
      throw new ApiError(false, 401, 'Invalid access token');
    }
    const user = await prisma.user.findUnique({ where: { id: decodeAccessToken.id } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(
        false,
        401,
        'Invalid refresh token deu to mismatch of token in db and cookie'
      );
    }
    const decodeRefreshToken = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    );
    if (!decodeRefreshToken) {
      throw new ApiError(false, 401, 'Invalid refresh token due to not decoded');
    }
    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

const isAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = await req.cookies;

    if (!accessToken || !refreshToken) {
      throw new ApiError(false, 401, 'Access token and refresh token are required');
    }
    const decodeAccessToken = (await jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    )) as JwtPayload;
    if (!decodeAccessToken) {
      throw new ApiError(false, 401, 'Invalid access token');
    }
    const user = await prisma.user.findUnique({ where: { id: decodeAccessToken.id } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(false, 401, 'Invalid refresh token');
    }
    const decodeRefreshToken = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    );
    if (!decodeRefreshToken) {
      throw new ApiError(false, 401, 'Invalid refresh token');
    }
    if (user.role === 'admin') {
      // @ts-ignore
      req.user = user;
      return next();
    } else {
      throw new ApiError(false, 403, 'Forbidden: Admins only');
    }
  } catch (error) {
    next(error);
  }
});

const isAdminSubAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = await req.cookies;

    if (!accessToken || !refreshToken) {
      throw new ApiError(false, 401, 'Access token and refresh token are required');
    }
    const decodeAccessToken = (await jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    )) as JwtPayload;
    if (!decodeAccessToken) {
      throw new ApiError(false, 401, 'Invalid access token');
    }
    const user = await prisma.user.findUnique({ where: { id: decodeAccessToken.id } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(false, 401, 'Invalid refresh token');
    }
    const decodeRefreshToken = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    );
    if (!decodeRefreshToken) {
      throw new ApiError(false, 401, 'Invalid refresh token');
    }
    if (user.role === 'admin' || user.role === 'subadmin') {
      // @ts-ignore
      req.user = user;
      return next();
    } else {
      throw new ApiError(false, 403, 'Forbidden: Admins And Subadmin only');
    }
  } catch (error) {
    next(error);
  }
});

export { jwtVerify, isAdmin, isAdminSubAdmin };
