import './status-banner.css'

export type StatusBannerProps = {
  kind: 'error' | 'success'
  text: string
}

/**
 * StatusBanner
 *
 * - 登录页内通用状态提示条
 * - 通过 kind 切换错误/成功视觉样式
 */
export default function StatusBanner({ kind, text }: StatusBannerProps) {
  return <div className={kind === 'error' ? 'statusBanner statusBannerErr' : 'statusBanner statusBannerOk'}>{text}</div>
}

