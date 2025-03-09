import express from "express";
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

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST = process.env.IP || "127.0.0.1";

// ===========================================================================
// ============================= ROUTES BELOW ================================
// ===========================================================================

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
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
