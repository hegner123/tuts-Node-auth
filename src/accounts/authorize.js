import bcrypt from "bcryptjs";
const { compare } = bcrypt;

export async function authorizeUser(email, password) {
  //import user collection
  const { user } = await import("../user/user.js");
  //Find User
  const userData = await user.findOne({ "email.address": email });

  //Get User Password
  const savedPassword = userData.password;
  //Compare Password
  const isAuthorized = await compare(password, savedPassword);
  //Return boolean value for compare
  return { isAuthorized, userId: userData._id };
}
