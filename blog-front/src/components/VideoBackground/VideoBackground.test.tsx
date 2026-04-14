import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VideoBackground from './VideoBackground'

describe('VideoBackground', () => {
  it('renders two videos and applies lens style vars', () => {
    const { container } = render(
      <VideoBackground
        videoSrc="/src/assets/videos/main-bg.mp4"
        active
        zoomScale={1.28}
        backgroundBlurPx={10}
        zoomBlurPx={0}
      />
    )

    const root = container.querySelector('.videoBackground') as HTMLDivElement
    expect(root).toBeTruthy()
    expect(root.style.getPropertyValue('--cursor-x')).toBe('120px')
    expect(root.style.getPropertyValue('--cursor-y')).toBe('80px')
    expect(root.style.getPropertyValue('--lens-alpha')).toBe('1')

    const videos = container.querySelectorAll('video')
    expect(videos.length).toBe(2)
  })
})

