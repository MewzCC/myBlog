import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  GithubOutlined,
  MailOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { getBloggerProfile } from '../../api/user'
import { useSettingsStore } from '../../stores/settingsStore'
import type { User } from '../../types/api'
import type { Route } from '../../types/route'
import './personal-intro.css'

const channels = [
  { name: '灵感', en: 'IDEAS', message: '有些想法很小，但值得被听见。', frequency: 88.6 },
  { name: '代码', en: 'CODE', message: '把好奇心，写成可以运行的东西。', frequency: 101.2 },
  { name: '生活', en: 'LIFE', message: '在忙碌之外，收集一点无用的美好。', frequency: 108.0 },
]

function SignalField({ frequency, pulse }: { frequency: number; pulse: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const values = useRef({ frequency, pulse })
  values.current = { frequency, pulse }
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || /jsdom/i.test(navigator.userAgent)) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let width = 0,
      height = 0,
      frame = 0,
      lastPulse = values.current.pulse,
      burstAt = -10000
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stars = Array.from({ length: 75 }, (_, i) => ({
      x: ((i * 73 + 19) % 997) / 997,
      y: ((i * 131 + 97) % 991) / 991,
      size: i % 9 === 0 ? 1.8 : 0.7,
      phase: i * 0.6,
    }))
    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (motion.matches) draw(performance.now())
    }
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      const light = document.documentElement.dataset.theme === 'light'
      ctx.fillStyle = light ? '#3d5b73' : '#b4fff1'
      for (const star of stars) {
        ctx.globalAlpha = 0.15 + (Math.sin(time / 1800 + star.phase) + 1) * 0.22
        const x = star.x * width,
          y = (star.y * height - (motion.matches ? 0 : time * 0.003 * star.size)) % height
        ctx.beginPath()
        ctx.arc(x, (y + height) % height, star.size, 0, Math.PI * 2)
        ctx.fill()
      }
      if (values.current.pulse !== lastPulse) {
        lastPulse = values.current.pulse
        burstAt = time
      }
      const elapsed = (time - burstAt) / 1600
      if (elapsed < 1 && !motion.matches) {
        ctx.globalAlpha = (1 - elapsed) * 0.7
        ctx.strokeStyle = light ? '#dd572f' : '#e0ff94'
        ctx.lineWidth = 2
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.arc(
            width * 0.73,
            height * 0.45,
            Math.max(0, elapsed * width * 0.7 - i * 45),
            0,
            Math.PI * 2,
          )
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      if (!document.hidden && !motion.matches) frame = requestAnimationFrame(draw)
    }
    const restart = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) draw(performance.now())
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    document.addEventListener('visibilitychange', restart)
    motion.addEventListener('change', restart)
    resize()
    restart()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', restart)
      motion.removeEventListener('change', restart)
    }
  }, [])
  return <canvas className="signal__field" ref={canvasRef} aria-hidden="true" />
}

