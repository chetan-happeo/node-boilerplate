// src/index.ts

import "reflect-metadata";
import * as Sentry from "@sentry/node";
import { Integrations } from "@sentry/tracing";
import { Logger, initTracer } from "jaeger-client";
import { InversifyExpressServer } from "inversify-express-utils";
import * as express from "express";
import * as bodyParser from "body-parser";
import swaggerJSDoc from "swagger-jsdoc";
import * as swaggerUI from "swagger-ui-express";
import { Container } from "inversify";
import * as bunyan from 'bunyan';
import { SampleController } from "./controllers/SampleController";
import { SampleService } from "./services/SampleService";
import { FORMAT_HTTP_HEADERS } from "opentracing";
import { initializeDatabase } from "./initializeDatabase";
import "dotenv/config";
import { sequelize } from "./sequelize";

if (process.env.NODE_ENV === "production") {
  // Initialize Sentry
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN", // Replace with your DSN
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Integrations.Express({ app: express.application }),
    ],
    tracesSampleRate: 1.0, // Sample 100% of transactions for demonstration purposes
  });
}


// Initialize Jaeger
const jaegerConfig = {
  serviceName: "your-service-name",
  reporter: {
    agentHost: "localhost",
    agentPort: 6832,
  },
  sampler: {
    type: "const",
    param: 1,
  },
};

// Logger configuration
const logger = bunyan.createLogger({
    name: 'your-app-name', // Replace with your app name
    level: process.env.LOG_LEVEL as bunyan.LogLevel || 'info',  // Default to 'info' if LOG_LEVEL is not set
  });

const container = new Container();
container.bind<Logger>("Logger").toConstantValue(logger);
container.bind<SampleController>(SampleController).toSelf();
container.bind<SampleService>(SampleService).toSelf();

const server = new InversifyExpressServer(container as any);


// Initialize Jaeger
const jaegerTracer = initTracer(jaegerConfig, {});




// Swagger configuration
const swaggerDefinition = {
  info: {
    title: "My Node Boilerplate API",
    version: "1.0.0",
    description: "Documentation for My Node Boilerplate API",
  },
  basePath: "/api",
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/controllers/*.ts"], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

server.setConfig((app) => {
  app.use(bodyParser.json());

  // Serve Swagger UI
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  // Sentry request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // OpenTracing middleware
  app.use((req, res, next) => {
    const parentSpanContext = jaegerTracer.extract(
        FORMAT_HTTP_HEADERS,
      req.headers
    );
    const span = jaegerTracer.startSpan(req.path, {
      childOf: parentSpanContext || undefined,
    });
    // add span to request locals for handlers to use
    res.locals.span = span;

    // Inject the trace context into the response headers
    jaegerTracer.inject(span, FORMAT_HTTP_HEADERS, res.locals);

    res.on("finish", () => {
      span.finish();
    });

    next();
  });
});

const app = server.build();
const PORT = process.env.PORT || 3000;

logger.info("Initializing the database");
initializeDatabase(sequelize);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Sentry error handler must be the last middleware on the app
app.use(Sentry.Handlers.errorHandler());

// Log unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  throw err;
});
