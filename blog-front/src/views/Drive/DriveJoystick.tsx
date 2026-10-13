import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { DriveInput } from './island'

const neutral: DriveInput = { throttle: 0, steer: 0, brake: false, boost: false }

export default function DriveJoystick({
  disabled,
  onInput,
}: {
  disabled: boolean
  onInput: (input: DriveInput) => void
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const pointer = useRef<number | null>(null)
  const brakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callback = useRef(onInput)
  callback.current = onInput
  const clearTimer = () => {
    if (brakeTimer.current) clearTimeout(brakeTimer.current)
    brakeTimer.current = null
  }
  useEffect(() => {
    if (disabled) {
      clearTimer()
      pointer.current = null
      setPosition({ x: 0, y: 0 })
      callback.current(neutral)
    }
  }, [disabled])
  useEffect(() => {
    const reset = () => {
      pointer.current = null
      setPosition({ x: 0, y: 0 })
      clearTimer()
      callback.current(neutral)
    }
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    return () => {
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      clearTimer()
      callback.current(neutral)
    }
  }, [])
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || pointer.current !== event.pointerId) return
    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const radius = bounds.width * 0.32
    let x = (event.clientX - bounds.left - bounds.width / 2) / radius
    let y = (event.clientY - bounds.top - bounds.height / 2) / radius
    const length = Math.hypot(x, y)
    if (length > 1) {
      x /= length
      y /= length
    }
    setPosition({ x, y })
    const axis = (value: number) =>
      Math.abs(value) < 0.12 ? 0 : (value - Math.sign(value) * 0.12) / 0.88
    callback.current({ steer: axis(x), throttle: -axis(y), brake: length < 0.12, boost: y < -0.92 })
  }
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return
    pointer.current = null
    setPosition({ x: 0, y: 0 })
    callback.current({ ...neutral, brake: true })
    clearTimer()
    brakeTimer.current = setTimeout(() => callback.current(neutral), 800)
  }
  return (
    <div className="drift__touch">
      <div
        className={`drift__joystick${pointer.current !== null ? ' drift__joystick--active' : ''}`}
        role="group"
        aria-label="驾驶摇杆圆盘"
        aria-describedby="drift-joystick-help"
        aria-disabled={disabled}
        tabIndex={0}
        onPointerDown={(event) => {
          if (disabled || pointer.current !== null) return
          clearTimer()
          pointer.current = event.pointerId
          event.currentTarget.setPointerCapture(event.pointerId)
          move(event)
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span className="drift__joystick-north" aria-hidden="true">
          ↑
        </span>
        <span className="drift__joystick-west" aria-hidden="true">
          ←
        </span>
        <span className="drift__joystick-east" aria-hidden="true">
          →
        </span>
        <span className="drift__joystick-south" aria-hidden="true">
          ↓
        </span>
        <span
          className="drift__joystick-thumb"
          style={{ transform: `translate(${position.x * 100}%, ${position.y * 100}%)` }}
          aria-hidden="true"
        >
          ✳
        </span>
      </div>
      <span id="drift-joystick-help" className="drift__joystick-help">
        推杆驾驶 · 松手刹车
      </span>
    </div>
  )
}
