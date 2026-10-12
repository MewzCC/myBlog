import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
import { getArticles } from '../../api/article'

vi.mock('../../api/article', () => ({
  getArticles: vi.fn().mockResolvedValue({
    data: {
      code: 200,
      data: {
        list: Array.from({ length: 6 }, (_, i) => ({
          id: String(i + 1),
          title: `文章 ${i + 1}`,
          summary: '测试摘要',
          cover: '',
          publishDate: '2026-01-01',
          views: 1,
          likes: 0,
          comments: 0,
          tags: [],
          author: { id: '1', name: 'Admin', avatar: '' },
        })),
        total: 6,
      },
    },
  }),
}))
vi.mock('./HomeSidebar', () => ({ default: () => <aside>测试侧栏</aside> }))

describe('HomePage', () => {
  it('loads articles and renders carousel controls', async () => {
    render(<HomePage onNavigate={() => undefined} onOpenAuth={() => undefined} />)
    expect(await screen.findByRole('region', { name: '置顶文章轮播' })).toBeTruthy()
    expect(getArticles).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    expect(screen.getAllByRole('button', { name: /切换到第/ })).toHaveLength(4)
    expect(screen.getByRole('article', { name: '文章 5' })).toBeTruthy()
  })

  it('switches carousel slides', async () => {
    render(<HomePage onNavigate={() => undefined} onOpenAuth={() => undefined} />)
    const button = await screen.findByRole('button', { name: '切换到第 2 张' })
    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('article', { name: '2 / 4' })).toBeTruthy()
    expect(screen.queryByRole('article', { name: '1 / 4' })).toBeNull()
  })

  it('navigates to the selected article', async () => {
    const onNavigate = vi.fn()
    render(<HomePage onNavigate={onNavigate} onOpenAuth={() => undefined} />)
    fireEvent.click(await screen.findByRole('article', { name: '文章 5' }))
    expect(onNavigate).toHaveBeenCalledWith({ name: 'article', params: { id: '5' } })
  })
})
