"use strict";
// Centralized rate limiting with automatic cleanup
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionRateLimiter = exports.verificationRateLimiter = exports.smsRateLimiter = void 0;
var RateLimiter = /** @class */ (function () {
    function RateLimiter(maxAttempts, windowMs, maxCacheSize) {
        if (maxCacheSize === void 0) { maxCacheSize = 1000; }
        this.cache = new Map();
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.maxCacheSize = maxCacheSize;
    }
    RateLimiter.prototype.check = function (identifier) {
        var now = Date.now();
        // Cleanup if cache is getting too large
        if (this.cache.size > this.maxCacheSize) {
            this.cleanup(now);
        }
        var entry = this.cache.get(identifier);
        if (!entry || now > entry.resetTime) {
            // Create new entry or reset expired one
            var newEntry = {
                attempts: 1,
                resetTime: now + this.windowMs,
                lastAttempt: now,
            };
            this.cache.set(identifier, newEntry);
            console.debug("[RateLimiter] New window started", __assign({ identifier: identifier }, newEntry));
            return { allowed: true, resetTime: newEntry.resetTime };
        }
        if (entry.attempts >= this.maxAttempts) {
            console.debug("[RateLimiter] Blocked request", { identifier: identifier, attempts: entry.attempts, resetTime: entry.resetTime });
            return { allowed: false, resetTime: entry.resetTime };
        }
        entry.attempts++;
        entry.lastAttempt = now;
        console.debug("[RateLimiter] Allowed request", { identifier: identifier, attempts: entry.attempts, resetTime: entry.resetTime });
        return { allowed: true, resetTime: entry.resetTime };
    };
    RateLimiter.prototype.reset = function (identifier) {
        this.cache.delete(identifier);
    };
    RateLimiter.prototype.cleanup = function (now) {
        for (var _i = 0, _a = Array.from(this.cache.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], entry = _b[1];
            if (now > entry.resetTime) {
                this.cache.delete(key);
                console.debug("[RateLimiter] Cleaned up expired entry", { identifier: key });
            }
        }
    };
    RateLimiter.prototype.getStats = function () {
        return {
            cacheSize: this.cache.size,
            maxCacheSize: this.maxCacheSize,
        };
    };
    return RateLimiter;
}());
// Pre-configured rate limiters
exports.smsRateLimiter = new RateLimiter(3, 60 * 1000); // 3 attempts per minute
exports.verificationRateLimiter = new RateLimiter(5, 5 * 60 * 1000); // 5 attempts per 5 minutes
exports.submissionRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 submissions per hour
