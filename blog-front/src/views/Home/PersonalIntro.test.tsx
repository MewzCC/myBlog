import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PersonalIntro from './PersonalIntro'
import { useSettingsStore } from '../../stores/settingsStore'

vi.mock('../../api/user', () => ({
  getBloggerProfile: vi.fn().mockResolvedValue({ data: { code: 200, data: { name: 'Sakura' } } }),
}))

afterEach(() => {
  vi.useRealTimers()
})

describe('personal garden widgets', () => {
  it('switches day and night through the persisted site theme', () => {
    useSettingsStore.setState({ theme: 'dark' })
    render(<PersonalIntro onNavigate={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '切换到昼间模式' }))
    expect(useSettingsStore.getState().theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: '切换到夜间模式' }))
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('counts down, pauses, resumes and resets the focus timer', () => {
    vi.useFakeTimers()
    render(<PersonalIntro onNavigate={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '开始专注' }))
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByRole('timer').textContent).toBe('24:57')
    fireEvent.click(screen.getByRole('button', { name: '暂停专注' }))
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByRole('timer').textContent).toBe('24:57')
    fireEvent.click(screen.getByRole('button', { name: '开始专注' }))
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole('timer').textContent).toBe('24:55')
    fireEvent.click(screen.getByRole('button', { name: '重置专注计时器' }))
    expect(screen.getByRole('timer').textContent).toBe('25:00')
    expect(screen.getByRole('button', { name: '开始专注' })).toBeTruthy()
  })
})
