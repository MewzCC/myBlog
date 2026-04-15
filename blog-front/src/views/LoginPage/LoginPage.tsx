import type { FormEvent } from 'react'
import AuthCard, {
  type AuthMode,
  type ForgotErrors,
  type ForgotFormValue,
  type LoginErrors,
  type LoginFormValue,
  type PasswordStrength,
  type RegisterErrors,
  type RegisterFormValue,
} from '../../components/AuthCard/AuthCard'
import './login-page.css'

export type LoginPageProps = {
  mode: AuthMode

  loginValue: LoginFormValue
  loginErrors: LoginErrors
  loginSubmitting: boolean
  onLoginChange: (next: LoginFormValue) => void
  onLoginSubmit: (event: FormEvent) => void

  registerValue: RegisterFormValue
  registerErrors: RegisterErrors
  registerSubmitting: boolean
  registerStrength: PasswordStrength
  registerCodeSecondsLeft: number
  registerCodeSending: boolean
  onRegisterChange: (next: RegisterFormValue) => void
  onRegisterSubmit: (event: FormEvent) => void
  onRegisterRequestCode: () => void

  forgotValue: ForgotFormValue
  forgotErrors: ForgotErrors
  forgotSubmitting: boolean
  forgotStrength: PasswordStrength
  forgotCodeSecondsLeft: number
  forgotCodeSending: boolean
  onForgotChange: (next: ForgotFormValue) => void
  onForgotSubmit: (event: FormEvent) => void
  onForgotRequestCode: () => void

  onModeChange: (next: AuthMode) => void
}

/**
 * LoginPage
 *
 * - 纯 UI 组合组件：登录卡片布局
 * - 所有状态与交互通过 props 注入
 */
export default function LoginPage({
  mode,
  loginValue,
  loginErrors,
  loginSubmitting,
  onLoginChange,
  onLoginSubmit,
  registerValue,
  registerErrors,
  registerSubmitting,
  registerStrength,
  registerCodeSecondsLeft,
  registerCodeSending,
  onRegisterChange,
  onRegisterSubmit,
  onRegisterRequestCode,
  forgotValue,
  forgotErrors,
  forgotSubmitting,
  forgotStrength,
  forgotCodeSecondsLeft,
  forgotCodeSending,
  onForgotChange,
  onForgotSubmit,
  onForgotRequestCode,
  onModeChange,
}: LoginPageProps) {
  return (
    <div className="loginPageRoot">
      <main className="loginPageStage">
        <AuthCard
          mode={mode}
          loginValue={loginValue}
          loginErrors={loginErrors}
          loginSubmitting={loginSubmitting}
          onLoginChange={onLoginChange}
          onLoginSubmit={onLoginSubmit}
          registerValue={registerValue}
          registerErrors={registerErrors}
          registerSubmitting={registerSubmitting}
          registerStrength={registerStrength}
          registerCodeSecondsLeft={registerCodeSecondsLeft}
          registerCodeSending={registerCodeSending}
          onRegisterChange={onRegisterChange}
          onRegisterSubmit={onRegisterSubmit}
          onRegisterRequestCode={onRegisterRequestCode}
          forgotValue={forgotValue}
          forgotErrors={forgotErrors}
          forgotSubmitting={forgotSubmitting}
          forgotStrength={forgotStrength}
          forgotCodeSecondsLeft={forgotCodeSecondsLeft}
          forgotCodeSending={forgotCodeSending}
          onForgotChange={onForgotChange}
          onForgotSubmit={onForgotSubmit}
          onForgotRequestCode={onForgotRequestCode}
          onModeChange={onModeChange}
        />
      </main>
    </div>
  )
}
