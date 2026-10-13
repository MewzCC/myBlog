type Point = { x: number; z: number }

// Independent clocks and seeded choices keep island life varied and reproducible.
export function createResidentWander(home: Point, seed: number, pace: number) {
  let randomState = seed + 1
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
    return randomState / 4294967296
  }
  let goal = { ...home },
    direction = random() * Math.PI * 2
  let until = 0,
    pauseUntil = 0,
    nextProbe = 0,
    previous: Point | null = null
  let stuckFor = 0,
    lastTime = 0,
    active = false
  const pick = (now: number, resting: boolean) => {
    const angle = random() * Math.PI * 2,
      radius = 3 + random() * 5
    goal = {
      x: Math.max(-46, Math.min(46, home.x + Math.sin(angle) * radius)),
      z: Math.max(-42, Math.min(42, home.z + Math.cos(angle) * radius)),
    }
    until = now + 10 + random() * 7
    pauseUntil = now + (resting ? 0.8 + random() * 2.2 : 0)
    nextProbe = 0
    stuckFor = 0
  }
  return {
    update(position: Point, now: number, clear: (angle: number) => boolean) {
      const dt = Math.max(0, Math.min(0.1, now - lastTime))
      lastTime = now
      if (!previous) pick(now, false)
      if (previous && active) {
        const moved = Math.hypot(position.x - previous.x, position.z - previous.z)
        stuckFor = moved < dt * pace * 0.15 ? stuckFor + dt : 0
      }
      previous = { x: position.x, z: position.z }
      const distance = Math.hypot(goal.x - position.x, goal.z - position.z)
      if (now > until || distance < 0.7 || stuckFor > 1.2) pick(now, distance < 0.7)
      active = now >= pauseUntil
      if (active && now >= nextProbe) {
        nextProbe = now + 0.3
        const desired = Math.atan2(goal.x - position.x, goal.z - position.z)
        const side = random() < 0.5 ? -1 : 1
        const candidates = [
          0,
          side * 0.65,
          -side * 0.65,
          side * 1.25,
          -side * 1.25,
          side * 2,
          Math.PI,
        ]
        const available = candidates.find((offset) => clear(desired + offset))
        if (available === undefined) {
          pick(now, true)
          active = false
        } else direction = desired + available
      }
      return {
        target: active
          ? { x: position.x + Math.sin(direction) * 2, z: position.z + Math.cos(direction) * 2 }
          : position,
        speed: active ? pace : 0,
        activity: active ? ('wandering' as const) : ('resting' as const),
      }
    },
    reset() {
      previous = null
      active = false
    },
  }
}
