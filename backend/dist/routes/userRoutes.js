"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get('/profile', authMiddleware_1.authenticateToken, userController_1.getProfile);
exports.userRouter.get('/dashboard', authMiddleware_1.authenticateToken, userController_1.getDashboard);
//# sourceMappingURL=userRoutes.js.map