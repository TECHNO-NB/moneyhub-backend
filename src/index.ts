import app from './app';
import { config } from 'dotenv';

config();

const port: number | string = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
