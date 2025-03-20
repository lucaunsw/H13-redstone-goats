import express from "express";
import { Request, Response, NextFunction } from "express";
import { orderCreate, orderCancel, orderConfirm, orderUserSales, orderChange } from "./app";
import config from "./config.json";
import cors from "cors";
import morgan from "morgan";
import { ErrKind, SessionId, Err } from './types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 
import { createClient } from 'redis';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { VercelRequest, VercelResponse } from '@vercel/node';

import {
  userRegister,
  userLogin,
  userLogout,
  userDetails,
  // userDetailsUpdate,
} from './user';
import { addToken, clearAll, validToken } from "./dataStore";

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Middleware to allow access from other domains
app.use(cors());

// Middleware for logging HTTP requests
app.use(morgan("dev"));

const PORT = parseInt(process.env.PORT || config.port);
const HOST = process.env.IP || "127.0.0.1";
const JWT_SECRET = process.env.JWT_SECRET || "r3dSt0nE@Secr3tD00r!";

//? CDN CSS
const CSS_URL =
 "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.1/swagger-ui.min.css";

// Ensure the correct path
const swaggerPath = path.join(process.cwd(), 'public', 'swagger.yaml');

// Read and parse the YAML file into a JavaScript object
const swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, 'utf8')) as object;

// Route to serve Swagger UI with custom CSS
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: CSS_URL,  // <-- Add custom CSS URL here
  })
);


// ===========================================================================
// ============================= REDIS CLIENT ================================
// ===========================================================================

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-13657.c326.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 13657
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('✅ Redis connected successfully!');
    }

    await redisClient.set('foo', 'bar');
    const result = await redisClient.get('foo');
    console.log('Redis Test:', result);  // ✅ "bar"
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  }
}

// Call the function
connectRedis();

// ===========================================================================
// ============================= VERCEL HANDLER ==============================
// ===========================================================================

// Export handler for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res); // Invoke the app instance to handle the request
};

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
//End of Custom middleware for JWT

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
  res.send("Order creation API is currently in development");
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

app.put("/v1/:userId/order/:orderId/cancel", async (req: Request, res: Response) => {
  try {
    const { userId, orderId } = req.params;
    const { reason } = req.body;

    const result = await orderCancel(Number(userId), Number(orderId), reason);
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


app.post("/v1/:userId/order/:orderId/confirm", async (req: Request, res: Response) => {
    try {
      const { userId, orderId } = req.params;

      const result = await orderConfirm(Number(userId), Number(orderId));
      res.json(result);
    } catch (error) {
      let statusCode: number;
      const e = error as Error;
      if (e.message === "invalid orderId" || e.message === "invalid userId") {
        statusCode = 401;
      } else if (e.message === "order has been cancelled") {
        statusCode = 400;
      } else {
        statusCode = 404;
      }
      res.status(statusCode).json({ error: e.message });
    }
  }
);

app.put("/v1/:userId/order/:orderId/change", async (req: Request, res: Response) => {
  try {
    const { userId, orderId } = req.params;
    const updatedData = req.body;

    console.log('Route reached!');

    // Call function, return updated order
      const result = await orderChange(Number(userId), Number(orderId), updatedData);
      res.json({orderId: result});

    // Error Checking
    } catch (error) {
      const e = error as Error;
      let statusCode = 500; // default error code

      if (e.message === "Invalid orderId" || e.message === "Invalid userId") {
        statusCode = 401; 
      } else if (e.message == "order not found") {
        statusCode = 400;
      } else if (e.message.includes("Item with id") || e.message.includes("Invalid quantity")) {
        statusCode = 422; // note to self, add changes to swagger + documentation
      } else {
        statusCode = 404;
      }
      res.status(statusCode).json({ error: e.message });
    };
  }
);

// Route that returns user sales data.
app.post("/v1/order/:userId/sales", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const csv = req.query.csv === "true";
  const json = req.query.json === "true";
  const pdf = req.query.pdf === "true";
  try {
    const result = await orderUserSales(csv, json, pdf, userId);
    res.status(200).json(result);
  } catch (error) {
    const e = error as Error;
    if (e.message === 'Invalid sellerId' || e.message === 'No sellerId provided') {
      res.status(401).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
});

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
