import jwt, { Jwt } from 'jsonwebtoken';
import prisma from '../DB/db';

interface UserPayload {
  id?: string;
  email?: string;
  role?: string;
  fullName?: string;
  balance?: number;
}

const generateRefreshAccessToken = async (userData: UserPayload) => {
  const refreshToken = jwt.sign(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      fullName: userData.fullName,
      balance: userData.balance,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET!,
    { expiresIn: '62d' }
  );

  const accessToken = jwt.sign(
    {
      id: userData.id,
      email: userData.email,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    { expiresIn: '62d' }
  );

  const isUpdate = await prisma.user.update({
    where: { id: userData.id },
    data: { refreshToken },
  });
  if (!isUpdate) {
    throw new Error('Failed to update user');
  }

  return { refreshToken, accessToken };
};

export default generateRefreshAccessToken;
