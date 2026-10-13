import { describe, expect, it } from 'vitest'
import { StationArrival } from './arrival'

describe('automatic station parking', () => {
  it('allows passing hints without opening and opens only after a settled stop', () => {
    const arrival = new StationArrival()
    expect(arrival.update('notes', 2, 7, 1, true)).toBeNull()
    expect(arrival.update('notes', 5, 0, 1, true)).toBeNull()
    expect(arrival.update('notes', 2, 0, 1, false)).toBeNull()
    expect(arrival.update('notes', 2, 0.1, 0.4, true)).toBeNull()
    expect(arrival.update('notes', 2, 0.1, 0.3, true)).toBe('notes')
    expect(arrival.update('notes', 2, 0, 10, true)).toBeNull()
  })
  it('does not reopen on dismissal until the vehicle leaves and returns', () => {
    const arrival = new StationArrival()
    arrival.suppress('about')
    expect(arrival.update('about', 0, 0, 10, true)).toBeNull()
    arrival.update(null, Infinity, 4, 1, true)
    expect(arrival.update('about', 0, 0, 0.7, true)).toBe('about')
  })
  it('requires a continuous rest and clears pending arrival on reset', () => {
    const arrival = new StationArrival()
    arrival.update('work', 1, 0, 0.5, true)
    arrival.update('work', 1, 2, 0.1, true)
    expect(arrival.update('work', 1, 0, 0.2, true)).toBeNull()
    arrival.suppress(null)
    expect(arrival.update('work', 1, 0, 0.5, true)).toBeNull()
    expect(arrival.update('work', 1, 0, 0.2, true)).toBe('work')
  })
})
