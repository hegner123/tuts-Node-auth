import mongo from "mongodb";
import jwt from "jsonwebtoken";
import { createTokens } from "./tokens.js";

const { ObjectId } = mongo;
const JWTSignature = process.env.JWT_SECRET;
//function
export async function getUserFromCookies(request, reply) {
  try {
    const { user } = await import("../user/user.js");
    const { session } = await import("../session/session.js");
    //check to make sure access token exists
    if (request?.cookies?.accessToken) {
      //if access token
      const { accessToken } = request.cookies;
      //decode access token
      const decodedAccessToken = jwt.verify(accessToken, JWTSignature);

      return user.findOne({
        _id: ObjectId(decodedAccessToken?.userId),
      });
    }
    if (request?.cookies?.refreshToken) {
      //if refresh token
      const { refreshToken } = request.cookies;

      //decode refresh token
      const { sessionToken } = jwt.verify(refreshToken, JWTSignature);

      //look up session
      const currentSession = await session.findOne({ sessionToken });
      //confirm session is valid
      if (currentSession.valid) {
        //if session is valid look up user
        const currentUser = await user.findOne({
          _id: ObjectId(currentSession.userId),
        });
        //refresh tokens
        await refreshTokens(sessionToken, currentUser._id, reply);
        // return current user
        return currentUser;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export async function refreshTokens(sessionToken, userId, reply) {
  try {
    const { accessToken, refreshToken } = await createTokens(
      sessionToken,
      userId
    );
    // Set Cookie
    const now = new Date();
    //Get date, 30 days in the future
    const refreshExpires = now.setDate(now.getDate() + 30);
    reply
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        domain: "localhost",
        httpOnly: true,
        expires: refreshExpires,
      })
      .setCookie("accessToken", accessToken, {
        path: "/",
        domain: "localhost",
        httpOnly: true,
      });
  } catch (error) {
    console.error(error);
  }
}
