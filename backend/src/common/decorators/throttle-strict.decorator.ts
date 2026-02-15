import { Throttle } from '@nestjs/throttler';


// Strict throttling for sensitive endpoints
export const ThrottleStrict = () => Throttle({ default: { limit: 3, ttl: 60000 } }); // 3 per minute

// Login throttling
export const ThrottleLogin = () => Throttle({ default: { limit: 5, ttl: 300000 } }); // 5 per 5 minutes

// OTP throttling
export const ThrottleOTP = () => Throttle({ default: { limit: 3, ttl: 600000 } }); // 3 per 10 minutes

// Password reset throttling
export const ThrottlePasswordReset = () => Throttle({ default: { limit: 3, ttl: 3600000 } }); // 3 per hour
