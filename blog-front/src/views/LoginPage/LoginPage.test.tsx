import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('renders login title', () => {
    render(
      <LoginPage
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
        registerCodeSending={false}
        onRegisterChange={() => undefined}
        onRegisterSubmit={(e) => e.preventDefault()}
        onRegisterRequestCode={() => undefined}
        forgotValue={{ email: '', code: '', password: '', confirmPassword: '' }}
        forgotErrors={{}}
        forgotSubmitting={false}
        forgotStrength={{ percent: 0, label: '弱' }}
        forgotCodeSecondsLeft={0}
        forgotCodeSending={false}
        onForgotChange={() => undefined}
        onForgotSubmit={(e) => e.preventDefault()}
        onForgotRequestCode={() => undefined}
        onModeChange={() => undefined}
      />
    )

    expect(screen.getByText('欢迎回来')).toBeTruthy()
  })
})
