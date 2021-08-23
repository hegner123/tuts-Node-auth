import { randomBytes } from "crypto";

export async function createSession(userId, connection) {
  try {
    //Generate Session token
    const sessionToken = randomBytes(42).toString("hex");
    //Retrive Connection Information
    const { ip, userAgent } = connection;
    //database insert for session
    const { session } = await import("../session/session.js");
    await session.insertOne({
      sessionToken,
      userId,
      valid: true,
      userAgent,
      ip,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    //Return Session Token
    return sessionToken;
  } catch (e) {
    throw new Error("session creation failed");
  }
}
