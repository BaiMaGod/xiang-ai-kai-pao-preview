export const NORMAL_TIMING = Object.freeze({ aiAnalysis: 120, counterOfferDelay: 7, boss: 300 });
export const TEST_TIMING = Object.freeze({ aiAnalysis: 4, counterOfferDelay: 1.5, boss: 14 });

export const ENEMY_COST = Object.freeze({ vacuum: 1.0, courier: 1.8, dog: 2.0, drone: 2.4, shield: 3.0 });

export function spawnRateAt(t, test = false) {
  if (test) return t < 4 ? 1.7 : t < 8 ? 2.5 : 3.4;
  if (t < 60) return 0.8;
  if (t < 120) return 1.1;
  if (t < 180) return 1.5;
  if (t < 240) return 2.0;
  return 2.6;
}

export function requiredXP(level) { return 8 + level * 5; }

export function weightedDominant(samples, now) {
  const sums = { BULLET: 0, EXPLOSION: 0, EMP: 0 };
  for (const s of samples) {
    const age = Math.max(0, now - s.t);
    if (age > 60) continue;
    const w = age <= 15 ? 3 : age <= 30 ? 2 : 1;
    if (sums[s.type] !== undefined) sums[s.type] += s.amount * w;
  }
  return Object.entries(sums).sort((a,b)=>b[1]-a[1])[0][0];
}

export class RunModel {
  constructor({ test = false } = {}) { this.test = test; this.reset(); }
  reset() {
    this.time = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNeed = requiredXP(1);
    this.spawnBudget = 0;
    this.kills = 0;
    this.damageSamples = [];
    this.aiTriggered = false;
    this.counterOffered = false;
    this.counterChosen = null;
    this.rpgUnlocked = false;
    this.empUnlocked = false;
    this.bossTriggered = false;
    this.gameOver = false;
    this.victory = false;
  }
  get timing() { return this.test ? TEST_TIMING : NORMAL_TIMING; }
  tick(dt) {
    if (this.gameOver || this.victory) return [];
    this.time += dt;
    this.spawnBudget += spawnRateAt(this.time, this.test) * dt;
    this.damageSamples = this.damageSamples.filter(s => this.time - s.t <= 60);
    const events = [];
    if (!this.aiTriggered && this.time >= this.timing.aiAnalysis) {
      this.aiTriggered = true;
      events.push({ type: 'AI_ANALYSIS', dominant: weightedDominant(this.damageSamples, this.time) });
    }
    if (this.aiTriggered && !this.counterOffered && this.time >= this.timing.aiAnalysis + this.timing.counterOfferDelay) {
      this.counterOffered = true;
      events.push({ type: 'COUNTER_OFFER' });
    }
    if (!this.bossTriggered && this.time >= this.timing.boss) {
      this.bossTriggered = true;
      events.push({ type: 'BOSS' });
    }
    return events;
  }
  recordDamage(type, amount) { this.damageSamples.push({ t: this.time, type, amount }); }
  addXP(amount) {
    this.xp += amount;
    let levels = 0;
    while (this.xp >= this.xpNeed) {
      this.xp -= this.xpNeed;
      this.level += 1;
      this.xpNeed = requiredXP(this.level);
      levels += 1;
    }
    return levels;
  }
  chooseCounter(id) {
    this.counterChosen = id;
    this.rpgUnlocked = true;
    this.empUnlocked = true;
  }
  spendSpawn(cost) {
    if (this.spawnBudget + 1e-9 < cost) return false;
    this.spawnBudget -= cost;
    return true;
  }
  aiProgress() {
    if (this.aiTriggered) return 1;
    const start = this.test ? 0 : 60;
    return Math.max(0, Math.min(1, (this.time - start) / (this.timing.aiAnalysis - start)));
  }
}
