import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusBanner from './StatusBanner'

describe('StatusBanner', () => {
  it('renders text', () => {
    render(<StatusBanner kind="error" text="请输入账号与密码" />)
    expect(screen.getByText('请输入账号与密码')).toBeTruthy()
  })
})

