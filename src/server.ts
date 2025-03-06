import express, { json, Request, Response } from "express";
import { orderCancel } from "./app";

const app = express();
const PORT = 3000;

// Example route
app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

// orderCancel
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
