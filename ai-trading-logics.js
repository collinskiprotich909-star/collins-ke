// AI-Powered Matches & Differs Trading Engine
class DerivAITrader {
  constructor() {
    this.market = 'R_100'; // Volatility 100 Index
    this.stake = 0.10;
    this.duration = 5;
    this.minConfidence = 10.5; // % threshold
    this.historySize = 15;
    this.lastDigits = [];
    this.consecutiveLosses = 0;
    this.maxLossStreak = 2;
  }

  // Collect recent tick data
  addTick(digit) {
    this.lastDigits.push(digit);
    if (this.lastDigits.length > this.historySize) {
      this.lastDigits.shift();
    }
  }

  // Analyze: frequency, patterns, streaks
  analyzeSignal() {
    if (this.lastDigits.length < 10) {
      return { ready: false, reason: 'Collecting data...' };
    }

    // Count digit frequencies
    const counts = Array(10).fill(0);
    this.lastDigits.forEach(d => counts[d]++);
    
    // Calculate percentages
    const total = this.lastDigits.length;
    const percentages = counts.map(c => (c / total) * 100);
    
    // Find best digit
    let bestDigit = 0;
    let bestPercent = percentages[0];
    for (let i = 1; i < 10; i++) {
      if (percentages[i] > bestPercent) {
        bestPercent = percentages[i];
        bestDigit = i;
      }
    }

    // Check for streaks & patterns
    const streak = this.getStreak();
    const mode = this.determineMode(bestDigit, bestPercent, streak);
    const entryReady = bestPercent >= this.minConfidence;
    const canTrade = this.consecutiveLosses < this.maxLossStreak;

    return {
      ready: entryReady && canTrade,
      mode: mode, // 'matches' | 'differs' | 'even' | 'odd' | 'rise' | 'fall'
      digit: bestDigit,
      confidence: bestPercent.toFixed(1),
      stake: this.stake,
      duration: this.duration,
      canTrade: canTrade,
      reason: entryReady 
        ? `Signal strong: ${bestDigit} @ ${bestPercent.toFixed(1)}%` 
        : `Waiting: highest ${bestPercent.toFixed(1)}% < ${this.minConfidence}%`
    };
  }

  // Detect streak patterns
  getStreak() {
    if (this.lastDigits.length < 3) return null;
    let streakDigit = this.lastDigits.at(-1);
    let streakLength = 1;
    for (let i = this.lastDigits.length - 2; i >= 0; i--) {
      if (this.lastDigits[i] === streakDigit) streakLength++;
      else break;
    }
    return { digit: streakDigit, length: streakLength };
  }

  // Choose trading mode
  determineMode(bestDigit, bestPercent, streak) {
    // Even/Odd logic
    const evenCount = this.lastDigits.filter(d => d % 2 === 0).length;
    const oddCount = this.lastDigits.length - evenCount;
    const evenPct = (evenCount / this.lastDigits.length) * 100;
    const oddPct = 100 - evenPct;

    if (streak && streak.length >= 3) {
      // Contrary betting on long streaks
      return streak.digit % 2 === 0 ? 'odd' : 'even';
    }
    if (bestPercent > 11.0) return 'matches';
    if (bestPercent < 8.5) return 'differs';
    if (evenPct > 58) return 'even';
    if (oddPct > 58) return 'odd';
    return 'matches'; // default
  }

  recordResult(win) {
    if (win) this.consecutiveLosses = 0;
    else this.consecutiveLosses++;
  }
}

export default DerivAITrader;
