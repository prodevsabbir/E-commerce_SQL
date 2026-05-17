import express, { NextFunction, Request, Response } from "express";
import http from "http";
import path from "path";
import { initSocket } from "./socket/server";
import routes from "./routes/index.api";
import { globalErrorHandler } from "./helpers/globalErrorHandler";
import { serverRunningTemplate } from "./tempaletes/serverlive.template";
import config from "./config";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import { notFound } from "./middleware/notFound";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://admin.hesteka.com",
].filter(Boolean);

if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("short"));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.get("/api/v1/ping", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is alive",
    time: new Date(),
  });
});

app.use(cookieParser());

app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/v1", routes);

app.get("/", serverRunningTemplate);
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// Socket.IO setup
const io = initSocket(server);
export { server };
