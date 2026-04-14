import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoginCard from './LoginCard'

describe('LoginCard', () => {
  it('calls onSubmit', () => {
    const onSubmit = (e: React.FormEvent) => e.preventDefault()
    let called = false

    render(
      <LoginCard
        value={{ account: '', password: '' }}
        submitting={false}
        banner={null}
        onChange={() => undefined}
        onSubmit={(e) => {
          onSubmit(e)
          called = true
        }}
      />
    )

    fireEvent.submit(screen.getByRole('button', { name: '登录' }))
    expect(called).toBe(true)
  })
})

