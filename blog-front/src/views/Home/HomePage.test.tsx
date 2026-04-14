import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'

afterEach(() => cleanup())

describe('HomePage', () => {
  it('renders carousel controls', () => {
    render(<HomePage onNavigate={() => undefined} onOpenAuth={() => undefined} />)

    expect(screen.getByRole('region', { name: '置顶文章轮播' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /切换到第/ }).length).toBeGreaterThan(0)
  })

  it('paginates article list', () => {
    render(<HomePage onNavigate={() => undefined} onOpenAuth={() => undefined} />)
    expect(screen.getByText('第 1 / 3 页')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '下一页' }))
    expect(screen.getByText('第 2 / 3 页')).toBeTruthy()
  })

  it('navigates to article on click', () => {
    const onNavigate = vi.fn()
    render(<HomePage onNavigate={onNavigate} onOpenAuth={() => undefined} />)

    const cards = screen.getAllByRole('article')
    expect(cards.length).toBeGreaterThan(0)
    fireEvent.click(cards[0])
    expect(onNavigate).toHaveBeenCalled()
  })
})
