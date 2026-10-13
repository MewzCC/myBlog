import { useEffect, useRef, useState } from 'react'
import type { Route } from '../../types/route'
import type { User, ArticleSummary } from '../../types/api'
import { getBloggerProfile } from '../../api/user'
import { getArticles } from '../../api/article'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  initialTelemetry,
  stations,
  tokens,
  type DriveInput,
  type IslandSettings,
  type StationId,
} from './island'
import type { IslandEngine } from './engine'
import StationArt from './StationArt'
import DriveJoystick from './DriveJoystick'
import IslandMap from './IslandMap'
import './drive-home.css'

export default function DriveHome({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null),
    engineRef = useRef<IslandEngine | null>(null)
  const keys = useRef(new Set<string>()),
    touch = useRef<DriveInput>({ throttle: 0, steer: 0, brake: false, boost: false })
  const [telemetry, setTelemetry] = useState(initialTelemetry)
  const [driving, setDriving] = useState(false),
    [overview, setOverview] = useState(true),
    [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0)
  const [quality, setQuality] = useState<IslandSettings['quality']>('auto'),
    [sound, setSound] = useState(false)
  const [panel, setPanel] = useState<StationId | 'map' | 'wildlife' | null>(null),
    [help, setHelp] = useState(false)
  const [profile, setProfile] = useState<User | null>(null),
    [articles, setArticles] = useState<ArticleSummary[]>([]),
    [articleState, setArticleState] = useState<'loading' | 'ready' | 'error'>('loading')
  const { theme, setTheme, enableGuestbook, enableSocials } = useSettingsStore()
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  const settings = useRef<IslandSettings>({ dark, driving, overview, paused, quality, sound })
  settings.current = { dark, driving, overview, paused: paused || !!panel || help, quality, sound }
  const actions = useRef({ setPanel, enableGuestbook })
  actions.current = { setPanel, enableGuestbook }
  const panelRef = useRef<HTMLElement>(null),
    returnFocus = useRef<HTMLElement | null>(null)
  const modalOpen = useRef(false)
  const visibleStations = stations.filter((s) => s.id !== 'guestbook' || enableGuestbook)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)'),
      listener = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', listener)
    let alive = true
    void getBloggerProfile()
      .then((r) => {
        if (alive && r.data.code === 200) setProfile(r.data.data)
      })
      .catch(() => undefined)
    void getArticles({ page: 1, pageSize: 20 })
      .then((r) => {
        if (!alive) return
        if (r.data.code === 200) {
          setArticles(r.data.data.list)
          setArticleState('ready')
        } else setArticleState('error')
      })
      .catch(() => {
        if (alive) setArticleState('error')
      })
    return () => {
      alive = false
      media.removeEventListener('change', listener)
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const canvas = canvasRef.current!
    let local: IslandEngine | null = null
    const onError = (event: Event) => setError((event as CustomEvent<string>).detail)
    canvas.addEventListener('island-error', onError)
    void import('./engine')
      .then(({ createIslandEngine }) =>
        createIslandEngine(
          canvas,
          {
            getSettings: () => settings.current,
            getInput: () => {
              const k = keys.current
              return {
                throttle:
                  touch.current.throttle +
                  (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) -
                  (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0),
                steer:
                  touch.current.steer +
                  (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) -
                  (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0),
                brake: touch.current.brake || k.has('Space'),
                boost: touch.current.boost || k.has('ShiftLeft') || k.has('ShiftRight'),
              }
            },
            onTelemetry: setTelemetry,
            onStation: (id) => {
              if (id !== 'guestbook' || actions.current.enableGuestbook)
                actions.current.setPanel(id)
            },
            onReady: () => setReady(true),
          },
          controller.signal,
        ),
      )
      .then((engine) => {
        if (controller.signal.aborted) {
          engine.dispose()
          return
        }
        local = engine
        engineRef.current = engine
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? `岛屿暂时无法启动：${e.message}`
              : '岛屿暂时无法启动，请使用文字导航。',
          )
      })
    return () => {
      controller.abort()
      local?.dispose()
      engineRef.current = null
      canvas.removeEventListener('island-error', onError)
    }
  }, [attempt])
  useEffect(() => {
    const controlled = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
      'ShiftLeft',
      'ShiftRight',
    ]
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))
        return
      if (e.code === 'Escape') {
        setPanel(null)
        setHelp(false)
        setPaused(false)
        return
      }
      if (settings.current.paused) return
      if (controlled.includes(e.code) && settings.current.driving) {
        e.preventDefault()
        touch.current.brake = false
        keys.current.add(e.code)
        engineRef.current?.unlockSound()
      }
      if (e.repeat) return
      if (e.code === 'KeyE' && settings.current.driving) engineRef.current?.interact()
      if (e.code === 'KeyR') engineRef.current?.reset()
      if (e.code === 'KeyC') setOverview((value) => !value)
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const clear = () => {
      keys.current.clear()
      touch.current = { throttle: 0, steer: 0, brake: false, boost: false }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [])
  useEffect(() => {
    if (panel || paused || help) {
      keys.current.clear()
      touch.current = { throttle: 0, steer: 0, brake: false, boost: false }
    }
  }, [panel, paused, help])
  useEffect(() => {
    if (!panel && !help) {
      returnFocus.current?.focus()
      modalOpen.current = false
      return
    }
    if (!modalOpen.current) returnFocus.current = document.activeElement as HTMLElement
    modalOpen.current = true
    panelRef.current?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = [
        ...panelRef.current.querySelectorAll<HTMLElement>('button,a,input,select,[tabindex="0"]'),
      ].filter((e) => !e.hasAttribute('disabled'))
      const first = nodes[0],
        last = nodes[nodes.length - 1]
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === panelRef.current)
      ) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [panel, help])
  const start = () => {
    setDriving(true)
    setOverview(false)
    setPaused(false)
    engineRef.current?.unlockSound()
    canvasRef.current?.focus()
  }
  const goStation = (id: StationId) => {
    if (engineRef.current) engineRef.current.teleport(id)
    else setPanel(id)
  }
  const station = stations.find((s) => s.id === panel)
  const nearby = visibleStations.find((s) => s.id === telemetry.nearest)
  const previewLines =
    station?.id === 'about'
      ? [
          profile?.bio || '喜欢创造，喜欢探索。把这座小岛，当成我们认识的起点。',
          '写代码，也收集生活里的小小惊喜。',
        ]
      : station?.id === 'guestbook'
        ? ['路过，停留，留下一点回声。', '一张明信片，就是我们故事的起点。']
        : articles.length
          ? articles.slice(0, 4).map((a) => `${a.title} · ${a.summary || a.publishDate}`)
          : [
              station?.description || '',
              articleState === 'error'
                ? '书架暂时无法连接，仍可进入文章归档。'
                : '正在整理新的故事与灵感。',
            ]
  const name = profile?.name || 'Sakura'
  const close = () => {
    setPanel(null)
    setHelp(false)
  }
  return (
    <main
      className={`drift${driving ? ' drift--driving' : ''}${nearby ? ' drift--nearby' : ''}${dark ? ' drift--night' : ' drift--day'}`}
    >
      <canvas
        key={attempt}
        data-x={telemetry.x.toFixed(3)}
        data-y={telemetry.y.toFixed(3)}
        data-z={telemetry.z.toFixed(3)}
        data-yaw={telemetry.yaw.toFixed(3)}
        data-speed={telemetry.speed}
        data-fps={telemetry.fps}
        data-hits={telemetry.hits}
        className="drift__canvas"
        ref={canvasRef}
        tabIndex={0}
        aria-label="可驾驶的漂流岛 3D 场景，WASD 或方向键驾驶，E 进入站点，R 重置，C 切换镜头"
      />
      <div className="drift__vignette" aria-hidden="true" />
      <header className="drift__brand">
        <span className="drift__stamp">✳</span>
        <div>
          <strong>{name.toUpperCase()} / DRIFT ISLAND</strong>
          <span>A LITTLE WORLD, A LOT OF CURIOSITY.</span>
        </div>
      </header>
      <div className="drift__tools">
        <button
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          aria-label={dark ? '切换到白天' : '切换到夜晚'}
        >
          {dark ? '☀' : '☾'}
          <span>{dark ? '日出' : '入夜'}</span>
        </button>
        <button
          aria-label={sound ? '关闭声音' : '开启声音'}
          aria-pressed={sound}
          onClick={() => {
            setSound((v) => !v)
            if (!sound) setTimeout(() => engineRef.current?.unlockSound(), 0)
          }}
        >
          {sound ? '♫' : '♩'}
          <span>声音</span>
        </button>
        <button aria-label="打开操作说明" onClick={() => setHelp(true)}>
          ？
        </button>
      </div>
      {!driving && (
        <section className="drift__welcome">
          <div className="drift__eyebrow">
            <span /> PERSONAL PLAYGROUND · VOL. 01
          </div>
          <h1>
            欢迎绕个路，
            <br />
            来我的<em>小岛。</em>
          </h1>
          <p>
            {profile?.bio || '我是 Sakura。写代码，也收集生活里的小小惊喜。开一辆车，认识一个人。'}
          </p>
          <div className="drift__welcome-actions">
            <button className="drift__primary" onClick={start} disabled={!ready || !!error}>
              {ready && !error ? '出发，环岛兜风' : '正在准备小岛'}
              <span>↗</span>
            </button>
            <button className="drift__text-button" onClick={() => setPanel('map')}>
              先看看岛屿地图 ↗
            </button>
          </div>
          <div className="drift__ticket">
            <span>ONE WAY TO CURIOSITY</span>
            <b>不限里程 / 随时停靠</b>
            <i>✂</i>
          </div>
        </section>
      )}
      {driving && !nearby && (
        <div className="drift__journey">
          <span className="drift__eyebrow">ON THE ROAD</span>
          <strong>今天，去哪里？</strong>
          <span>
            {telemetry.visited.filter((id) => id !== 'guestbook' || enableGuestbook).length} /{' '}
            {visibleStations.length} 个站点已发现
          </span>
        </div>
      )}
      {driving && nearby && !panel && !help && (
        <aside
          key={nearby.id}
          className="drift__passing"
          aria-label="路过站点提示"
          style={{ '--station-color': nearby.color } as React.CSSProperties}
        >
          <div className="drift__passing-content">
            <span className="drift__arrival-label">
              ✦ 发现一处停靠点 / 0{stations.indexOf(nearby) + 1}
            </span>
            <StationArt id={nearby.id} />
            <small>{nearby.en}</small>
            <strong>{nearby.name}</strong>
            <p>{nearby.description}</p>
            <button onClick={() => engineRef.current?.interact()}>看看这里 ↗</button>
            <span className="drift__parking-note">减速驶入光圈 · 停稳自动展开</span>
          </div>
        </aside>
      )}
      {!ready && !error && (
        <div className="drift__loading" role="status">
          <span className="drift__spinner" />
          正在搭建岛屿 · 准备物理引擎
        </div>
      )}
      {error && (
        <div className="drift__error" role="alert">
          <strong>换一种方式逛逛小岛</strong>
          <p>{error}</p>
          <button
            onClick={() => {
              setError('')
              setReady(false)
              setAttempt((a) => a + 1)
            }}
          >
            重新加载 3D
          </button>
          <button onClick={() => setPanel('map')}>打开文字导航</button>
        </div>
      )}
      <nav className="drift__destinations" aria-label="岛屿站点">
        {visibleStations.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goStation(s.id)}
            aria-label={`前往${s.name}`}
            style={{ '--station-color': s.color } as React.CSSProperties}
          >
            <span className="drift__station-icon">{s.icon}</span>
            <div>
              <small>
                0{i + 1} / {s.en}
              </small>
              <strong>{s.name.split(' / ')[1]}</strong>
            </div>
            <span>{telemetry.visited.includes(s.id) ? '✓' : '↗'}</span>
          </button>
        ))}
      </nav>
      <div className="drift__map">
        <div className="drift__map-title">
          <span>ISLAND NAVIGATOR</span>
          <button aria-label="打开岛屿地图" onClick={() => setPanel('map')}>
            ↗
          </button>
        </div>
        <IslandMap telemetry={telemetry} stations={visibleStations} />
        <span className="drift__map-caption">
          找到金色灵感碎片{' '}
          <b>
            {telemetry.collected}/{tokens.length}
          </b>
        </span>
        <button className="drift__wildlife-link" onClick={() => setPanel('wildlife')}>
          ✦ 岛民图鉴 <span>{telemetry.residents.length || 7} ↗</span>
        </button>
      </div>
      {driving && telemetry.lastHit && !panel && !help && (
        <div className="drift__hit-toast" role="status" key={`${telemetry.hits}`}>
          <span>✧</span>
          <div>
            <strong>
              {telemetry.lastHit.name}{' '}
              {telemetry.lastHit.hp === 0 ? '暂时休息啦' : '被撞得晃了一下'}
            </strong>
            <small>
              −{telemetry.lastHit.damage} HP · 当前 {telemetry.lastHit.hp}/100
            </small>
          </div>
          <b>POW!</b>
        </div>
      )}
      {driving && (
        <>
          <div className="drift__speed">
            <strong>{telemetry.speed.toString().padStart(2, '0')}</strong>
            <span>KM / H</span>
            <div>
              <i style={{ width: `${Math.min(100, (telemetry.speed / 61) * 100)}%` }} />
            </div>
          </div>
          {telemetry.collected === tokens.length && (
            <div className="drift__achievement" role="status">
              ✦ 全部灵感已收集，愿你的旅途充满好奇。
            </div>
          )}
          <DriveJoystick
            disabled={paused || !!panel || help}
            onInput={(input) => {
              touch.current = input
              if (input.throttle || input.steer) engineRef.current?.unlockSound()
            }}
          />
        </>
      )}
      <footer className="drift__dashboard">
        <div className="drift__controls-note">
          {driving ? (
            <>
              <kbd>W A S D</kbd> 驾驶 <kbd>S</kbd> 减速 / 倒车 <kbd>SPACE</kbd> 刹车
            </>
          ) : (
            <>拖动旋转小岛 · 滚轮缩放 · 点击站点探索</>
          )}
        </div>
        <div className="drift__dashboard-actions">
          {driving && (
            <button
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? '继续驾驶' : '暂停驾驶'}
            >
              {paused ? '▶' : 'Ⅱ'}
            </button>
          )}
          <button
            aria-label={overview ? '切换到跟车镜头' : '切换到全岛镜头'}
            onClick={() => {
              if (!driving) start()
              else setOverview((v) => !v)
            }}
          >
            {overview ? '跟车' : '全岛'} <span>◎</span>
          </button>
          <button onClick={() => engineRef.current?.reset()} aria-label="回到出发点">
            复位 ↺
          </button>
          <button onClick={() => setPanel('map')}>目录 ☰</button>
        </div>
      </footer>
      {paused && !panel && !help && (
        <div className="drift__pause">
          <strong>停一下，也很好。</strong>
          <button className="drift__primary" onClick={() => setPaused(false)}>
            继续旅程 ▶
          </button>
        </div>
      )}
      {(panel || help) && (
        <div
          className={`drift__modal-shade${station && !help ? ' drift__modal-shade--arrival' : ''}`}
          onClick={close}
        >
          <section
            className={`drift__panel${station && !help ? ' drift__panel--arrival' : ''}`}
            style={
              station ? ({ '--station-color': station.color } as React.CSSProperties) : undefined
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="drift-panel-title"
            ref={panelRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drift__panel-content">
              <button className="drift__close" onClick={close} aria-label="关闭面板">
                ×
              </button>
              {station && !help && (
                <div className="drift__arrival-header">
                  <span className="drift__arrival-label">DRIFT ISLAND / 到站明信片</span>
                  <StationArt id={station.id} />
                  <span className="drift__arrival-stamp">
                    已停靠
                    <br />
                    BON VOYAGE
                  </span>
                </div>
              )}
              <div className="drift__eyebrow">
                {help
                  ? 'DRIVING MANUAL'
                  : panel === 'wildlife'
                    ? 'MEET THE LOCALS'
                    : station?.en || 'YOUR ISLAND GUIDE'}
              </div>
              <h2 id="drift-panel-title">
                {help
                  ? '开车，也别忘了看风景。'
                  : panel === 'wildlife'
                    ? '小岛的新邻居们。'
                    : station?.name || '四个站点，一座小岛。'}
              </h2>
              {help ? (
                <>
                  <p>
                    路过站点时会掉落一张旅行票。驶入光圈停稳，会自动展开明信片；也可点击卡片或按 E
                    提前查看。
                  </p>
                  <dl className="drift__manual">
                    <div>
                      <dt>WASD / 方向键</dt>
                      <dd>W 前进，A 左转，D 右转；S 前进时减速，停下后倒车</dd>
                    </div>
                    <div>
                      <dt>SPACE / SHIFT</dt>
                      <dd>空格刹车 / Shift 加速</dd>
                    </div>
                    <div>
                      <dt>E / R / C</dt>
                      <dd>停靠站点 / 回到起点 / 切换镜头</dd>
                    </div>
                    <div>
                      <dt>触屏摇杆</dt>
                      <dd>上推前进，下推减速 / 倒车，左右转向；推满向上加速，松手刹车</dd>
                    </div>
                    <div>
                      <dt>鼠标拖动 / 滚轮</dt>
                      <dd>全岛镜头旋转 / 缩放</dd>
                    </div>
                  </dl>
                  <label className="drift__quality">
                    画面质量
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value as IslandSettings['quality'])}
                    >
                      <option value="auto">自动适应设备</option>
                      <option value="high">高画质</option>
                      <option value="low">节能模式</option>
                    </select>
                  </label>
                  <p className="drift__fine-print">
                    声音默认关闭。小岛和车辆均为原创程序建模，所有资源随网站加载。
                  </p>
                </>
              ) : panel === 'wildlife' ? (
                <>
                  <p>
                    七位原创岛民正在森林、道路和海港里散步。碰撞会扣除血量，并出现踉跄、闪光和星星；零血量时休息
                    12 秒后恢复。静止贴近不会持续扣血。
                  </p>
                  <div className="drift__resident-list">
                    {telemetry.residents.map((r, i) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          engineRef.current?.visitResident(r.id)
                          close()
                          start()
                        }}
                        aria-label={`寻找${r.name}`}
                      >
                        <span className="drift__resident-avatar">
                          {['⚙', '◈', '♧', '●', '♧', '⚙', '◈'][i]}
                        </span>
                        <div>
                          <strong>
                            {r.name} <small>{r.kind}</small>
                          </strong>
                          <span className="drift__resident-health">
                            <i style={{ width: `${r.hp}%` }} />
                          </span>
                          <small>{r.recovering ? '正在休息，稍后回来' : `${r.hp} / 100 HP`}</small>
                        </div>
                        <b>↗</b>
                      </button>
                    ))}
                  </div>
                  {telemetry.residents.length === 0 && (
                    <p role="status">
                      {error
                        ? '岛民暂时无法出场，仍可通过目录查看个人介绍与文章。'
                        : '岛民正从各处出发，稍等一下…'}
                    </p>
                  )}
                  <p className="drift__fine-print">
                    森林池塘 · 露营地 · 港口集市 · 北侧观景台。岛屿面积比初版扩大约 2.6 倍。
                  </p>
                </>
              ) : panel === 'map' ? (
                <>
                  <p>喜欢开车就上路，想看内容也可以直接停靠。</p>
                  <div className="drift__atlas">
                    <IslandMap telemetry={telemetry} stations={visibleStations} detailed />
                    <span>104 × 96 · 双环线 / 七位岛民 / 四个个人站点</span>
                  </div>
                  <button className="drift__wildlife-link" onClick={() => setPanel('wildlife')}>
                    ✦ 去认识 7 位新邻居 ↗
                  </button>
                  <div className="drift__directory">
                    {visibleStations.map((s) => (
                      <button key={s.id} onClick={() => goStation(s.id)}>
                        <span>{s.icon}</span>
                        <div>
                          <strong>{s.name}</strong>
                          <small>{s.description}</small>
                        </div>
                        <b>↗</b>
                      </button>
                    ))}
                  </div>
                  {!driving && (
                    <button
                      className="drift__primary"
                      onClick={() => {
                        close()
                        start()
                      }}
                      disabled={!ready || !!error}
                    >
                      开始驾驶 ↗
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p>{station?.description}</p>
                  <div
                    className="drift__preview"
                    tabIndex={0}
                    aria-label="滚动内容预览，悬停或聚焦暂停"
                  >
                    <div className="drift__preview-heading">
                      <span>✦ 岛上的片段</span>
                      <small>悬停暂停 / 自动播放</small>
                    </div>
                    <div className="drift__preview-window">
                      <div className="drift__preview-reel">
                        {[false, true].map((duplicate) => (
                          <div key={String(duplicate)} aria-hidden={duplicate || undefined}>
                            {previewLines.map((line, i) => (
                              <p key={i}>
                                <span>0{i + 1}</span>
                                {line}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {panel === 'about' && (
                    <>
                      <div className="drift__profile">
                        <span>
                          {profile?.avatar ? (
                            <img src={profile.avatar} alt={`${name}的头像`} />
                          ) : (
                            name.slice(0, 1)
                          )}
                        </span>
                        <div>
                          <strong>你好，我是 {name}。</strong>
                          <p>
                            {profile?.bio || '喜欢创造，喜欢探索。把这座小岛，当成我们认识的起点。'}
                          </p>
                        </div>
                      </div>
                      <button
                        className="drift__primary"
                        onClick={() => onNavigate({ name: 'about' })}
                      >
                        认识完整的我 ↗
                      </button>
                    </>
                  )}
                  {(panel === 'notes' || panel === 'work') && (
                    <>
                      <div className="drift__article-list">
                        {articleState === 'loading' ? (
                          <p role="status">正在取回岛上的笔记…</p>
                        ) : articleState === 'error' ? (
                          <p>文章暂时无法连接。你仍可继续探索小岛，或进入归档查看。</p>
                        ) : articles.length === 0 ? (
                          <p>书架正在整理，下一篇故事很快到来。</p>
                        ) : (
                          articles.slice(0, 6).map((a, i) => (
                            <button
                              key={a.id}
                              onClick={() => onNavigate({ name: 'article', params: { id: a.id } })}
                            >
                              <span>0{i + 1}</span>
                              <div>
                                <strong>{a.title}</strong>
                                <small>{a.summary || a.publishDate}</small>
                              </div>
                              <b>↗</b>
                            </button>
                          ))
                        )}
                      </div>
                      <button
                        className="drift__primary"
                        onClick={() => onNavigate({ name: 'archive' })}
                      >
                        查看全部文章 ↗
                      </button>
                    </>
                  )}
                  {panel === 'guestbook' && enableGuestbook && (
                    <>
                      <div className="drift__postcard">
                        <span>HELLO FROM DRIFT ISLAND</span>
                        <p>
                          路过，停留，
                          <br />
                          留下一点回声。
                        </p>
                        <i>✉</i>
                      </div>
                      <button
                        className="drift__primary"
                        onClick={() => onNavigate({ name: 'guestbook' })}
                      >
                        写一张明信片 ↗
                      </button>
                    </>
                  )}
                  {panel === 'about' && enableSocials && profile?.socials && (
                    <div className="drift__socials">
                      {Object.entries(profile.socials)
                        .filter(([, url]) => url)
                        .map(([key, url]) => {
                          const href = key === 'email' ? `mailto:${url}` : url
                          return /^(https?:\/\/|mailto:)/i.test(href) ? (
                            <a key={key} href={href} target="_blank" rel="noreferrer">
                              {key} ↗
                            </a>
                          ) : null
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
