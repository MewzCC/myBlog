import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UserProfileEdit from './UserProfileEdit'
import { updateUserInfo } from '../../api/user'
import { useUserStore } from '../../stores/userStore'

vi.mock('../../api/user', () => ({
  updateUserInfo: vi.fn().mockResolvedValue({ data: { code: 200 } }),
}))

describe('UserProfileEdit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    useUserStore.setState({
      token: 'test-token',
      userInfo: { id: '1', name: 'Admin', avatar: '', bio: '', roles: ['admin'] },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    useUserStore.getState().logout()
  })

  it('renders the logged-in user profile', () => {
    render(<UserProfileEdit />)
    expect(screen.getByDisplayValue('Admin')).toBeTruthy()
    expect(screen.getByPlaceholderText('https://github.com/...')).toBeTruthy()
  })

  it('validates nickname length', () => {
    render(<UserProfileEdit />)
    const input = screen.getByDisplayValue('Admin')
    fireEvent.change(input, { target: { value: 'A' } })
    expect(screen.getByText('昵称长度需要在 2 到 20 个字符之间')).toBeTruthy()
    fireEvent.change(input, { target: { value: 'ValidName' } })
    expect(screen.queryByText('昵称长度需要在 2 到 20 个字符之间')).toBeNull()
  })

  it('validates nickname characters', () => {
    render(<UserProfileEdit />)
    fireEvent.change(screen.getByDisplayValue('Admin'), { target: { value: 'Invalid@Name' } })
    expect(screen.getByText('昵称只能包含中文、英文、数字和下划线')).toBeTruthy()
  })

  it('debounces saving and updates the user store after success', async () => {
    render(<UserProfileEdit />)
    fireEvent.change(screen.getByDisplayValue('Admin'), { target: { value: 'NewName' } })
    expect(updateUserInfo).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(updateUserInfo).toHaveBeenCalledWith(expect.objectContaining({ name: 'NewName' }))
    expect(useUserStore.getState().userInfo?.name).toBe('NewName')
  })

  it('does not save an invalid nickname', async () => {
    render(<UserProfileEdit />)
    fireEvent.change(screen.getByDisplayValue('Admin'), { target: { value: 'A' } })
    await act(() => vi.advanceTimersByTimeAsync(600))
    expect(updateUserInfo).not.toHaveBeenCalled()
  })

  it('saves changes to the biography', async () => {
    render(<UserProfileEdit />)
    fireEvent.change(screen.getByPlaceholderText('介绍一下自己...'), {
      target: { value: '新简介' },
    })
    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(updateUserInfo).toHaveBeenCalledWith(expect.objectContaining({ bio: '新简介' }))
  })
})
