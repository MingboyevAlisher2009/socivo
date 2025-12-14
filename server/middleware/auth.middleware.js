import { verifyToken } from "../services/token.service.js";

const AuthMiddleware = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const data = verifyToken(token);

  if (data instanceof Error) {
    return res.status(401).json({ error: "Invalid token" });
  }
  req.userId = data.userId;
  next();
};

export default AuthMiddleware;
