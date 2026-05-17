class TokenBucket {
  constructor({ capacity, refillPerSecond }) {
    if (!Number.isFinite(capacity) || capacity <= 0) {
      throw new Error('TokenBucket capacity must be a positive number');
    }
    if (!Number.isFinite(refillPerSecond) || refillPerSecond <= 0) {
      throw new Error('TokenBucket refillPerSecond must be a positive number');
    }
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.buckets = new Map();
  }

  tryConsume(key, tokens = 1) {
    const now = Date.now();
    const entry = this.buckets.get(key) || { tokens: this.capacity, last: now };
    const elapsedSeconds = (now - entry.last) / 1000;
    entry.tokens = Math.min(this.capacity, entry.tokens + elapsedSeconds * this.refillPerSecond);
    entry.last = now;
    if (entry.tokens >= tokens) {
      entry.tokens -= tokens;
      this.buckets.set(key, entry);
      return true;
    }
    this.buckets.set(key, entry);
    return false;
  }

  reset(key) {
    this.buckets.delete(key);
  }
}

module.exports = TokenBucket;
