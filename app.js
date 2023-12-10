require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

//security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

//swagger
const swagger = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDoc = YAML.load("./swagger.yaml");

//connectdb
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");
//routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
const tripsRouter = require("./routes/trips");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// extra packages
app.set("trust proxy", 1);
app.use(rateLimiter());
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());

// app.get("/", (req, res) => {
//   res.send("<h1>Trips API</h1><a href='/api-docs'>Documentation</a>");
// });
app.use(express.static("public"));
app.use("/api-docs", swagger.serve, swagger.setup(swaggerDoc));
// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);
app.use("/api/v1/trips", authenticateUser, tripsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3009;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port a  ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
