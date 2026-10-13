import { fireEvent, render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import DriveJoystick from './DriveJoystick'

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number
      constructor(type: string, options: PointerEventInit) {
        super(type, options)
        this.pointerId = options.pointerId || 1
      }
    },
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
const setup = () => {
  const input = vi.fn()
  const view = render(<DriveJoystick disabled={false} onInput={input} />)
  const disc = screen.getByRole('group', { name: '驾驶摇杆圆盘' })
  disc.setPointerCapture = vi.fn()
  vi.spyOn(disc, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 140,
    bottom: 140,
    width: 140,
    height: 140,
    toJSON: () => ({}),
  })
  return { input, view, disc }
}
it('uses an analog disc for forward, steering and reverse, with no direction buttons', () => {
  const { input, disc } = setup()
  expect(screen.queryByRole('button')).toBeNull()
  fireEvent.pointerDown(disc, { pointerId: 1, clientX: 70, clientY: 25 })
  expect(input).toHaveBeenLastCalledWith({ throttle: 1, steer: 0, brake: false, boost: true })
  fireEvent.pointerMove(disc, { pointerId: 1, clientX: 95, clientY: 45 })
  expect(input.mock.lastCall![0].throttle).toBeGreaterThan(0.3)
  expect(input.mock.lastCall![0].steer).toBeGreaterThan(0.3)
  fireEvent.pointerMove(disc, { pointerId: 1, clientX: 45, clientY: 95 })
  expect(input.mock.lastCall![0].throttle).toBeLessThan(-0.3)
  expect(input.mock.lastCall![0].steer).toBeLessThan(-0.3)
})
it('brakes and recenters on release, ignores other fingers and clears after braking', () => {
  const { input, disc } = setup()
  fireEvent.pointerDown(disc, { pointerId: 1, clientX: 70, clientY: 25 })
  fireEvent.pointerMove(disc, { pointerId: 2, clientX: 110, clientY: 70 })
  expect(input.mock.lastCall![0].steer).toBe(0)
  fireEvent.pointerUp(disc, { pointerId: 1 })
  expect(input.mock.lastCall![0].brake).toBe(true)
  expect(disc.querySelector('.drift__joystick-thumb')?.getAttribute('style')).toContain(
    'translate(0%, 0%)',
  )
  act(() => vi.advanceTimersByTime(800))
  expect(input.mock.lastCall![0].brake).toBe(false)
})
it('clears held input when a station preview opens and cancels cleanup timers', () => {
  const { input, disc, view } = setup()
  fireEvent.pointerDown(disc, { pointerId: 1, clientX: 70, clientY: 25 })
  view.rerender(<DriveJoystick disabled={true} onInput={input} />)
  expect(input.mock.lastCall![0].throttle).toBe(0)
  fireEvent.pointerDown(disc, { pointerId: 1, clientX: 70, clientY: 25 })
  expect(input.mock.lastCall![0].throttle).toBe(0)
  view.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
