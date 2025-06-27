"use server";

import { db } from "../lib/db";

export async function testConnection() {
  try {
    console.log("🔄 Testing database connection...");

    const result = await db.execute(
      "SELECT NOW() as current_time, version() as version"
    );

    console.log("✅ Database connected successfully");
    console.log("Database info:", result[0]);

    return {
      success: true,
      message: "Database connected successfully!",
      data: result[0],
    };
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return {
      success: false,
      message: `Connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
