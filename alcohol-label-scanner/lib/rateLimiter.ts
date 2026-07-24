type Resolver = () => void;

const MAX_CONCURRENT = 2;
export const MAX_QUEUE_SIZE = 10;
const REQUEST_TIMEOUT_MS = 10000;
const THROTTLE_DELAY_MS = 1000;

let activeRequests = 0;
const queue: Resolver[] = [];

/**
 * Custom Error class for Rate Limiting
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Acquires a slot for execution. If no slots are available, waits in queue.
 * Throws RateLimitError if queue is full.
 */
async function acquireSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    return;
  }

  if (queue.length >= MAX_QUEUE_SIZE) {
    throw new RateLimitError("Server batch queue full. Please retry in a few seconds.");
  }

  return new Promise<void>((resolve) => {
    queue.push(resolve);
  });
}

/**
 * Releases a slot after execution. 
 * Enforces a mandatory delay before the next item in queue can proceed.
 */
async function releaseSlot(): Promise<void> {
  // Enforce mandatory delay to maintain safe RPM
  await new Promise((r) => setTimeout(r, THROTTLE_DELAY_MS));

  const next = queue.shift();
  if (next) {
    next();
  } else {
    activeRequests--;
  }
}

/**
 * Wraps an async function with concurrency control, timeout, and rate limiting.
 */
export async function withRateLimit<T>(task: () => Promise<T>): Promise<T> {
  await acquireSlot();

  try {
    // Wrap task in a timeout guard
    const result = await Promise.race([
      task(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API request timed out.")), REQUEST_TIMEOUT_MS)
      ),
    ]);
    return result;
  } finally {
    // Guaranteed release with delay
    releaseSlot();
  }
}
