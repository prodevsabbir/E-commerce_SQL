import rateLimit from "express-rate-limit";

/**
 * Generic rate limiter factory.
 * @param windowMinutes - Rolling window in minutes
 * @param maxRequests  - Max requests allowed in the window
 */
export const rateLimiter = (windowMinutes: number, maxRequests: number) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        standardHeaders: true,  // Return rate-limit info in `RateLimit-*` headers
        legacyHeaders: false,   // Disable `X-RateLimit-*` headers
        handler: (_req, res) => {
            res.status(429).json({
                success: false,
                message: `Too many requests. Please try again after ${windowMinutes} minute(s).`,
            });
        },
    });
};

// ─── Named presets ────────────────────────────────────────────────────────────

/** Auth endpoints (login, register) – 5 req / 15 min (brute-force protection) */
export const authLimiter = rateLimiter(15, 5);

/** Read endpoints (GET) – 100 req / 15 min */
export const readLimiter = rateLimiter(15, 100);

/** Create endpoints (POST) – 20 req / 10 min */
export const createLimiter = rateLimiter(10, 20);

/** Update endpoints (PATCH/PUT) – 30 req / 10 min */
export const updateLimiter = rateLimiter(10, 30);

/** Delete endpoints (DELETE) – 20 req / 10 min */
export const deleteLimiter = rateLimiter(10, 20);
