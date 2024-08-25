# email-sending-service

# Resilient Email-Sending Service

This project is a resilient email-sending service implemented in JavaScript. It uses two mock email providers and incorporates features like retry logic with exponential backoff, a fallback mechanism to switch providers on failure, idempotency to prevent duplicate sends, rate limiting, status tracking, a circuit breaker pattern, simple logging, and a basic queue system.

## Features

- **Retry Mechanism**: Retries sending emails with exponential backoff in case of failure.
- **Fallback Between Providers**: Switches to another email provider if the current one fails.
- **Idempotency**: Prevents sending duplicate emails.
- **Rate Limiting**: Limits the number of emails sent per minute to prevent overloading.
- **Status Tracking**: Tracks the status of each email sending attempt.
- **Circuit Breaker Pattern**: Stops sending emails after a set number of failures and waits for a cooldown period.
- **Simple Logging**: Logs the status and errors of email-sending attempts.
- **Basic Queue System**: Queues emails that are blocked by rate limiting and processes them when possible.

## Setup Instructions

### Prerequisites

- **Node.js**: You need to have Node.js installed on your machine. If you don't have Node.js installed, you can download it from [Node.js official website](https://nodejs.org/).

### Installation

1. **Clone the Repository** (if applicable):

   ```bash
   git clone https://github.com/yourusername/email-sending-service.git
   cd email-sending-service
