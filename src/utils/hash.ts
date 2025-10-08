import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const hashPassowrd = await bcrypt.hash(password, 10);
  return hashPassowrd;
};

export const comparePassword = async (comparePassword: string, hashPassword: string) => {
  const isMatch = await bcrypt.compare(comparePassword, hashPassword);
  return isMatch;
};
