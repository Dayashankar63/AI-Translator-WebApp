const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");


  if (!token) {
    return res.status(401).json("Access denied");
  }

  try {
    // Extract token from "Bearer <token>" format
    const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json("Invalid token");
  }
};