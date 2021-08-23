import "./env.js";
import fastify from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import { registerUser } from "./accounts/register.js";
import { authorizeUser } from "./accounts/authorize.js";
import { logUserIn } from "./accounts/logUserIn.js";
import { logUserOut } from "./accounts/logUserOut.js";
import { getUserFromCookies } from "./accounts/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

async function startApp() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
    });

    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    });

    app.post("/api/register", {}, async (request, reply) => {
      try {
        const userId = await registerUser(
          request.body.email,
          request.body.password
        );
      } catch (e) {
        console.error(e);
      }
    });

    app.post("/api/authorize", {}, async (request, reply) => {
      try {
        console.log(request.body.email, request.body.password);
        const { isAuthorized, userId } = await authorizeUser(
          request.body.email,
          request.body.password
        );
        if (isAuthorized) {
          await logUserIn(userId, request, reply);
          reply.send({
            data: "User Logged In",
          });
        }
      } catch (e) {
        console.error(e);
        reply.send({
          data: e,
        });
      }
    });

    app.post("/api/logout", {}, async (request, reply) => {
      try {
        await logUserOut(request, reply);
        reply.send({ data: "User Logged Out" });
      } catch (e) {
        console.error(e);
      }
    });

    app.get("/test", {}, async (request, reply) => {
      try {
        const user = await getUserFromCookies(request, reply);
        // return userEmail if it exists, otherwise return unauthorized
        if (user?._id) {
          reply.send({
            data: user,
          });
        } else {
          reply.send({
            data: "User Not Found",
          });
        }
      } catch (error) {
        throw new Error(error);
      }
      //verify user login
    });

    await app.listen(3000);
    console.log("Server ⬆️  and 🏃 on port: 3000!\n");
  } catch (e) {
    console.log(e);
  }
}
connectDb().then(() => {
  startApp();
});
