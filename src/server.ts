import express from "express";
import { Request, Response } from "express";
import { orderCancel } from "./app";
import config from "../config.json";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Middleware to allow access from other domains
app.use(cors());

// Middleware for logging HTTP requests
app.use(morgan("dev"));

const PORT = parseInt(process.env.PORT || config.port);
const HOST = process.env.IP || "127.0.0.1";

// ===========================================================================
// ============================= ROUTES BELOW ================================
// ===========================================================================

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

app.put("/v1/:userId/order/:orderId/cancel", (req: Request, res: Response) => {
  try {
    const { userId, orderId } = req.params;
    const { reason } = req.body;

    const result = orderCancel(userId, orderId, reason);
    res.json(result);
  } catch (error) {
    let statusCode: number;
    const e = error as Error;
    if (e.message === "invalid orderId" || e.message === "invalid userId") {
      statusCode = 401;
    } else if (e.message === "order already cancelled") {
      statusCode = 400;
    } else {
      statusCode = 404;
    }
    res.status(statusCode).json({ error: e.message });
  }
});

// ===========================================================================
// ============================= ROUTES ABOVE ================================
// ===========================================================================

const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Shutting down server gracefully.");
    process.exit();
  });
});
