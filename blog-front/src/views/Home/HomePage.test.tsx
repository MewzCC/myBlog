import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
import { useSettingsStore } from '../../stores/settingsStore'
import { getArticles } from '../../api/article'
import { initialTelemetry } from '../Drive/island'

const engine = vi.hoisted(() => ({
  dispose: vi.fn(),
  reset: vi.fn(),
  interact: vi.fn(),
  unlockSound: vi.fn(),
  teleport: vi.fn(),
  visitResident: vi.fn(),
}))
const createEngine = vi.hoisted(() => vi.fn())
vi.mock('../Drive/engine', () => ({ createIslandEngine: createEngine }))
vi.mock('../../api/user', () => ({
  getBloggerProfile: vi
    .fn()
    .mockResolvedValue({ data: { code: 200, data: { name: '岛主', bio: '记录代码与生活' } } }),
}))
vi.mock('../../api/article', () => ({
  getArticles: vi.fn().mockResolvedValue({
    data: {
      code: 200,
      data: {
        list: [
          {
            id: 'island-note',
            title: '从好奇心到一次技术探索',
            summary: '岛上的笔记',
            publishDate: '2026-10-13',
          },
        ],
        total: 1,
      },
    },
  }),
}))

beforeEach(() => {
  useSettingsStore.setState({ theme: 'dark', enableGuestbook: true })
  createEngine.mockImplementation(async (_canvas, options) => {
    engine.teleport.mockImplementation((id) => options.onStation(id))
    options.onReady()
    return engine
  })
})

describe('3D island homepage', () => {
  it('shows live resident health and navigates to a resident through the field guide', async () => {
    render(<HomePage onNavigate={vi.fn()} onOpenAuth={vi.fn()} />)
    const start = await screen.findByRole('button', { name: /出发，环岛兜风/ })
    await waitFor(() => expect(start.hasAttribute('disabled')).toBe(false))
    const options = createEngine.mock.calls.at(-1)![1]
    act(() =>
      options.onTelemetry({
        ...initialTelemetry,
        residents: [
          { id: 'capy', name: '慢慢', kind: '水豚', x: -40, z: -15, hp: 60, recovering: false },
        ],
        hits: 1,
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: /岛民图鉴/ }))
    expect(screen.getByText('60 / 100 HP')).toBeTruthy()
    act(() =>
      options.onTelemetry({
        ...initialTelemetry,
        residents: [
          { id: 'capy', name: '慢慢', kind: '水豚', x: -40, z: -15, hp: 0, recovering: true },
        ],
        hits: 2,
      }),
    )
    expect(screen.getByText('正在休息，稍后回来')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '寻找慢慢' }))
    expect(engine.visitResident).toHaveBeenCalledWith('capy')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: '暂停驾驶' })).toBeTruthy()
  })
  it('shows a passing ticket, then a decorated arrival preview with navigation', async () => {
    const navigate = vi.fn()
    render(<HomePage onNavigate={navigate} onOpenAuth={vi.fn()} />)
    const start = await screen.findByRole('button', { name: /出发，环岛兜风/ })
    await waitFor(() => expect(start.hasAttribute('disabled')).toBe(false))
    fireEvent.click(start)
    const options = createEngine.mock.calls.at(-1)![1]
    act(() => options.onTelemetry({ ...initialTelemetry, nearest: 'about', speed: 20 }))
    expect(screen.getByRole('complementary', { name: '路过站点提示' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    act(() => options.onStation('about'))
    expect(screen.getByRole('dialog', { name: '灯塔 / 关于我' }).className).toContain('arrival')
    expect(screen.getByLabelText('滚动内容预览，悬停或聚焦暂停')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /认识完整的我/ }))
    expect(navigate).toHaveBeenCalledWith({ name: 'about' })
    fireEvent.click(screen.getByRole('button', { name: '关闭面板' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('loads real articles and opens the selected article from a station', async () => {
    const navigate = vi.fn()
    render(<HomePage onNavigate={navigate} onOpenAuth={vi.fn()} />)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /出发，环岛兜风/ }).hasAttribute('disabled')).toBe(
        false,
      ),
    )
    expect(getArticles).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    fireEvent.click(screen.getByRole('button', { name: '前往书店 / 文章' }))
    expect(await screen.findByRole('dialog', { name: '书店 / 文章' })).toBeTruthy()
    fireEvent.click(await screen.findByRole('button', { name: /从好奇心到一次技术探索/ }))
    expect(navigate).toHaveBeenCalledWith({ name: 'article', params: { id: 'island-note' } })
  })

  it('persists day/night and starts and pauses the driving view', async () => {
    render(<HomePage onNavigate={vi.fn()} onOpenAuth={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '切换到白天' }))
    expect(useSettingsStore.getState().theme).toBe('light')
    const start = await screen.findByRole('button', { name: /出发，环岛兜风/ })
    await waitFor(() => expect(start.hasAttribute('disabled')).toBe(false))
    fireEvent.click(start)
    expect(screen.getByRole('button', { name: '暂停驾驶' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '暂停驾驶' }))
    expect(screen.getByText('停一下，也很好。')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /继续旅程/ }))
    expect(screen.queryByText('停一下，也很好。')).toBeNull()
  })

  it('keeps content navigable when WebGL fails', async () => {
    createEngine.mockRejectedValueOnce(new Error('WebGL unavailable'))
    const navigate = vi.fn()
    render(<HomePage onNavigate={navigate} onOpenAuth={vi.fn()} />)
    expect(await screen.findByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '前往灯塔 / 关于我' }))
    fireEvent.click(screen.getByRole('button', { name: /认识完整的我/ }))
    expect(navigate).toHaveBeenCalledWith({ name: 'about' })
  })

  it('respects disabled guestbook and disposes the engine on unmount', async () => {
    useSettingsStore.setState({ enableGuestbook: false })
    const view = render(<HomePage onNavigate={vi.fn()} onOpenAuth={vi.fn()} />)
    expect(screen.queryByRole('button', { name: '前往邮局 / 留言' })).toBeNull()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /出发，环岛兜风/ }).hasAttribute('disabled')).toBe(
        false,
      ),
    )
    view.unmount()
    expect(engine.dispose).toHaveBeenCalled()
  })
})
