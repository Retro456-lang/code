"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = require("./routes/authRoutes");
const userRoutes_1 = require("./routes/userRoutes");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use('/api/auth', authRoutes_1.authRouter);
exports.app.use('/api/user', userRoutes_1.userRouter);
// Health check endpoint
exports.app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});
//# sourceMappingURL=app.js.map