import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

async function connectDb() {
  await prisma.$connect();
  console.log('Connected to database');
}
connectDb();

async function disconnectDb() {
  await prisma.$disconnect();
}
disconnectDb();
export default prisma;
