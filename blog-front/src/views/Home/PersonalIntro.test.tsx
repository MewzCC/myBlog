import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PersonalIntro from './PersonalIntro'
import { useSettingsStore } from '../../stores/settingsStore'

vi.mock('../../api/user', () => ({
  getBloggerProfile: vi.fn().mockResolvedValue({ data: { code: 200, data: { name: 'Sakura' } } }),
}))

describe('personal signal station', () => {
  it('switches between day and night through the persisted site theme', () => {
    useSettingsStore.setState({ theme: 'dark' })
    render(<PersonalIntro onNavigate={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '切换到昼间模式' }))
    expect(useSettingsStore.getState().theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: '切换到夜间模式' }))
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('changes visual channels and lets visitors tune the frequency', () => {
    render(<PersonalIntro onNavigate={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /代码/ }))
    expect(screen.getByRole('button', { name: /代码/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('101.2')).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: '调整视觉频率' }), {
      target: { value: '95.5' },
    })
    expect(screen.getByText('95.5')).toBeTruthy()
  })

  it('launches a local signal and runs navigation commands', () => {
    const navigate = vi.fn()
    render(<PersonalIntro onNavigate={navigate} />)
    fireEvent.click(screen.getByRole('button', { name: '发射灵感信号' }))
    expect(screen.getByRole('status', { name: '观测舱消息' }).textContent).toContain(
      '一束好奇心已发射',
    )
    fireEvent.change(screen.getByRole('textbox', { name: '观测舱指令' }), {
      target: { value: 'about' },
    })
    fireEvent.click(screen.getByRole('button', { name: '执行指令' }))
    expect(navigate).toHaveBeenCalledWith({ name: 'about' })
    fireEvent.change(screen.getByRole('textbox', { name: '观测舱指令' }), {
      target: { value: 'unknown' },
    })
    fireEvent.click(screen.getByRole('button', { name: '执行指令' }))
    expect(screen.getByRole('status', { name: '观测舱消息' }).textContent).toContain('可用指令')
  })
})
