import { useEffect } from 'react'
import normalCursor from '../../assets/img/Normal.ani'
import linkCursor from '../../assets/img/Link.ani'
import pinCursor from '../../assets/img/Pin.ani'
import textCursor from '../../assets/img/Text.ani'
import unavailableCursor from '../../assets/img/Unavailable.ani'
import workingCursor from '../../assets/img/Working.ani'
import './custom-cursor.css'

export default function CustomCursor() {
  useEffect(() => {
    const isDesktop =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (!isDesktop) return

    const root = document.documentElement
    document.body.classList.add('custom-cursor-active')
    root.style.setProperty('--cursor-normal', `url("${normalCursor}") 4 4, auto`)
    root.style.setProperty('--cursor-link', `url("${linkCursor}") 4 4, pointer`)
    root.style.setProperty('--cursor-pin', `url("${pinCursor}") 4 4, pointer`)
    root.style.setProperty('--cursor-text', `url("${textCursor}") 4 12, text`)
    root.style.setProperty('--cursor-unavailable', `url("${unavailableCursor}") 4 4, not-allowed`)
    root.style.setProperty('--cursor-working', `url("${workingCursor}") 4 4, progress`)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      root.style.removeProperty('--cursor-normal')
      root.style.removeProperty('--cursor-link')
      root.style.removeProperty('--cursor-pin')
      root.style.removeProperty('--cursor-text')
      root.style.removeProperty('--cursor-unavailable')
      root.style.removeProperty('--cursor-working')
    }
  }, [])

  return null
}