function SignalCore({ frequency }: { frequency: number }) {
  const lines = useMemo(() => {
    const project = (u: number, v: number) => {
      const radius = 163 + 56 * Math.cos(v)
      const x = radius * Math.cos(u),
        y = radius * Math.sin(u),
        z = 56 * Math.sin(v)
      const a = 0.97,
        b = 0.36
      const yy = y * Math.cos(a) - z * Math.sin(a),
        zz = y * Math.sin(a) + z * Math.cos(a)
      const xx = x * Math.cos(b) + zz * Math.sin(b),
        depth = -x * Math.sin(b) + zz * Math.cos(b)
      const p = 750 / (750 - depth)
      return `${(320 + xx * p).toFixed(2)},${(300 + yy * p).toFixed(2)}`
    }
    return Array.from({ length: 56 }, (_, i) => {
      const meridian = i < 40
      const points = Array.from({ length: 97 }, (_, j) =>
        project(
          meridian ? (i / 40) * Math.PI * 2 : (j / 96) * Math.PI * 2,
          meridian ? (j / 96) * Math.PI * 2 : ((i - 40) / 16) * Math.PI * 2,
        ),
      ).join(' ')
      return (
        <polyline
          key={i}
          points={points}
          className={i % 5 === 0 ? 'signal__wire signal__wire--bright' : 'signal__wire'}
        />
      )
    })
  }, [])
  return (
    <svg
      className="signal__core"
      viewBox="0 0 640 600"
      aria-hidden="true"
      style={{ '--frequency-hue': `${(frequency - 88) * 4}deg` } as CSSProperties}
    >
      <defs>
        <radialGradient id="signal-glow">
          <stop stopColor="var(--signal-lime)" stopOpacity=".25" />
          <stop offset="1" stopColor="var(--signal-lime)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="320" cy="300" r="260" fill="url(#signal-glow)" />
      <g className="signal__geometry">{lines}</g>
      <circle cx="320" cy="300" r="39" className="signal__nucleus" />
      <circle cx="320" cy="300" r="25" className="signal__nucleus-inner" />
      <path d="M320 240v22m0 76v22m-60-60h22m76 0h22" className="signal__crosshair" />
    </svg>
  )
}

export default function PersonalIntro({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const [profile, setProfile] = useState<User | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [channel, setChannel] = useState(0)
  const [frequency, setFrequency] = useState(88.6)
  const [pulse, setPulse] = useState(0)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const { theme, setTheme, enableSocials, enableGuestbook } = useSettingsStore()
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  const [command, setCommand] = useState('')
  const [log, setLog] = useState('观测舱已就绪。今天也保持一点好奇。')
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    let alive = true
    void getBloggerProfile()
      .then((res) => {
        if (alive && res.data.code === 200) setProfile(res.data.data)
      })
      .catch(() => undefined)
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', update)
    return () => {
      alive = false
      window.clearInterval(clock)
      media.removeEventListener('change', update)
    }
  }, [])
  const selectChannel = (index: number) => {
    setChannel(index)
    setFrequency(channels[index].frequency)
    setLog(`正在收听 ${channels[index].en} / ${channels[index].message}`)
  }
  const transmit = () => {
    setPulse((value) => value + 1)
    setLog('一束好奇心已发射。愿你的灵感，也被世界听见。')
  }
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === 'touch' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty(
      '--tilt-x',
      `${(event.clientY - box.top - box.height / 2) / 45}deg`,
    )
    event.currentTarget.style.setProperty(
      '--tilt-y',
      `${(event.clientX - box.left - box.width / 2) / 45}deg`,
    )
  }
  const runCommand = (event: React.FormEvent) => {
    event.preventDefault()
    const value = command.trim().toLowerCase()
    if (value === 'about') onNavigate({ name: 'about' })
    else if (value === 'blog') onNavigate({ name: 'archive' })
    else if (value === 'hello' && enableGuestbook) onNavigate({ name: 'guestbook' })
    else if (value === 'day') setTheme('light')
    else if (value === 'night') setTheme('dark')
    else if (value === 'launch') transmit()
    else setLog(`可用指令：about / blog${enableGuestbook ? ' / hello' : ''} / day / night / launch`)
    setCommand('')
  }
  const scrollToWriting = () =>
    document.getElementById('home-writing')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  return (
    <section className={`signal${paused ? ' signal--paused' : ''}`} aria-label="个人介绍">
      <SignalField frequency={frequency} pulse={pulse} />
      <div className="signal__masthead">
        <span>
          <i /> SAKURA / PRIVATE SIGNAL STATION
        </span>
        <span className="signal__coordinates">CH. 001 / PERSONAL FREQUENCY</span>
        <button
          className="signal__theme"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          aria-label={dark ? '切换到昼间模式' : '切换到夜间模式'}
        >
          {dark ? <MoonOutlined /> : <SunOutlined />}
          <span>{dark ? 'NIGHT MODE' : 'DAY MODE'}</span>
          <b>{dark ? '☾' : '☀'}</b>
        </button>
      </div>
      <div className="signal__hero">
        <div className="signal__intro">
          <div className="signal__greeting">
            <span className="signal__avatar">
              {profile?.avatar ? <img src={profile.avatar} alt="" /> : 'S.'}
            </span>
            <span>
              你好，我是 {profile?.name || 'Sakura'}
              <small>一个写代码，也收集生活的人。</small>
            </span>
            <span className="signal__hello">✳</span>
          </div>
          <h1>
            把灵感，
            <br />
            <span className="signal__headline">
              发射出去
              <svg viewBox="0 0 80 80" aria-hidden="true">
                <path d="M14 65 65 14M14 14h51v51" />
              </svg>
            </span>
            <span className="signal__title-dot">.</span>
          </h1>
          <p className="signal__bio">
            {profile?.bio ||
              '在代码里创造，在生活里漫游。这里收藏我的想法、作品，以及那些还没被命名的好奇心。'}
          </p>
          <div className="signal__actions">
            <button className="signal__primary" onClick={scrollToWriting}>
              进入我的轨道 <ArrowDownOutlined />
            </button>
            <button className="signal__about" onClick={() => onNavigate({ name: 'about' })}>
              认识站长 <span>↗</span>
            </button>
          </div>
          <div className="signal__intro-note">
            <span>01 / TRANSMIT YOUR CURIOSITY</span>
            <span>持续探索，偶尔脱轨。</span>
          </div>
        </div>
        <div
          className="signal__visual"
          onPointerMove={onMove}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty('--tilt-x', '0deg')
            event.currentTarget.style.setProperty('--tilt-y', '0deg')
          }}
        >
          <span className="signal__visual-label">
            EXPERIMENT NO. 001<span>LIVE GENERATIVE OBJECT</span>
          </span>
          <div className="signal__orbital-track" />
          <div className="signal__orbital-track signal__orbital-track--outer" />
          <div className="signal__core-space">
            <SignalCore frequency={frequency} />
          </div>
          <div className="signal__object-id">
            <span>悬浮灵感体</span>
            <small>THE CURIOSITY ENGINE</small>
          </div>
          <span className="signal__annotation signal__annotation--left">
            <i /> 好奇心驱动
          </span>
          <span className="signal__annotation signal__annotation--right">
            ∞<small>IDEAS IN ORBIT</small>
          </span>
          <button className="signal__launch" onClick={transmit} aria-label="发射灵感信号">
            <span>↗</span>
            <div>
              发射一束灵感<small>CLICK TO TRANSMIT</small>
            </div>
          </button>
          {pulse > 0 && <div key={pulse} className="signal__pulse" aria-hidden="true" />}
          <div className="signal__visual-footer">
            <span>拖动调频 · 移动鼠标 · 点击发射</span>
            <span>
              REACTOR ONLINE <i />
            </span>
          </div>
        </div>
      </div>
      <div className="signal__console">
        <div className="signal__tuner">
          <div className="signal__console-label">
            <span>01 / 视觉调频</span>
            <span>FM</span>
          </div>
          <div className="signal__frequency">
            <output htmlFor="signal-frequency">{frequency.toFixed(1)}</output>
            <span>
              MHz<b>↗</b>
            </span>
          </div>
          <label className="signal__range-label" htmlFor="signal-frequency">
            滑动，改变灵感体的光谱
          </label>
          <input
            id="signal-frequency"
            className="signal__range"
            type="range"
            min="88"
            max="108"
            step=".1"
            value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))}
            aria-label="调整视觉频率"
          />
          <div className="signal__ticks">
            <span>88.0</span>
            <span>98.0</span>
            <span>108.0</span>
          </div>
        </div>
        <div className="signal__channel">
          <div className="signal__console-label">
            <span>02 / 正在收听</span>
            <span>SELECT A CHANNEL</span>
          </div>
          <div className="signal__channel-buttons">
            {channels.map((item, index) => (
              <button
                key={item.en}
                className={index === channel ? 'signal__channel-active' : ''}
                aria-pressed={index === channel}
                onClick={() => selectChannel(index)}
              >
                <span>{item.name}</span>
                <small>{item.en}</small>
                <b>↗</b>
              </button>
            ))}
          </div>
          <p key={channel}>{channels[channel].message}</p>
        </div>
        <div className="signal__terminal">
          <div className="signal__console-label">
            <span>03 / 舱内终端</span>
            <time>
              {now.toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Shanghai',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}{' '}
              CST
            </time>
          </div>
          <p className="signal__log" role="status" aria-label="观测舱消息">
            &gt; {log}
          </p>
          <form onSubmit={runCommand}>
            <label htmlFor="signal-command">sakura@station:~$</label>
            <input
              id="signal-command"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="试试 about 或 launch"
              autoComplete="off"
              spellCheck={false}
              aria-label="观测舱指令"
            />
            <button type="submit" aria-label="执行指令">
              ↵
            </button>
          </form>
          <div className="signal__terminal-foot">
            <span>LOCAL TRANSMISSION ONLY</span>
            <button onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
              {paused ? '▶ 恢复轨道' : 'Ⅱ 暂停轨道'}
            </button>
          </div>
        </div>
      </div>
      <div className="signal__strip" aria-hidden="true">
        <div>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              STAY CURIOUS <b>✳</b> MAKE SOMETHING REAL <b>↗</b> OCCASIONALLY OFFLINE <b>✳</b>
            </span>
          ))}
        </div>
      </div>
      <div className="signal__writing-head" id="home-writing">
        <div>
          <span className="signal__section-label">02 / SIGNAL ARCHIVE</span>
          <h2>
            来自我的宇宙，<em>一些回声。</em>
          </h2>
        </div>
        <button onClick={() => onNavigate({ name: 'archive' })}>
          全部信号 <span>↗</span>
        </button>
      </div>
      <div className="signal__dock">
        <span>SAKURA · ONLINE</span>
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
        {enableGuestbook && (
          <button onClick={() => onNavigate({ name: 'guestbook' })}>留下你的回声 ↗</button>
        )}
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
            })
          }
          aria-label="回到顶部"
        >
          <ArrowUpOutlined />
        </button>
      </div>
    </section>
  )
}
