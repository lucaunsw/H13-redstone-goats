"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const app_1 = require("./app");
const config_json_1 = __importDefault(require("./config.json"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const types_1 = require("./types");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("redis");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const user_1 = require("./user");
const app = (0, express_1.default)();
// Middleware to parse JSON body
app.use(express_1.default.json());
// Middleware to allow access from other domains
app.use((0, cors_1.default)());
// Middleware for logging HTTP requests
app.use((0, morgan_1.default)("dev"));
const PORT = parseInt(process.env.PORT || config_json_1.default.port);
const HOST = process.env.IP || "127.0.0.1";
const JWT_SECRET = process.env.JWT_SECRET || "r3dSt0nE@Secr3tD00r!";
//? CDN CSS
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.1/swagger-ui.min.css";
// Ensure the correct path
const swaggerPath = path_1.default.join(process.cwd(), 'public', 'swagger.yaml');
// Read and parse the YAML file into a JavaScript object
const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync(swaggerPath, 'utf8'));
// Route to serve Swagger UI with custom CSS
app.use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
    customCssUrl: CSS_URL, // <-- Add custom CSS URL here
}));
// ===========================================================================
// ============================= REDIS CLIENT ================================
// ===========================================================================
exports.redisClient = (0, redis_1.createClient)({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-13657.c326.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 13657
    }
});
exports.redisClient.on('error', err => console.log('Redis Client Error', err));
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!exports.redisClient.isOpen) {
                yield exports.redisClient.connect();
            }
            yield exports.redisClient.set('foo', 'bar');
            const result = yield exports.redisClient.get('foo');
        }
        catch (err) {
            console.error('❌ Redis connection failed:', err);
        }
    });
}
// Call the function
connectRedis();
// ===========================================================================
// ============================= VERCEL HANDLER ==============================
// ===========================================================================
// Export handler for Vercel
exports.default = (req, res) => {
    app(req, res); // Invoke the app instance to handle the request
};
// ===========================================================================
// ============================= ROUTES BELOW ================================
// ===========================================================================
//Custom middleware for JWT
const jwtMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return next(); // No token, continue
        }
        // Check if token is blacklisted in Redis
        const isBlacklisted = yield exports.redisClient.get(`blacklist_${token}`);
        if (isBlacklisted) {
            res.status(types_1.ErrKind.ENOTOKEN).json({ error: 'Token is blacklisted. Please log in again.' }); // Send response and exit
            return;
        }
        // Verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.body.token = decoded.userId; // Attach userId from JWT payload
        next(); // Continue to the next middleware/route
    }
    catch (error) {
        res.status(types_1.ErrKind.ENOTOKEN).json({ error: 'Token is not valid or expired' }); // Send response and exit
        return;
    }
});
// Apply middleware correctly
app.use(jwtMiddleware);
// Function for generating JWT 
function makeJwtToken(userId) {
    const token = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
    return { token: token };
}
//End of Custom middleware for JWT
app.post('/v1/user/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const result = yield (0, user_1.userLogout)(token);
    res.json(result);
}));
app.post('/v1/user/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, nameFirst, nameLast } = req.body;
        const result = yield (0, user_1.userRegister)(email, password, nameFirst, nameLast);
        const sessionToken = yield makeJwtToken(result.userId);
        res.json(sessionToken);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(types_1.ErrKind.EINVALID).json({ error: err.message });
        }
        else {
            res.status(types_1.ErrKind.EINVALID).json({ error: 'An unknown error occurred' });
        }
    }
}));
app.post('/v1/user/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield (0, user_1.userLogin)(email, password);
        const sessionToken = yield makeJwtToken(result.userId);
        res.json(sessionToken);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(types_1.ErrKind.EINVALID).json({ error: err.message });
        }
        else {
            res.status(types_1.ErrKind.EINVALID).json({ error: 'An unknown error occurred' });
        }
    }
}));
app.get('/v1/user/details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.token; // INTERCEPTED!!
        const result = yield (0, user_1.userDetails)(userId);
        res.json(result);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(types_1.ErrKind.EINVALID).json({ error: err.message });
        }
        else {
            res.status(types_1.ErrKind.EINVALID).json({ error: 'An unknown error occurred' });
        }
    }
}));
// app.put('/v1/user/details/update', (req: Request, res: Response) => {
//   const { token, email, nameFirst, nameLast } = req.body; // INTERCEPTED!
//   const result = userDetailsUpdate(token, email, nameFirst, nameLast);
//   res.json(result);
// });
app.get("/", (req, res) => {
    res.send("Order creation API is currently in development");
});
// Route that creates an order.
app.post("/v1/order/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = req.body;
    try {
        const result = yield (0, app_1.orderCreate)(order);
        res.status(201).json(result);
    }
    catch (error) {
        const e = error;
        if (e.message === 'Invalid userId or a different name is registered to userId' ||
            e.message === 'No userId provided') {
            res.status(types_1.ErrKind.ENOTOKEN).json({ error: e.message });
        }
        else {
            res.status(types_1.ErrKind.EINVALID).json({ error: e.message });
        }
    }
}));
app.put("/v1/:userId/order/:orderId/cancel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, orderId } = req.params;
        const { reason } = req.body;
        const result = yield (0, app_1.orderCancel)(Number(userId), Number(orderId), reason);
        res.json(result);
    }
    catch (error) {
        let statusCode;
        const e = error;
        if (e.message === "invalid orderId" || e.message === "invalid userId") {
            statusCode = 401;
        }
        else if (e.message === "order already cancelled") {
            statusCode = 400;
        }
        else {
            statusCode = 404;
        }
        res.status(statusCode).json({ error: e.message });
    }
}));
app.post("/v1/:userId/order/:orderId/confirm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, orderId } = req.params;
        const result = yield (0, app_1.orderConfirm)(Number(userId), Number(orderId));
        res.json(result);
    }
    catch (error) {
        let statusCode;
        const e = error;
        if (e.message === "invalid orderId" || e.message === "invalid userId") {
            statusCode = 401;
        }
        else if (e.message === "order has been cancelled") {
            statusCode = 400;
        }
        else {
            statusCode = 404;
        }
        res.status(statusCode).json({ error: e.message });
    }
}));
// Route that returns user sales data.
app.post("/v1/order/:userId/sales", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId);
    const csv = req.query.csv === "true";
    const json = req.query.json === "true";
    const pdf = req.query.pdf === "true";
    try {
        const result = yield (0, app_1.orderUserSales)(csv, json, pdf, userId);
        res.status(200).json(result);
    }
    catch (error) {
        const e = error;
        if (e.message === 'Invalid sellerId' || e.message === 'No sellerId provided') {
            res.status(401).json({ error: e.message });
        }
        else {
            res.status(400).json({ error: e.message });
        }
    }
}));
// Route that returns user item recommendations.
app.post("/v1/order/:userId/recommendations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId);
    const limit = Number(req.query.limit);
    try {
        const result = yield (0, app_1.orderRecommendations)(userId, limit);
        res.status(200).json(result);
    }
    catch (error) {
        const e = error;
        if (e.message === 'Invalid userId' || e.message === 'No userId provided') {
            res.status(401).json({ error: e.message });
        }
        else {
            res.status(400).json({ error: e.message });
        }
    }
}));
// Custom **error handling** middleware
app.use((err, req, res, next) => {
    err instanceof types_1.Err ? res.status(err.kind.valueOf()).json({ error: err.message }) : next();
});
// ===========================================================================
// ============================= ROUTES ABOVE ================================
// ===========================================================================
exports.server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
// Graceful shutdown handling
process.on("SIGINT", () => {
    exports.server.close(() => {
        console.log("Shutting down server gracefully.");
        process.exit();
    });
});
