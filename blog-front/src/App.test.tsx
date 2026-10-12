import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./components/Layout/NavBar', () => ({
  default: ({ onNavigate }: { onNavigate: (route: { name: 'admin' }) => void }) => (
    <button onClick={() => onNavigate({ name: 'admin' })}>打开后台</button>
  ),
}))
vi.mock('./components/VideoBackground/VideoBackground', () => ({ default: () => null }))
vi.mock('./components/Effects/SakuraEffect', () => ({ default: () => null }))
vi.mock('./components/Effects/CustomCursor', () => ({ default: () => null }))
vi.mock('./views/Home/HomePage', () => ({ default: () => <div>测试首页</div> }))
vi.mock('./views/Admin/AdminPage', () => ({ default: () => <div>测试管理后台</div> }))
vi.mock('./api/site', () => ({ getSiteSettings: vi.fn().mockResolvedValue({ data: { code: 500 } }) }))

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('App navigation', () => {
  it('restores the admin page after navigating there and reloading', async () => {
    window.history.replaceState(null, '', '/?page=home')
    render(<App />)
    await screen.findByText('测试首页')
    fireEvent.click(screen.getByRole('button', { name: '打开后台' }))
    await screen.findByText('测试管理后台')
    expect(window.location.search).toBe('?page=admin')

    cleanup()
    // A reload starts from the URL, independently of the previous React state.
    window.history.replaceState(null, '', window.location.href)
    render(<App />)
    expect(await screen.findByText('测试管理后台')).toBeTruthy()
  })
})
