import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UserProfileEdit from './UserProfileEdit'
import * as commonUtils from '../../utils/common'

// Mock the simulateApiCall
vi.mock('../../utils/common', async () => {
  const actual = await vi.importActual('../../utils/common')
  return {
    ...actual,
    simulateApiCall: vi.fn().mockResolvedValue({}),
  }
})

describe('UserProfileEdit', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders initial state correctly', () => {
    render(<UserProfileEdit />)
    expect(screen.getByDisplayValue('Admin')).toBeTruthy()
    expect(screen.getByLabelText('保密')).toBeTruthy()
  })

  it('validates nickname length', () => {
    render(<UserProfileEdit />)
    const input = screen.getByDisplayValue('Admin')
    
    fireEvent.change(input, { target: { value: 'A' } })
    expect(screen.getByText('昵称长度需在2-20个字符之间')).toBeTruthy()
    
    fireEvent.change(input, { target: { value: 'ValidName' } })
    expect(screen.queryByText('昵称长度需在2-20个字符之间')).toBeNull()
  })

  it('validates nickname characters', () => {
    render(<UserProfileEdit />)
    const input = screen.getByDisplayValue('Admin')
    
    fireEvent.change(input, { target: { value: 'Invalid@Name' } })
    expect(screen.getByText('昵称只能包含中英文、数字和下划线')).toBeTruthy()
  })

  it('triggers auto-save on valid change', async () => {
    // Use real timers to debug mock issues
    render(<UserProfileEdit />)
    const input = screen.getByDisplayValue('Admin')
    
    fireEvent.change(input, { target: { value: 'NewName' } })
    
    // Wait for debounce (500ms) + buffer
    await waitFor(() => {
      expect(commonUtils.simulateApiCall).toHaveBeenCalled()
    }, { timeout: 2000 })
  })

  it('does not save on invalid input', async () => {
    render(<UserProfileEdit />)
    const input = screen.getByDisplayValue('Admin')
    
    fireEvent.change(input, { target: { value: 'A' } }) // Invalid
    
    // Wait to ensure it's NOT called
    await new Promise(r => setTimeout(r, 600))
    
    expect(commonUtils.simulateApiCall).not.toHaveBeenCalled()
  })

  it('updates gender', async () => {
    render(<UserProfileEdit />)
    
    const maleRadio = screen.getByLabelText('男')
    fireEvent.click(maleRadio)
    
    expect(maleRadio).toHaveProperty('checked', true)
    
    await waitFor(() => {
      expect(commonUtils.simulateApiCall).toHaveBeenCalled()
    }, { timeout: 2000 })
  })
})
