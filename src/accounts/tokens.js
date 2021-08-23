import jwt from "jsonwebtoken";

const JWTSgnature = process.env.JWT_SECRET;

export async function createTokens(sessionToken, userId) {
  try {
    // Create Refresh tokens
    // Needs Session Id
    const refreshToken = jwt.sign({ sessionToken }, JWTSgnature);
    // Create Access Token
    // Session ID, User Id
    const accessToken = jwt.sign({ sessionToken, userId }, JWTSgnature);
    // Return Refresh Token and Access Token

    return { refreshToken, accessToken };
  } catch (error) {}
  console.error(error);
}
