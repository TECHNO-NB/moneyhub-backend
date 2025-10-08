import { app } from './app';
import { config } from 'dotenv';
import cluster from 'cluster';
import os from 'os';

config();

const port: number | string = process.env.PORT || 8000;

// cluster 
if (cluster.isPrimary) {
  const totalCpu = os.cpus().length;
  console.log(`Primary ${process.pid} running, forking ${totalCpu} workers...`);
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.error(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
