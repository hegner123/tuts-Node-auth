import jwt from "jsonwebtoken";
const JWTSignature = process.env.JWT_SECRET;
export async function logUserOut(request, reply) {
  try {
    const { session } = await import("../session/session.js");
    //Get Refresh Token
    if (request?.cookies?.refreshToken) {
      //if refresh token
      const { refreshToken } = request.cookies;

      //decode refresh token
      // Decode sessionToken from refreshToken
      const { sessionToken } = jwt.verify(refreshToken, JWTSignature);

      //look up session
      // Delete Session
      await session.deleteOne({ sessionToken });
      //Remove Cookies
      reply.clearCookie("refreshToken").clearCookie("accessToken");
    }
  } catch (error) {
    console.error(error);
  }
}
