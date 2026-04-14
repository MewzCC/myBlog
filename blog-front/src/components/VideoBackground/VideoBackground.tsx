import { useEffect, useRef } from 'react'
import './video-background.css'

export type VideoBackgroundProps = {
  videoSrc?: string
  active: boolean
  zoomScale?: number
  backgroundBlurPx?: number
  zoomBlurPx?: number
  bandEnabled?: boolean
  bandTopPx?: number
  bandRightPx?: number
  bandBottomPx?: number
  bandLeftPx?: number
  bandBlurPx?: number
  bandRadiusPx?: number
}

/**
 * VideoBackground
 *
 * - 以视频作为页面背景
 * - 背景层保持模糊（默认 0px）
 * - 鼠标位置局部显示“放大后的清晰背景”（默认放大 1.28 倍、模糊 0px）
 * - 圆心严格跟随鼠标位置
 */
export default function VideoBackground({
  videoSrc,
  active,
  zoomScale = 1.28,
  backgroundBlurPx = 10,
  zoomBlurPx = 0,
  bandEnabled = false,
  bandTopPx = 0,
  bandRightPx = 0,
  bandBottomPx = 0,
  bandLeftPx = 0,
  bandBlurPx = 10,
  bandRadiusPx = 24,
}: VideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasVideo = Boolean(videoSrc)
  
  // Use ref to track active state without triggering effect re-binds
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    // Mobile check
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    const update = () => {
      if (!isMobile) {
        // Smooth lerp for better visual quality (optional, can be removed for strict performance)
        // For strict performance requested by user, direct assignment might be better, 
        // but lerp hides jitter. Let's use direct assignment for "performance" as requested? 
        // Actually, direct assignment is faster.
        currentX = targetX
        currentY = targetY

        const tx = -currentX * (zoomScale - 1)
        const ty = -currentY * (zoomScale - 1)

        container.style.setProperty('--cursor-x', `${currentX}px`)
        container.style.setProperty('--cursor-y', `${currentY}px`)
        container.style.setProperty('--zoom-tx', `${tx}px`)
        container.style.setProperty('--zoom-ty', `${ty}px`)
      }
      
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    update()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [zoomScale])

  // Update other CSS variables when props change
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.style.setProperty('--lens-alpha', active ? '1' : '0')
    container.style.setProperty('--zoom-scale', `${zoomScale}`)
    container.style.setProperty('--bg-blur', `${backgroundBlurPx}px`)
    container.style.setProperty('--zoom-blur', `${zoomBlurPx}px`)
    container.style.setProperty('--band-alpha', bandEnabled ? '1' : '0')
    container.style.setProperty('--band-top', `${bandTopPx}px`)
    container.style.setProperty('--band-right', `${bandRightPx}px`)
    container.style.setProperty('--band-bottom', `${bandBottomPx}px`)
    container.style.setProperty('--band-left', `${bandLeftPx}px`)
    container.style.setProperty('--band-blur', `${bandBlurPx}px`)
    container.style.setProperty('--band-radius', `${bandRadiusPx}px`)
  }, [
    active,
    zoomScale,
    backgroundBlurPx,
    zoomBlurPx,
    bandEnabled,
    bandTopPx,
    bandRightPx,
    bandBottomPx,
    bandLeftPx,
    bandBlurPx,
    bandRadiusPx
  ])

  return (
    <div ref={containerRef} className="videoBackground" aria-hidden="true">
      <div className="videoBackgroundBase">
        {hasVideo ? (
          <video
            className="videoBackgroundVideo"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            src={videoSrc}
          />
        ) : null}

        {bandEnabled && hasVideo ? (
          <video
            className="videoBackgroundBand"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            src={videoSrc}
          />
        ) : null}

        <div className="videoBackgroundOverlay" />
        <div className="videoBackgroundNoise" />
      </div>

      {hasVideo ? (
        <video
          className="videoBackgroundZoom"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={videoSrc}
        />
      ) : null}
    </div>
  )
}
