const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// For users authoraization
async function authUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Please login to continue" });
  }
}

// For admin authorization
async function authAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Please login to continue" });
  }
}

module.exports = {
  authUser,
  authAdmin,
};
