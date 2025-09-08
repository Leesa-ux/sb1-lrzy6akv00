import { smsRateLimiter, verificationRateLimiter, submissionRateLimiter } from "../lib/rate-limiter";

async function simulateRequests(limiterName: string, limiter: any, identifier: string, attempts: number, delayMs?: number) {
  console.log(`\\n--- Testing ${limiterName} with ${attempts} attempts${delayMs ? " and delay " + delayMs + "ms" : ""} ---`);
  
  for (let i = 1; i <= attempts; i++) {
    const result = limiter.check(identifier);
    console.log(`[${limiterName}] Attempt ${i}:`, result);
    if (delayMs) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

async function run() {
  // Test SMS limiter: 3 per minute
  await simulateRequests("smsRateLimiter", smsRateLimiter, "user1", 5);
  
  // Test verification limiter: 5 per 5 mins
  await simulateRequests("verificationRateLimiter", verificationRateLimiter, "user2", 6);
  
  // Test submission limiter (hourly) with spacing
  await simulateRequests("submissionRateLimiter", submissionRateLimiter, "user3", 4, 200);
  
  // Test reset after TTL expiration (simulate sms limiter expiry)
  console.log("\\n--- Waiting for SMS limiter window to expire (65 seconds) ---");
  await new Promise(res => setTimeout(res, 65000));
  await simulateRequests("smsRateLimiter POST-EXPIRY", smsRateLimiter, "user1", 2);
}

run().catch(err => {
  console.error("Error during simulation:", err);
});