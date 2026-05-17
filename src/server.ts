import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();
import config from "./config/index";
import { server } from "./app";
import { prisma } from "./database/prisma";

const PORT = config.port ? Number(config.port) : 8000;

prisma.$connect()
  .then(() => prisma.$queryRaw`SELECT 1`)
  .then(() => {
    console.log(chalk.green("Database connected successfully!"));
    server.listen(config.port, () => {
      console.log(chalk.green(`Server running at http://localhost:${PORT}`));
    });
  })
  .catch((error: any) => {
    let errorMessage = error.message || "Unknown error";
    
    // Extract the specific message from Prisma's verbose error string
    const match = errorMessage.match(/Message: \`(.*?)\`/);
    if (match && match[1]) {
      errorMessage = match[1];
    }
    
    console.log(chalk.red(`Database connection failed!!\n${errorMessage}`));
    process.exit(1);
  });
