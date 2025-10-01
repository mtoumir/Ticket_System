import { Request, Response, NextFunction } from "express";

const checkRole = (...allowedRoles: ("ADMIN" | "AGENT" | "USER")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.role) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!allowedRoles.includes(req.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};

export default checkRole;