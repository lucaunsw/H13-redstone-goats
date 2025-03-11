import express from "express";
import { Request, Response, NextFunction } from "express";
import { orderCancel } from "./app";
import config from "./config.json";
import cors from "cors";
import morgan from "morgan";
import { ErrKind, SessionId, UserId, Err } from './types';
import { randomUUID } from 'crypto';

// import {
//   userLogin,
//   userLogout,
//   userRegister,
//   userDetails,
//   userDetailsUpdate,
// } from './user';

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

// // Custom middleware
// app.use((req: Request, res: Response, next: NextFunction) => {
//   // Check if we need to intercept a request (does it contain a token)
//   const token = req.query.token ?? req.body.token ?? req.headers.token;
//   if (token === undefined) {
//     return next();
//   }

//   const sessions = getData().userSessions;
//   if (!sessions.has(token)) {
//     throw new Err('Token does not refer to a valid, logged in session', ErrKind.ENOTOKEN);
//   }

//   // THE INCOMING userId is shoved into the BODY.token!!
//   req.body.token = sessions.get(token);
//   next();
// });

// function makeFmtToken(userId: UserId): { token: SessionId } {
//   const sId = randomUUID();
//   getData().userSessions.set(sId, userId);
//   setData();
//   return { token: sId };
// }
// // END Custom middleware

// app.post('/v1/user/logout', (req: Request, res: Response) => {
//   const token = req.body.token ?? req.headers.token;
//   const result = userLogout(token);
//   res.json(result);
// });

// app.post('/v1/user/register', (req: Request, res: Response) => {
//   const { email, password, nameFirst, nameLast } = req.body;
//   const result = userRegister(email, password, nameFirst, nameLast);
//   res.json(makeFmtToken(result.userId));
// });

// app.post('/v1/user/login', (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const result = userLogin(email, password);

//   res.json(makeFmtToken(result.userId));
// });

// app.get('/v1/user/details', (req: Request, res: Response) => {
//   const userId = req.body.token; // INTERCEPTED!!
//   const result = userDetails(userId);

//   // token interceptor should have handled this for us
//   res.json(result);
// });

// app.put('/v1/user/details/update', (req: Request, res: Response) => {
//   const { token, email, nameFirst, nameLast } = req.body; // INTERCEPTED!
//   const result = userDetailsUpdate(token, email, nameFirst, nameLast);
//   res.json(result);
// });

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
