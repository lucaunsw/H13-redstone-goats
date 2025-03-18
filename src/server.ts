import express from "express";
import { Request, Response, NextFunction } from "express";
import { orderCreate, orderCancel, orderConfirm } from "./app";
import config from "./config.json";
import cors from "cors";
import morgan from "morgan";
import { ErrKind, SessionId, UserId, Err } from './types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 
import { createClient } from 'redis';
// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
// import path from 'path';

import {
  userRegister,
  userLogin,
  userLogout,
  userDetails,
  // userDetailsUpdate,
} from './user';
import { addToken, clearAll, validToken } from "./dataStore";

const app = express();

// Redis client for blacklisted tokens

export const redisClient = createClient({
    username: 'default',
    password: 'j7euyZefqwLnIUNtINB8xYORmtm0reRo',
    socket: {
        host: 'redis-13657.c326.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 13657
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

redisClient.connect();

redisClient.set('foo', 'bar');
const result = redisClient.get('foo');
console.log(result)  // >>> bar

// Middleware to parse JSON body
app.use(express.json());

// Middleware to allow access from other domains
app.use(cors());

// Middleware for logging HTTP requests
app.use(morgan("dev"));

const PORT = parseInt(process.env.PORT || config.port);
const HOST = process.env.IP || "127.0.0.1";
const JWT_SECRET = process.env.JWT_SECRET || "r3dSt0nE@Secr3tD00r!";

// Create path to swagger document.
// const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// // Route to serve swagger file.
// app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===========================================================================
// ============================= ROUTES BELOW ================================
// ===========================================================================

//Custom middleware for JWT
const jwtMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return next(); // No token, continue
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      res.status(ErrKind.ENOTOKEN).json({ error: 'Token is blacklisted. Please log in again.' });  // Send response and exit
      return 
    }

    // Verify and decode the token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.body.token = decoded.userId; // Attach userId from JWT payload

    next(); // Continue to the next middleware/route
  } catch (error) {
    res.status(ErrKind.ENOTOKEN).json({ error: 'Token is not valid or expired' });  // Send response and exit
    return 
  }
};

// Apply middleware correctly
app.use(jwtMiddleware);

// Function for generating JWT 
function makeJwtToken(userId: number): { token: SessionId } {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
  return { token: token };
}
//End of Custome middleware for JWT

app.post('/v1/user/logout', async (req: Request, res: Response) => {
  const token = req.header('Authorization')?.split(' ')[1];  
  const result = await userLogout(token);
  res.json(result);
});

app.post('/v1/user/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const result = await userRegister(email, password, nameFirst, nameLast); 
    const sessionToken = await makeJwtToken(result.userId); 
    res.json(sessionToken);
  } catch (err) {
    if (err instanceof Error) {
      res.status(ErrKind.EINVALID).json({ error: err.message }); 
    } else {
      res.status(ErrKind.EINVALID).json({ error: 'An unknown error occurred' }); 
    }
  }
});

app.post('/v1/user/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await userLogin(email, password); 
    const sessionToken = await makeJwtToken(result.userId);
    res.json(sessionToken);
  } catch (err) {
    if (err instanceof Error) {
      res.status(ErrKind.EINVALID).json({ error: err.message }); 
    } else {
      res.status(ErrKind.EINVALID).json({ error: 'An unknown error occurred' }); 
    }
  }
});

app.get('/v1/user/details', async (req: Request, res: Response) => {
  try {
    const userId = req.body.token; // INTERCEPTED!!
    const result = await userDetails(userId);
    res.json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(ErrKind.EINVALID).json({ error: err.message }); 
    } else {
      res.status(ErrKind.EINVALID).json({ error: 'An unknown error occurred' }); 
    }
  }
});

// app.put('/v1/user/details/update', (req: Request, res: Response) => {
//   const { token, email, nameFirst, nameLast } = req.body; // INTERCEPTED!
//   const result = userDetailsUpdate(token, email, nameFirst, nameLast);
//   res.json(result);
// });

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

// Route that creates an order.
app.post("/v1/order/create", async (req: Request, res: Response) => {
  const order = req.body;
  try {
    const result = await orderCreate(order);
    res.status(201).json(result);
  } catch (error) {
    const e = error as Error;
    if (e.message === 'Invalid userId or a different name is registered to userId' ||
      e.message === 'No userId provided') {
      res.status(ErrKind.ENOTOKEN).json({ error: e.message });
    } else {
      res.status(ErrKind.EINVALID).json({ error: e.message });
    }
  }
});

// app.put("/v1/:userId/order/:orderId/cancel", (req: Request, res: Response) => {
//   try {
//     const { userId, orderId } = req.params;
//     const { reason } = req.body;

//     const result = orderCancel(Number(userId), Number(orderId), reason);
//     res.json(result);
//   } catch (error) {
//     let statusCode: number;
//     const e = error as Error;
//     if (e.message === "invalid orderId" || e.message === "invalid userId") {
//       statusCode = 401;
//     } else if (e.message === "order already cancelled") {
//       statusCode = 400;
//     } else {
//       statusCode = 404;
//     }
//     res.status(statusCode).json({ error: e.message });
//   }
// });

// app.post(
//   "/v1/:userId/order/:orderId/confirm",
//   (req: Request, res: Response) => {
//     try {
//       const { userId, orderId } = req.params;

//       const result = orderConfirm(Number(userId), Number(orderId));
//       res.json(result);
//     } catch (error) {
//       let statusCode: number;
//       const e = error as Error;
//       if (e.message === "invalid orderId" || e.message === "invalid userId") {
//         statusCode = 401;
//       } else if (e.message === "order not found") {
//         statusCode = 400;
//       } else {
//         statusCode = 404;
//       }
//       res.status(statusCode).json({ error: e.message });
//     }
//   }
// );

app.delete('/v1/clear', async (_: Request, res: Response) => {
  res.json(await clearAll());
});

// Custom **error handling** middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  err instanceof Err ? res.status(err.kind.valueOf()).json({ error: err.message }) : next();
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
