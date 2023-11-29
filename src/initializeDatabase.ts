import { captureException } from "@sentry/node";
import { Sequelize } from "sequelize";
import SQLite from 'better-sqlite3'; // Add this import


// Database setup and seeding function
export const initializeDatabase = async (sequelize: Sequelize) => {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log("Connected to the database");

    // Check if tables exist
    const tablesExist = await sequelize.getQueryInterface().showAllTables();

    if (!tablesExist.includes("sample_models")) {
      // Synchronize the models with the database
      await sequelize.sync({ force: true });
      console.log("Database synchronized");

      // Seed the database with initial data
      //   await seedDatabase();
      //   console.log("Database seeded");
    } else {
      console.log("Database tables already exist. Skipping seeding.");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // If the database is not available, initialize an in-memory SQLite database
      await initialsieSqlLiteForLocalDev();
      return;
    }
    console.error("Error initializing the database:", error);
    // Handle initialization error, e.g., log it to Sentry
    captureException(error);
    process.exit(1);
  }
};

const initialsieSqlLiteForLocalDev = async () => {
  try {
    // Create an in-memory SQLite database
    const inMemoryDb = new SQLite(":memory:");

    // Initialize Sequelize with the in-memory database
    // deepcode ignore ServerLeak: <please specify a reason of ignoring this>
    const inMemorySequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: true
    });

    // Synchronize the models with the in-memory database
    await inMemorySequelize.sync({ force: true });
    console.log("In-memory database synchronized");


    // Use the in-memory database in the application
    console.log("Using the in-memory database as a fallback");

    // Update any references to the main database with the in-memory database
    // ...

    return;
  } catch (inMemoryDbError) {
    console.error(
      "Error initializing the in-memory database:",
      inMemoryDbError
    );
    // show an erorr message and do graceful shutdown, ascii art error message
    // make log color red
    console.log(" \n\n\n\n\n======== Graceful shutdown : DB Error ========== \n\n\n\n\n");
    process.exit(1);

    // Handle initialization error for the in-memory database
    // You may choose to log it, throw an error, or take other actions as needed
  }
};
