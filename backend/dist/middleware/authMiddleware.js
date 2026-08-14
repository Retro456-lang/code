"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticateToken = (req, res, next) => {
    // Step 1: Extract Authorization header ('Bearer <token>')
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access token missing or invalid' });
        return;
    }
    try {
        // Step 2: Verify token signature
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        // Step 3: Attach user payload to request
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Token is invalid or expired' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=authMiddleware.js.map