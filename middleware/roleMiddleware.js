// middleware/roleMiddleware.js
/**
 * Restrict route access to specific user roles.
 * Usage: router.get("/admin", role(["admin"]), handler);
 *
 * @param {string[]} allowedRoles
 */
const role =
  (allowedRoles = []) =>
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  (req, res, next) => {
    // authMiddleware should already have attached req.user
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

export default role;
