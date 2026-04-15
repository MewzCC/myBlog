import type { FormEvent } from 'react'
import StatusBanner, { type StatusBannerProps } from '../StatusBanner/StatusBanner'
import './login-card.css'

export type LoginFormValue = {
  account: string
  password: string
}

export type LoginCardProps = {
  value: LoginFormValue
  submitting: boolean
  banner: StatusBannerProps | null
  onChange: (next: LoginFormValue) => void
  onSubmit: (event: FormEvent) => void
}

/**
 * LoginCard
 *
 * - 纯 UI 表现组件：渲染登录卡片与表单
 * - 表单数据、提交状态、提示信息通过 props 注入
 */
export default function LoginCard({ value, submitting, banner, onChange, onSubmit }: LoginCardProps) {
  return (
    <section className="loginCard" aria-label="登录">
      <div className="loginCardGlow" aria-hidden="true" />
      <div className="loginCardInner">
        <div className="loginBrandRow">
          <div className="loginBrandMark" aria-hidden="true" />
          <div>
            <div className="loginBrandName">Sakura</div>
            <div className="loginBrandSub">Sign in</div>
          </div>
        </div>

        <h1 className="loginTitle">欢迎回来</h1>
        <p className="loginSubtitle">输入账号密码，进入系统。</p>

        {banner ? <StatusBanner kind={banner.kind} text={banner.text} /> : null}

        <form className="loginForm" onSubmit={onSubmit}>
          <label className="loginField">
            <span className="loginLabel">账号</span>
            <input
              className="loginInput"
              value={value.account}
              onChange={(e) => onChange({ ...value, account: e.target.value })}
              autoComplete="username"
              inputMode="email"
              placeholder="邮箱 / 用户名"
            />
          </label>

          <label className="loginField">
            <span className="loginLabel">密码</span>
            <input
              className="loginInput"
              value={value.password}
              onChange={(e) => onChange({ ...value, password: e.target.value })}
              autoComplete="current-password"
              type="password"
              placeholder="你的密码"
            />
          </label>

          <div className="loginRow">
            <label className="loginCheck">
              <input className="loginCheckBox" type="checkbox" />
              <span className="loginCheckText">记住我</span>
            </label>
            <button className="loginLink" type="button">
              忘记密码
            </button>
          </div>

          <button className="loginSubmit" type="submit" disabled={submitting}>
            <span className="loginSubmitText">{submitting ? '登录中…' : '登录'}</span>
            <span className="loginSubmitShine" aria-hidden="true" />
          </button>

          <div className="loginFoot">
            <span className="loginFootText">还没有账号？</span>
            <button className="loginLink" type="button">
              注册
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

