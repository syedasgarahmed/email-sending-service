class MockEmailProvider {
constructor(name) {
this.name = name;
this.failureRate = 0.3; // 30% chance to fail
}  
async sendEmail(email) {
return new Promise((resolve, reject) => {
const success = Math.random() > this.failureRate;
setTimeout(() => {
if (success) {
resolve(`Email sent via ${this.name}`);
} else {
reject(new Error(`Failed to send email via ${this.name}`));
}
}, 100); // Simulate network delay
});
}
}
const provider1 = new MockEmailProvider("Provider1");
const provider2 = new MockEmailProvider("Provider2");
class EmailService {
    constructor(providers) {
      this.providers = providers;
      this.currentProviderIndex = 0;
      this.sentEmails = new Set(); // For idempotency
      this.rateLimit = 5; // Max emails per minute
      this.sentCount = 0;
      this.queue = [];
      this.lastSentTime = Date.now();
      this.statusTracker = {}; // To track the status of each email
      this.isCircuitOpen = false;
      this.failureCount = 0;
      this.failureThreshold = 3; // Threshold to open circuit
      this.circuitResetTimeout = 10000; // 10 seconds
    }
isRateLimited() {
const currentTime = Date.now();
if (this.sentCount >= this.rateLimit && (currentTime - this.lastSentTime) < 60000) {
return true;
}
if ((currentTime - this.lastSentTime) >= 60000) {
this.sentCount = 0; // Reset counter after a minute
this.lastSentTime = currentTime;
}
return false;
}
isDuplicate(email) {
return this.sentEmails.has(email.id);
}
shouldOpenCircuit() {
return this.failureCount >= this.failureThreshold;
}
async send(email) {
if (this.isRateLimited()) {
this.queue.push(email); // Queue the email if rate-limited
return this.trackStatus(email.id, "queued");
}
if (this.isDuplicate(email)) {
return this.trackStatus(email.id, "duplicate");
}
if (this.isCircuitOpen) {
return this.trackStatus(email.id, "circuit_open");
}
this.sentEmails.add(email.id);
let attempt = 0;
let maxAttempts = 3;
let delay = 500;
while (attempt < maxAttempts) {
try {
const provider = this.providers[this.currentProviderIndex];
const result = await provider.sendEmail(email);
this.trackStatus(email.id, "success", result);
this.sentCount++;
this.failureCount = 0; // Reset failure count on success
return result;
} catch (error) {
this.trackStatus(email.id, "failure", error.message);
this.failureCount++;
if (this.shouldOpenCircuit()) {
this.openCircuit();
return this.trackStatus(email.id, "circuit_open");
}
await this.sleep(delay);
delay *= 2; // Exponential backoff
this.switchProvider();
}
attempt++;
}
this.trackStatus(email.id, "failed");
}
switchProvider() {
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    }
  
    // Sleep function for delay
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    // Open the circuit for a specific timeout period
    openCircuit() {
      this.isCircuitOpen = true;
      setTimeout(() => {
        this.isCircuitOpen = false;
        this.failureCount = 0; // Reset after circuit closes
      }, this.circuitResetTimeout);
    }
  
    // Status tracking
    trackStatus(emailId, status, message = "") {
      this.statusTracker[emailId] = { status, message };
      console.log(`Email ID: ${emailId}, Status: ${status}, Message: ${message}`);
    }
  
    // Basic queue processing (could be expanded to use setInterval or a job queue)
    processQueue() {
      while (!this.isRateLimited() && this.queue.length > 0) {
        const email = this.queue.shift();
        this.send(email);
      }
    }
  }
  
  // Example usage of EmailService
  (async () => {
    const emailService = new EmailService([provider1, provider2]);
  
    const email1 = { id: "1", to: "user1@example.com", subject: "Hello", body: "Hello User1" };
    const email2 = { id: "2", to: "user2@example.com", subject: "Hello", body: "Hello User2" };
  
    await emailService.send(email1);
    await emailService.send(email2);
  
    console.log(emailService.statusTracker);
  
    // Process any emails that are in the queue due to rate limiting
    emailService.processQueue();
  })();
  
