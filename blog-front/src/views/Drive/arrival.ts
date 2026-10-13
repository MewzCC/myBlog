import type { StationId } from './island'

/** Open once per visit, after resting inside a station's parking pad. */
export class StationArrival {
  private shown: StationId | null = null
  private candidate: StationId | null = null
  private resting = 0

  suppress(id: StationId | null) {
    this.shown = id
    this.candidate = null
    this.resting = 0
  }

  update(id: StationId | null, distance: number, speed: number, dt: number, parked: boolean) {
    if (id !== this.shown) this.shown = null
    if (!id || distance > 3.8 || speed > 0.45 || !parked) {
      this.candidate = null
      this.resting = 0
      return null
    }
    if (this.shown === id) return null
    if (this.candidate !== id) {
      this.candidate = id
      this.resting = 0
    }
    this.resting += dt
    if (this.resting < 0.65) return null
    this.suppress(id)
    return id
  }
}
