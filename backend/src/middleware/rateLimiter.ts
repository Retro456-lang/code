import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins timer
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {error: "too many login attempts. try again later."},

    keyGenerator: (req) => {
        const email = (req.body?.email || '').toString().trim().toLowerCase();
        return `${req.ip}:${email}`;
    }
})