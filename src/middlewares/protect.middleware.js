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

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.id || decoded.userId;
    const currentUser = await UserRepository.findUserById(userId);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    // Added: Prevent disabled accounts from continuing to use previously issued tokens.
    if (!currentUser.is_active) {
      return res.status(401).json({
        status: "fail",
        message: "The user account is inactive",
      });
    }

    req.user = currentUser;

    next();
  } catch (error) {
    // Updated: Let repository/database failures reach Express error handling instead of disguising them as bad tokens.
    return next(error);
  }
};

module.exports = protect;
