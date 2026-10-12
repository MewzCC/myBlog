import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  GithubOutlined,
  MailOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { getBloggerProfile } from '../../api/user'
import { useSettingsStore } from '../../stores/settingsStore'
import type { User } from '../../types/api'
import type { Route } from '../../types/route'
import './personal-intro.css'

const thoughts = [
  '保持好奇，慢慢生长。',
  '把灵感写进代码，把日常留在这里。',
  '偶尔发呆，也是创造的一部分。',
  '今天也要做一点让自己开心的事。',
]

export default function PersonalIntro({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const [profile, setProfile] = useState<User | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [thought, setThought] = useState(0)
  const [waved, setWaved] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const [burst, setBurst] = useState(0)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const { enableSocials, enableGuestbook, enableSakura, toggleSakura, theme, setTheme } =
    useSettingsStore()
  const dark = theme === 'dark' || (theme === 'system' && systemDark)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let cancelled = false
    void getBloggerProfile()
      .then((res) => {
        if (!cancelled && res.data.code === 200) setProfile(res.data.data)
      })
      .catch(() => undefined)
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    return () => {
      cancelled = true
      window.clearInterval(clock)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const deadline = Date.now() + seconds * 1000
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining === 0) setRunning(false)
    }, 250)
    return () => window.clearInterval(timer)
    // The deadline is captured when starting or resuming, not on each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === 'touch' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty(
      '--look-x',
      `${(event.clientX - rect.left - rect.width / 2) / 24}px`,
    )
    event.currentTarget.style.setProperty(
      '--look-y',
      `${(event.clientY - rect.top - rect.height / 2) / 24}px`,
    )
  }

  const time = now.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const name = profile?.name || 'Sakura'

  return (
    <section
      className="personal"
      ref={rootRef}
      aria-label="个人介绍"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
        event.currentTarget.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
      }}
    >
      <div className="personal__aurora" aria-hidden="true" />
      <div className="personal__stars" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i
            key={i}
            style={
              {
                '--star-x': `${(i * 37 + 7) % 100}%`,
                '--star-y': `${(i * 19 + 5) % 80}%`,
                '--delay': `${i * 0.17}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <button
        className="personal__theme"
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        aria-label={dark ? '切换到昼间模式' : '切换到夜间模式'}
      >
        <span className="personal__theme-icon">{dark ? <MoonOutlined /> : <SunOutlined />}</span>
        {dark ? '月光漫游' : '日光花园'}
        <span className="personal__theme-track">
          <i />
        </span>
      </button>
      <div className="personal__eyebrow">
        <span className="personal__status" /> A LITTLE CORNER OF THE INTERNET{' '}
        <span className="personal__edition">PERSONAL SPACE / 01</span>
      </div>
      <div className="personal__hero">
        <div className="personal__copy">
          <span className="personal__hello">
            你好，欢迎来到我的小宇宙 <span className="personal__wave">✳</span>
          </span>
          <h1>
            我是{' '}
            <span>
              {name}，
              <svg viewBox="0 0 280 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 16 Q135 -4 275 11 M22 22 Q148 5 259 19" />
              </svg>
            </span>
            <br />
            一个持续<span className="personal__serif">探索</span>的人
            <span className="personal__period">.</span>
          </h1>
          <p>
            {profile?.bio ||
              '写代码，记录生活，捕捉一闪而过的灵感。这里是我的数字花园，也是一些有趣想法的生长之地。'}
          </p>
          <div className="personal__actions">
            <button
              className="personal__primary"
              onClick={() =>
                document.getElementById('home-writing')?.scrollIntoView({
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                })
              }
            >
              逛逛我的世界 <ArrowDownOutlined />
            </button>
            <button className="personal__secondary" onClick={() => onNavigate({ name: 'about' })}>
              更多关于我 <span>↗</span>
            </button>
          </div>
          <div className="personal__socials">
            <span>FIND ME ELSEWHERE</span>
            {enableSocials && profile?.socials?.github && (
              <a href={profile.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GithubOutlined />
              </a>
            )}
            {enableSocials && profile?.socials?.email && (
              <a href={`mailto:${profile.socials.email}`} aria-label="邮箱">
                <MailOutlined />
              </a>
            )}
            <span className="personal__signature">Made of curiosity & coffee.</span>
          </div>
        </div>
        <div
          className="personal__universe"
          onPointerMove={move}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty('--look-x', '0px')
            event.currentTarget.style.setProperty('--look-y', '0px')
          }}
        >
          <div className="personal__orbit personal__orbit--one" />
          <div className="personal__orbit personal__orbit--two" />
          <span className="personal__star personal__star--one">✦</span>
          <span className="personal__star personal__star--two">✳</span>
          <span className="personal__star personal__star--three">+</span>
          <span className="personal__satellite personal__satellite--code">
            &lt;/&gt;<small>BUILD SOMETHING</small>
          </span>
          <span className="personal__satellite personal__satellite--idea">
            ✷<small>STAY CURIOUS</small>
          </span>
          <button
            className={`personal__planet${waved ? ' personal__planet--waved' : ''}`}
            aria-label="向小星球打招呼"
            onClick={() => {
              setWaved((value) => !value)
              setBurst((value) => value + 1)
            }}
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={name}
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <span className="personal__face">
              <i />
              <i />
              <b />
            </span>
          </button>
          {burst > 0 && (
            <div key={burst} className="personal__burst" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  style={
                    {
                      '--angle': `${i * 22.5}deg`,
                      '--distance': `${130 + (i % 3) * 25}px`,
                    } as React.CSSProperties
                  }
                >
                  {i % 2 ? '✦' : '♡'}
                </span>
              ))}
            </div>
          )}
          <span className="personal__planet-caption" aria-live="polite">
            {waved ? 'HELLO, NEW FRIEND! ♡' : 'A WORK IN PROGRESS, ALWAYS.'}
          </span>
          <span className="personal__sticker">
            用热爱
            <br />
            给生活充电 <span>↗</span>
          </span>
          <span className="personal__coordinate">EST. NOW · STILL GROWING</span>
        </div>
      </div>
      <div className="personal__ticker" aria-hidden="true">
        <div>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              CODE WITH CURIOSITY <b>✳</b> LIVE WITH INTENTION <b>✳</b> CREATE A LITTLE MAGIC{' '}
              <b>✳</b>
            </span>
          ))}
        </div>
      </div>
      <div className="personal__widgets">
        <article className="personal__widget personal__widget--clock">
          <div className="personal__widget-label">
            此刻 · 北京时间 <span>↗</span>
          </div>
          <time className="personal__time">
            {time}
            <span className="personal__clock-dot" />
          </time>
          <p>
            {now.toLocaleDateString('zh-CN', {
              timeZone: 'Asia/Shanghai',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}{' '}
            <span>UTC +08:00</span>
          </p>
        </article>
        <article className="personal__widget personal__widget--note">
          <div className="personal__widget-label">
            给今天的一句话 <span>✦</span>
          </div>
          <p key={thought} className="personal__thought" aria-live="polite">
            {thoughts[thought]}
          </p>
          <button
            className="personal__text-button"
            onClick={() => setThought((value) => (value + 1) % thoughts.length)}
          >
            换个灵感 <ReloadOutlined />
          </button>
        </article>
        <article className="personal__widget personal__widget--focus">
          <div className="personal__widget-label">
            专注一小会儿 <span>◷</span>
          </div>
          <div className="personal__focus-row">
            <span className="personal__timer" role="timer" aria-label="专注剩余时间">
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:
              {String(seconds % 60).padStart(2, '0')}
            </span>
            <button
              className="personal__play"
              aria-label={running ? '暂停专注' : '开始专注'}
              disabled={seconds === 0}
              onClick={() => setRunning((value) => !value)}
            >
              {running ? <PauseOutlined /> : <PlayCircleOutlined />}
            </button>
          </div>
          <div className="personal__focus-bottom">
            <span>
              {seconds === 0
                ? '完成啦，休息一下 ☕'
                : running
                  ? '留一点时间给自己'
                  : '25 分钟，做一件小事'}
            </span>
            <button
              className="personal__text-button"
              aria-label="重置专注计时器"
              onClick={() => {
                setRunning(false)
                setSeconds(1500)
              }}
            >
              <ReloadOutlined />
            </button>
          </div>
        </article>
      </div>
      <div className="personal__section-head" id="home-writing">
        <div>
          <span className="personal__kicker">THE DIGITAL GARDEN</span>
          <h2>
            最近，写了些什么<span>↙</span>
          </h2>
        </div>
        <button className="personal__secondary" onClick={() => onNavigate({ name: 'archive' })}>
          所有文章 ↗
        </button>
      </div>
      <div className="personal__dock" aria-label="主页小工具">
        <span>小宇宙控制台</span>
        <button onClick={() => toggleSakura(!enableSakura)} aria-pressed={enableSakura}>
          ✿ 花瓣 {enableSakura ? '开' : '关'}
        </button>
        {enableGuestbook && (
          <button onClick={() => onNavigate({ name: 'guestbook' })}>♡ 留个脚印</button>
        )}
        <button
          aria-label="回到顶部"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
            })
          }
        >
          <ArrowUpOutlined />
        </button>
      </div>
    </section>
  )
}
