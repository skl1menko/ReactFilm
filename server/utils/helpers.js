// Утилиты для работы с задержками и контролем скорости запросов

export class RateLimiter {
  constructor(delayMs = 100) {
    this.delayMs = delayMs;
    this.lastRequestTime = 0;
  }

  async wait() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

export class BatchProcessor {
  constructor(batchSize = 5, delayBetweenBatches = 500) {
    this.batchSize = batchSize;
    this.delayBetweenBatches = delayBetweenBatches;
  }

  async process(items, processor) {
    const results = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      console.log(`Обрабатываем пачку ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(items.length/this.batchSize)} (элементы ${i+1}-${Math.min(i+this.batchSize, items.length)})`);
      
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      
      results.push(...batchResults);
      
      // Пауза между пачками
      if (i + this.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
      }
    }
    
    return results;
  }
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retryWithDelay = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Попытка ${attempt} неудачна, повторяем через ${delayMs}мс...`);
      await delay(delayMs);
      delayMs *= 2; // Экспоненциальная задержка
    }
  }
};