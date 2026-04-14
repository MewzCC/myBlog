import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AuthCard from './AuthCard'

describe('AuthCard', () => {
  it('switches mode when clicking register', () => {
    let nextMode: string | null = null

    render(
      <AuthCard
        mode="login"
        loginValue={{ account: '', password: '' }}
        loginErrors={{}}
        loginSubmitting={false}
        onLoginChange={() => undefined}
        onLoginSubmit={(e) => e.preventDefault()}
        registerValue={{ email: '', code: '', password: '', confirmPassword: '' }}
        registerErrors={{}}
        registerSubmitting={false}
        registerStrength={{ percent: 0, label: '弱' }}
        registerCodeSecondsLeft={0}
        onRegisterChange={() => undefined}
        onRegisterSubmit={(e) => e.preventDefault()}
        onRegisterRequestCode={() => undefined}
        forgotValue={{ email: '', code: '', password: '', confirmPassword: '' }}
        forgotErrors={{}}
        forgotSubmitting={false}
        forgotStrength={{ percent: 0, label: '弱' }}
        forgotCodeSecondsLeft={0}
        onForgotChange={() => undefined}
        onForgotSubmit={(e) => e.preventDefault()}
        onForgotRequestCode={() => undefined}
        onModeChange={(m) => {
          nextMode = m
        }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '注册' }))
    expect(nextMode).toBe('register')
  })

  it('renders field error text', () => {
    render(
      <AuthCard
        mode="login"
        loginValue={{ account: '', password: '' }}
        loginErrors={{ account: '请输入账号' }}
        loginSubmitting={false}
        onLoginChange={() => undefined}
        onLoginSubmit={(e) => e.preventDefault()}
        registerValue={{ email: '', code: '', password: '', confirmPassword: '' }}
        registerErrors={{}}
        registerSubmitting={false}
        registerStrength={{ percent: 0, label: '弱' }}
        registerCodeSecondsLeft={0}
        onRegisterChange={() => undefined}
        onRegisterSubmit={(e) => e.preventDefault()}
        onRegisterRequestCode={() => undefined}
        forgotValue={{ email: '', code: '', password: '', confirmPassword: '' }}
        forgotErrors={{}}
        forgotSubmitting={false}
        forgotStrength={{ percent: 0, label: '弱' }}
        forgotCodeSecondsLeft={0}
        onForgotChange={() => undefined}
        onForgotSubmit={(e) => e.preventDefault()}
        onForgotRequestCode={() => undefined}
        onModeChange={() => undefined}
      />
    )

    expect(screen.getByText('请输入账号')).toBeTruthy()
  })
})
