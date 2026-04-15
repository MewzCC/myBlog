import type { FormEvent } from 'react'
import './auth-card.css'

export type AuthMode = 'login' | 'register' | 'forgot'

export type LoginFormValue = {
  account: string
  password: string
}

export type RegisterFormValue = {
  email: string
  code: string
  password: string
  confirmPassword: string
}

export type ForgotFormValue = {
  email: string
  code: string
  password: string
  confirmPassword: string
}

export type PasswordStrength = {
  percent: number
  label: string
}

export type LoginErrors = {
  account?: string
  password?: string
}

export type RegisterErrors = {
  email?: string
  code?: string
  password?: string
  confirmPassword?: string
}

export type ForgotErrors = {
  email?: string
  code?: string
  password?: string
  confirmPassword?: string
}

export type AuthCardProps = {
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

export default function AuthCard({
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
}: AuthCardProps) {
  const loginAccountErrorId = 'login-account-error'
  const loginPasswordErrorId = 'login-password-error'
  const registerEmailErrorId = 'register-email-error'
  const registerCodeErrorId = 'register-code-error'
  const registerPasswordErrorId = 'register-password-error'
  const registerConfirmPasswordErrorId = 'register-confirm-password-error'
  const forgotEmailErrorId = 'forgot-email-error'
  const forgotCodeErrorId = 'forgot-code-error'
  const forgotPasswordErrorId = 'forgot-password-error'
  const forgotConfirmPasswordErrorId = 'forgot-confirm-password-error'

  return (
    <section className="authCard" aria-label="身份验证">
      <div className="authCardGlow" aria-hidden="true" />

      <div className="authCardInner" data-mode={mode}>
        <div className="authDeck" aria-live="polite">
          <div
            className={mode === 'login' ? 'authPanel authPanelActive' : 'authPanel'}
            aria-hidden={mode !== 'login'}
          >
            <div className="authBrandRow">
              <div className="authBrandMark" aria-hidden="true" />
              <div>
                <div className="authBrandName">Sakura</div>
                <div className="authBrandSub">登录账号</div>
              </div>
            </div>

            <h1 className="authTitle">欢迎回来</h1>
            <p className="authSubtitle">输入账号和密码</p>

            <form className="authForm" onSubmit={onLoginSubmit}>
              <label className="authField">
                <span className="authLabel">账号</span>
                <input
                  className="authInput"
                  value={loginValue.account}
                  onChange={(e) => onLoginChange({ ...loginValue, account: e.target.value })}
                  autoComplete="username"
                  inputMode="email"
                  placeholder="邮箱或用户名"
                  aria-invalid={loginErrors.account ? 'true' : 'false'}
                  aria-describedby={loginErrors.account ? loginAccountErrorId : undefined}
                />
                {loginErrors.account ? (
                  <div className="authFieldError" id={loginAccountErrorId}>
                    {loginErrors.account}
                  </div>
                ) : null}
              </label>

              <label className="authField">
                <span className="authLabel">密码</span>
                <input
                  className="authInput"
                  value={loginValue.password}
                  onChange={(e) => onLoginChange({ ...loginValue, password: e.target.value })}
                  autoComplete="current-password"
                  type="password"
                  placeholder="请输入密码"
                  aria-invalid={loginErrors.password ? 'true' : 'false'}
                  aria-describedby={loginErrors.password ? loginPasswordErrorId : undefined}
                />
                {loginErrors.password ? (
                  <div className="authFieldError" id={loginPasswordErrorId}>
                    {loginErrors.password}
                  </div>
                ) : null}
              </label>

              <div className="authRow">
                <label className="authCheck">
                  <input className="authCheckBox" type="checkbox" />
                  <span className="authCheckText">记住我</span>
                </label>
                <button className="authLink" type="button" onClick={() => onModeChange('forgot')}>
                  忘记密码
                </button>
              </div>

              <button className="authSubmit" type="submit" disabled={loginSubmitting}>
                <span className="authSubmitText">{loginSubmitting ? '登录中...' : '登录'}</span>
                <span className="authSubmitShine" aria-hidden="true" />
              </button>

              <div className="authFoot">
                <span className="authFootText">还没有账号？</span>
                <button className="authLink" type="button" onClick={() => onModeChange('register')}>
                  立即注册
                </button>
              </div>
            </form>
          </div>

          <div
            className={mode === 'register' ? 'authPanel authPanelActive' : 'authPanel'}
            aria-hidden={mode !== 'register'}
          >
            <div className="authBrandRow">
              <div className="authBrandMark" aria-hidden="true" />
              <div>
                <div className="authBrandName">Sakura</div>
                <div className="authBrandSub">创建账号</div>
              </div>
            </div>

            <h1 className="authTitle">创建账号</h1>
            <p className="authSubtitle">使用邮箱注册，完成验证码验证后即可登录。</p>

            <form className="authForm" onSubmit={onRegisterSubmit}>
              <label className="authField">
                <span className="authLabel">邮箱</span>
                <div className="authSplit">
                  <input
                    className="authInput"
                    value={registerValue.email}
                    onChange={(e) => onRegisterChange({ ...registerValue, email: e.target.value })}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="请输入邮箱地址"
                    type="email"
                    aria-invalid={registerErrors.email ? 'true' : 'false'}
                    aria-describedby={registerErrors.email ? registerEmailErrorId : undefined}
                  />
                  <button
                    className="authCodeBtn"
                    type="button"
                    onClick={onRegisterRequestCode}
                    disabled={registerCodeSecondsLeft > 0 || registerCodeSending}
                  >
                    {registerCodeSecondsLeft > 0 ? `${registerCodeSecondsLeft}s` : '获取验证码'}
                  </button>
                </div>
                {registerErrors.email ? (
                  <div className="authFieldError" id={registerEmailErrorId}>
                    {registerErrors.email}
                  </div>
                ) : null}
              </label>

              <label className="authField">
                <span className="authLabel">验证码</span>
                <input
                  className="authInput"
                  value={registerValue.code}
                  onChange={(e) => onRegisterChange({ ...registerValue, code: e.target.value })}
                  inputMode="numeric"
                  placeholder="请输入 6 位验证码"
                  aria-invalid={registerErrors.code ? 'true' : 'false'}
                  aria-describedby={registerErrors.code ? registerCodeErrorId : undefined}
                />
                {registerErrors.code ? (
                  <div className="authFieldError" id={registerCodeErrorId}>
                    {registerErrors.code}
                  </div>
                ) : null}
              </label>

              <label className="authField">
                <span className="authLabel">密码</span>
                <input
                  className="authInput"
                  value={registerValue.password}
                  onChange={(e) => onRegisterChange({ ...registerValue, password: e.target.value })}
                  autoComplete="new-password"
                  type="password"
                  placeholder="请设置密码"
                  aria-invalid={registerErrors.password ? 'true' : 'false'}
                  aria-describedby={registerErrors.password ? registerPasswordErrorId : undefined}
                />
                {registerErrors.password ? (
                  <div className="authFieldError" id={registerPasswordErrorId}>
                    {registerErrors.password}
                  </div>
                ) : null}
              </label>

              <div className="authStrength" role="group" aria-label="密码强度">
                <div className="authStrengthTop">
                  <span className="authStrengthLabel">强度</span>
                  <span className="authStrengthValue">{registerStrength.label}</span>
                </div>
                <div className="authStrengthBar" aria-hidden="true">
                  <div className="authStrengthFill" style={{ width: `${registerStrength.percent}%` }} />
                </div>
              </div>

              <label className="authField">
                <span className="authLabel">确认密码</span>
                <input
                  className="authInput"
                  value={registerValue.confirmPassword}
                  onChange={(e) => onRegisterChange({ ...registerValue, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  type="password"
                  placeholder="请再次输入密码"
                  aria-invalid={registerErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={registerErrors.confirmPassword ? registerConfirmPasswordErrorId : undefined}
                />
                {registerErrors.confirmPassword ? (
                  <div className="authFieldError" id={registerConfirmPasswordErrorId}>
                    {registerErrors.confirmPassword}
                  </div>
                ) : null}
              </label>

              <button className="authSubmit" type="submit" disabled={registerSubmitting}>
                <span className="authSubmitText">{registerSubmitting ? '注册中...' : '注册'}</span>
                <span className="authSubmitShine" aria-hidden="true" />
              </button>

              <div className="authFoot">
                <span className="authFootText">已经有账号了？</span>
                <button className="authLink" type="button" onClick={() => onModeChange('login')}>
                  返回登录
                </button>
              </div>
            </form>
          </div>

          <div
            className={mode === 'forgot' ? 'authPanel authPanelActive' : 'authPanel'}
            aria-hidden={mode !== 'forgot'}
          >
            <div className="authBrandRow">
              <div className="authBrandMark" aria-hidden="true" />
              <div>
                <div className="authBrandName">Sakura</div>
                <div className="authBrandSub">重置密码</div>
              </div>
            </div>

            <h1 className="authTitle">找回密码</h1>
            <p className="authSubtitle">发送验证码到邮箱，验证后即可重置密码。</p>

            <form className="authForm" onSubmit={onForgotSubmit}>
              <label className="authField">
                <span className="authLabel">邮箱</span>
                <div className="authSplit">
                  <input
                    className="authInput"
                    value={forgotValue.email}
                    onChange={(e) => onForgotChange({ ...forgotValue, email: e.target.value })}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="请输入邮箱地址"
                    type="email"
                    aria-invalid={forgotErrors.email ? 'true' : 'false'}
                    aria-describedby={forgotErrors.email ? forgotEmailErrorId : undefined}
                  />
                  <button
                    className="authCodeBtn"
                    type="button"
                    onClick={onForgotRequestCode}
                    disabled={forgotCodeSecondsLeft > 0 || forgotCodeSending}
                  >
                    {forgotCodeSecondsLeft > 0 ? `${forgotCodeSecondsLeft}s` : '获取验证码'}
                  </button>
                </div>
                {forgotErrors.email ? (
                  <div className="authFieldError" id={forgotEmailErrorId}>
                    {forgotErrors.email}
                  </div>
                ) : null}
              </label>

              <label className="authField">
                <span className="authLabel">验证码</span>
                <input
                  className="authInput"
                  value={forgotValue.code}
                  onChange={(e) => onForgotChange({ ...forgotValue, code: e.target.value })}
                  inputMode="numeric"
                  placeholder="请输入 6 位验证码"
                  aria-invalid={forgotErrors.code ? 'true' : 'false'}
                  aria-describedby={forgotErrors.code ? forgotCodeErrorId : undefined}
                />
                {forgotErrors.code ? (
                  <div className="authFieldError" id={forgotCodeErrorId}>
                    {forgotErrors.code}
                  </div>
                ) : null}
              </label>

              <label className="authField">
                <span className="authLabel">新密码</span>
                <input
                  className="authInput"
                  value={forgotValue.password}
                  onChange={(e) => onForgotChange({ ...forgotValue, password: e.target.value })}
                  autoComplete="new-password"
                  type="password"
                  placeholder="请设置新密码"
                  aria-invalid={forgotErrors.password ? 'true' : 'false'}
                  aria-describedby={forgotErrors.password ? forgotPasswordErrorId : undefined}
                />
                {forgotErrors.password ? (
                  <div className="authFieldError" id={forgotPasswordErrorId}>
                    {forgotErrors.password}
                  </div>
                ) : null}
              </label>

              <div className="authStrength" role="group" aria-label="密码强度">
                <div className="authStrengthTop">
                  <span className="authStrengthLabel">强度</span>
                  <span className="authStrengthValue">{forgotStrength.label}</span>
                </div>
                <div className="authStrengthBar" aria-hidden="true">
                  <div className="authStrengthFill" style={{ width: `${forgotStrength.percent}%` }} />
                </div>
              </div>

              <label className="authField">
                <span className="authLabel">确认新密码</span>
                <input
                  className="authInput"
                  value={forgotValue.confirmPassword}
                  onChange={(e) => onForgotChange({ ...forgotValue, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  type="password"
                  placeholder="请再次输入新密码"
                  aria-invalid={forgotErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={forgotErrors.confirmPassword ? forgotConfirmPasswordErrorId : undefined}
                />
                {forgotErrors.confirmPassword ? (
                  <div className="authFieldError" id={forgotConfirmPasswordErrorId}>
                    {forgotErrors.confirmPassword}
                  </div>
                ) : null}
              </label>

              <button className="authSubmit" type="submit" disabled={forgotSubmitting}>
                <span className="authSubmitText">{forgotSubmitting ? '提交中...' : '重置密码'}</span>
                <span className="authSubmitShine" aria-hidden="true" />
              </button>

              <div className="authFoot">
                <span className="authFootText">想起密码了？</span>
                <button className="authLink" type="button" onClick={() => onModeChange('login')}>
                  返回登录
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
