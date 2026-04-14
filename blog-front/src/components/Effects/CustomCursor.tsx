import { useEffect, useRef, useState } from 'react'
import cursorImg from '../../assets/img/02.cur'
import './custom-cursor.css'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  // const { enableSakura } = useSettingsStore()
  
  // Mobile check
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768

  useEffect(() => {
    if (isMobile) return

    document.body.classList.add('custom-cursor-active')
    
    // 鼠标移动处理（带节流）
    let rafId: number
    let targetX = -100
    let targetY = -100
    let isTicking = false

    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      }
      isTicking = false
    }

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      
      if (!isTicking) {
        rafId = requestAnimationFrame(updatePosition)
        isTicking = true
      }
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check for interactive elements
      const isClickable = target.matches('a, button, [role="button"], input, select, label, .pointer') || 
                          target.closest('a, button, [role="button"], .pointer')
      setIsHovering(!!isClickable)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })

    // Initial check
    if (cursorRef.current) {
      cursorRef.current.style.display = 'block'
    }

    // Force initial visibility if mouse position is known (though we don't know it yet)
    // We can rely on first mousemove to position it.

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <div 
      ref={cursorRef} 
      className={`customCursor ${isHovering ? 'customCursorHover' : ''}`}
      style={{ 
        backgroundImage: `url(${cursorImg})`,
        // Start visible but off-screen to prevent flash/missing cursor
        display: 'block' 
      }}
    />
  )
}
