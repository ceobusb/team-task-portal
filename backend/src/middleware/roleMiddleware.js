const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Kullanici bilgisi bulunamadi",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bu islem icin yetkiniz yok",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
