export class ResidentLife {
  hp = 100
  lastImpact = -10
  recoveringUntil = 0
  private availableAt = 0

  impact(speed: number, now: number) {
    if (!Number.isFinite(speed) || speed < 1.2 || this.hp === 0 || now < this.availableAt)
      return null
    const damage = Math.min(this.hp, Math.min(40, Math.max(8, Math.round(speed * 2.5))))
    this.hp -= damage
    this.lastImpact = now
    this.availableAt = now + 0.7
    if (this.hp === 0) this.recoveringUntil = now + 12
    return damage
  }

  tick(now: number) {
    if (this.hp !== 0 || now < this.recoveringUntil) return false
    this.hp = 100
    this.recoveringUntil = 0
    this.availableAt = now + 1
    return true
  }
}
