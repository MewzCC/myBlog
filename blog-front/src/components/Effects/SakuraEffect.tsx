import { useEffect, useRef } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

interface Petal {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

export default function SakuraEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { enableSakura } = useSettingsStore()
  const requestRef = useRef<number>()
  const petalsRef = useRef<Petal[]>([])
  const mouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // 移动端检查
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    if (isMobile || !enableSakura) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 窗口大小调整处理
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    // 鼠标移动处理（带节流）
    let lastMouseTime = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMouseTime > 16) { // 约 60fps 节流
        mouseRef.current = { x: e.clientX, y: e.clientY }
        lastMouseTime = now
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // 页面可见性变化处理
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
        requestRef.current = undefined
      } else {
        if (!requestRef.current) animate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 初始化花瓣
    const petalCount = 30
    petalsRef.current = Array.from({ length: petalCount }).map(() => createPetal(canvas.width, canvas.height))

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      petalsRef.current.forEach((petal) => {
        updatePetal(petal, canvas.width, canvas.height, mouseRef.current)
        drawPetal(ctx, petal)
      })

      requestRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [enableSakura])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999, // 确保在最上层但允许点击穿透
        opacity: 0.8,
        display: enableSakura ? 'block' : 'none',
      }}
    />
  )
}

function createPetal(width: number, height: number, resetY = false): Petal {
  return {
    x: Math.random() * width,
    y: resetY ? -20 : Math.random() * height,
    size: Math.random() * 8 + 6, // 稍微调小尺寸
    speedX: Math.random() * 1 - 0.5, // 减慢水平速度
    speedY: Math.random() * 0.8 + 0.4, // 减慢下落速度
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 1 - 0.5, // 减慢旋转速度
    opacity: Math.random() * 0.4 + 0.5,
  }
}

function updatePetal(petal: Petal, width: number, height: number, mouse: { x: number; y: number }) {
  petal.y += petal.speedY
  petal.x += petal.speedX + Math.sin(petal.y * 0.005) * 0.5
  petal.rotation += petal.rotationSpeed

  // 鼠标交互（排斥效果）
  const dx = petal.x - mouse.x
  const dy = petal.y - mouse.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const interactionRadius = 150

  if (distance < interactionRadius) {
    const force = (interactionRadius - distance) / interactionRadius
    const angle = Math.atan2(dy, dx)
    petal.x += Math.cos(angle) * force * 5
    petal.y += Math.sin(angle) * force * 5
  }

  // 超出边界重置
  if (petal.y > height + 20 || petal.x < -20 || petal.x > width + 20) {
    const newPetal = createPetal(width, height, true)
    Object.assign(petal, newPetal)
  }
}

function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  ctx.save()
  ctx.translate(petal.x, petal.y)
  ctx.rotate((petal.rotation * Math.PI) / 180)
  ctx.globalAlpha = petal.opacity
  
  // 绘制樱花花瓣形状
  ctx.beginPath()
  ctx.moveTo(0, 0)
  // 贝塞尔曲线绘制花瓣
  ctx.bezierCurveTo(petal.size / 2, -petal.size / 2, petal.size, petal.size / 4, 0, petal.size)
  ctx.bezierCurveTo(-petal.size, petal.size / 4, -petal.size / 2, -petal.size / 2, 0, 0)
  
  // 渐变色
  const gradient = ctx.createLinearGradient(0, 0, 0, petal.size)
  gradient.addColorStop(0, '#ffc0cb') // 粉色
  gradient.addColorStop(1, '#ffb7c5') // 樱花粉
  
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.restore()
}
