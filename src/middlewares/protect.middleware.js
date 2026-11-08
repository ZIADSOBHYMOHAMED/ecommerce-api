const { verifyToken } = require("../utils/jwt.util");
const UserRepository = require("../repositories/user.repository");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "fail",
        message: "Access failed. No token provided or wrong format",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Token is missing",
      });
    }

    const decoded = verifyToken(token);

    const userId = decoded.id || decoded.userId;
    const currentUser = await UserRepository.findUserById(userId);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    req.user = currentUser;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;
