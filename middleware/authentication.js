const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");
const auth = async (req, res, next) => {
  const authHEader = req.headers.authorization;
  if (!authHEader || !authHEader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHEader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //attach user to job routes
    const user = await User.findById(payload.userId).select("-password");
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};
module.exports = auth;
