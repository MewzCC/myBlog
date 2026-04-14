import { useEffect, useMemo, useRef, useState } from 'react'
import 'artplayer/dist/artplayer.css'
import { message } from '../Message/MessageProvider'
import { useUserStore } from '../../stores/userStore'
import { getVideoDanmaku, postVideoDanmaku, postVideoEvent } from '../../api/video'
import './art-video-player.css'

export type ArtVideoPlayerProps = {
  videoKey: string
  src: string
  poster?: string
  title?: string
  thumbnailsVtt?: string
  enableDanmaku?: boolean
}

type DanmakuSpeed = 'slow' | 'normal' | 'fast'

const speedToDuration = (speed: DanmakuSpeed) => {
  if (speed === 'slow') return 8
  if (speed === 'fast') return 3
  return 5
}

const getViewerId = () => {
  const key = 'sakura:viewerId'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}

const getBlockedKeywords = () => {
  const raw = localStorage.getItem('sakura:danmakuBlockedKeywords')
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    return []
  } catch {
    return []
  }
}

const setBlockedKeywords = (keywords: string[]) => {
  localStorage.setItem('sakura:danmakuBlockedKeywords', JSON.stringify(keywords))
}

export default function ArtVideoPlayer({
  videoKey,
  src,
  poster,
  title,
  thumbnailsVtt,
  enableDanmaku = true,
}: ArtVideoPlayerProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const artRef = useRef<any>(null)
  const userInfo = useUserStore((s) => s.userInfo)
  const userInfoRef = useRef(userInfo)

  const [danmakuOpacity, setDanmakuOpacity] = useState(80)
  const [danmakuFontSize, setDanmakuFontSize] = useState(22)
  const [danmakuSpeed, setDanmakuSpeed] = useState<DanmakuSpeed>('normal')
  const [danmakuMode, setDanmakuMode] = useState<0 | 1 | 2>(0)
  const [danmakuVisible, setDanmakuVisible] = useState(true)
  const [blockedKeywords, setBlockedKeywordsState] = useState<string[]>(() => getBlockedKeywords())

  const blockedKeywordRegex = useMemo(() => {
    const normalized = blockedKeywords
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 30)
    if (!normalized.length) return null
    try {
      return new RegExp(normalized.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i')
    } catch {
      return null
    }
  }, [blockedKeywords])

  const blockedKeywordRegexRef = useRef<RegExp | null>(blockedKeywordRegex)

  useEffect(() => {
    userInfoRef.current = userInfo
  }, [userInfo])

  useEffect(() => {
    blockedKeywordRegexRef.current = blockedKeywordRegex
  }, [blockedKeywordRegex])

  useEffect(() => {
    setBlockedKeywords(blockedKeywords)
  }, [blockedKeywords])

  useEffect(() => {
    let destroyed = false
    let cleanupResize: (() => void) | null = null

    const init = async () => {
      if (!containerRef.current) return

      const ArtplayerModule = await import('artplayer')
      const Artplayer = ArtplayerModule.default

      try {
        ;(Artplayer as any).PLAYBACK_RATE = [0.5, 1, 1.25, 1.5, 2]
      } catch {
        // ignore
      }

      const plugins: any[] = []

      if (thumbnailsVtt) {
        try {
          const vttPluginModule = await import('artplayer-plugin-vtt-thumbnail')
          const vttPlugin = vttPluginModule.default
          plugins.push(
            vttPlugin({
              vtt: thumbnailsVtt,
            }),
          )
        } catch {
          // ignore
        }
      }

      let danmukuPluginName: string | null = null
      let danmukuPluginInstance: any | null = null

      if (enableDanmaku) {
        try {
          const danmukuModule = await import('artplayer-plugin-danmuku')
          const danmukuPlugin = danmukuModule.default
          danmukuPluginName = 'artplayerPluginDanmuku'
          plugins.push(
            danmukuPlugin({
              danmuku: async () => {
                const res = await getVideoDanmaku(videoKey)
                if (res.data.code !== 200) return []
                return res.data.data
              },
              speed: speedToDuration(danmakuSpeed),
              opacity: danmakuOpacity / 100,
              fontSize: danmakuFontSize,
              mode: danmakuMode,
              antiOverlap: true,
              synchronousPlayback: true,
              visible: danmakuVisible,
              emitter: true,
              filter: (danmu: any) => {
                if (!danmu?.text) return false
                if (typeof danmu.text !== 'string') return false
                if (danmu.text.length > 200) return false
                const regex = blockedKeywordRegexRef.current
                if (regex && regex.test(danmu.text)) return false
                return true
              },
              beforeEmit: async (danmu: any) => {
                const viewerId = getViewerId()
                const currentUser = userInfoRef.current
                const name = currentUser?.name || '匿名'
                const payload = {
                  text: danmu.text,
                  time: danmu.time,
                  mode: danmu.mode,
                  color: danmu.color,
                  border: danmu.border,
                  style: danmu.style,
                  user: {
                    id: currentUser?.id || viewerId,
                    name,
                    avatar: currentUser?.avatar,
                    anonymous: !currentUser,
                  },
                }

                const res = await postVideoDanmaku(videoKey, payload)
                return res.data.code === 200
              },
            }),
          )
        } catch {
          // ignore
        }
      }

      const art = new Artplayer({
        id: videoKey,
        container: containerRef.current,
        url: src,
        poster: poster || '',
        theme: '#7c5cff',
        volume: 0.7,
        autoplay: false,
        muted: false,
        autoSize: true,
        setting: true,
        hotkey: true,
        pip: true,
        fullscreen: true,
        fullscreenWeb: true,
        playbackRate: true,
        aspectRatio: true,
        flip: true,
        autoPlayback: true,
        mutex: true,
        moreVideoAttr: {
          playsInline: true,
          preload: 'metadata',
        },
        plugins,
        settings: [
          {
            name: 'danmakuVisible',
            html: '弹幕',
            tooltip: danmakuVisible ? '显示' : '隐藏',
            switch: danmakuVisible,
            onSwitch: (item: any) => {
              const next = !item.switch
              setDanmakuVisible(next)
              return next
            },
          },
          {
            name: 'danmakuSpeed',
            html: '弹幕速度',
            tooltip: danmakuSpeed === 'slow' ? '慢速' : danmakuSpeed === 'fast' ? '快速' : '正常',
            selector: [
              { default: danmakuSpeed === 'slow', html: '慢速', value: 'slow' },
              { default: danmakuSpeed === 'normal', html: '正常', value: 'normal' },
              { default: danmakuSpeed === 'fast', html: '快速', value: 'fast' },
            ],
            onSelect: (item: any) => {
              setDanmakuSpeed(item.value)
              return item.html
            },
          },
          {
            name: 'danmakuMode',
            html: '弹幕位置',
            tooltip: danmakuMode === 1 ? '顶部' : danmakuMode === 2 ? '底部' : '滚动',
            selector: [
              { default: danmakuMode === 0, html: '滚动', value: 0 },
              { default: danmakuMode === 1, html: '顶部', value: 1 },
              { default: danmakuMode === 2, html: '底部', value: 2 },
            ],
            onSelect: (item: any) => {
              setDanmakuMode(item.value)
              return item.html
            },
          },
          {
            name: 'danmakuOpacity',
            html: '弹幕透明度',
            tooltip: `${danmakuOpacity}%`,
            range: [danmakuOpacity, 0, 100, 1],
            onRange: (item: any) => {
              setDanmakuOpacity(item.range[0])
              return `${item.range[0]}%`
            },
          },
          {
            name: 'danmakuFontSize',
            html: '弹幕字号',
            tooltip: `${danmakuFontSize}px`,
            range: [danmakuFontSize, 12, 48, 1],
            onRange: (item: any) => {
              setDanmakuFontSize(item.range[0])
              return `${item.range[0]}px`
            },
          },
          {
            name: 'danmakuFilter',
            html: '屏蔽词',
            tooltip: blockedKeywords.length ? `${blockedKeywords.length} 个` : '未设置',
            selector: [
              { html: '编辑屏蔽词', value: 'edit' },
              { html: '清空', value: 'clear' },
            ],
            onSelect: (item: any) => {
              if (item.value === 'clear') {
                setBlockedKeywordsState([])
                return '未设置'
              }
              const current = blockedKeywords.join(',')
              const next = prompt('请输入屏蔽词（逗号分隔，最多 30 个）', current)
              if (next == null) return blockedKeywords.length ? `${blockedKeywords.length} 个` : '未设置'
              const keywords = next
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 30)
              setBlockedKeywordsState(keywords)
              return keywords.length ? `${keywords.length} 个` : '未设置'
            },
          },
        ],
      })

      artRef.current = art

      if (danmukuPluginName) {
        danmukuPluginInstance = art?.plugins?.[danmukuPluginName]
      }

      const viewerId = getViewerId()

      const report = (event: string, data?: Record<string, any>) => {
        postVideoEvent(videoKey, {
          viewerId,
          event,
          data: data || {},
          at: Date.now(),
        }).catch(() => null)
      }

      art.on('ready', () => {
        report('ready', { src })
      })
      art.on('play', () => {
        report('play')
      })
      art.on('pause', () => {
        report('pause')
      })
      art.on('seek', () => {
        report('seek', { time: art.currentTime })
      })
      art.on('ratechange', () => {
        report('ratechange', { rate: art.playbackRate })
      })
      art.on('volumechange', () => {
        report('volumechange', { volume: art.volume, muted: art.muted })
      })
      art.on('fullscreen', () => {
        report('fullscreen', { value: art.fullscreen })
      })
      art.on('fullscreenWeb', () => {
        report('fullscreenWeb', { value: art.fullscreenWeb })
      })
      art.on('error', (err: any) => {
        report('error', { err: String(err?.message || err || '') })
        message.error('视频加载失败，请检查网络或视频地址')
      })
      art.on('ended', () => {
        report('ended')
      })

      if (danmukuPluginInstance) {
        art.on('artplayerPluginDanmuku:visible', (danmu: any) => {
          const name = danmu?.user?.name
          if (!name) return
          if (!danmu?.$ref) return
          if (danmu.$ref.dataset?.sakuraUserInjected === '1') return
          danmu.$ref.dataset.sakuraUserInjected = '1'
          danmu.$ref.innerHTML = `<span style="opacity:0.72;">${name}：</span>${danmu.$ref.innerHTML}`
        })

        cleanupResize = () => {
          try {
            art.off('resize')
          } catch {
            // ignore
          }
        }

        art.on('resize', () => {
          try {
            const danmakuPlugin = art.plugins?.artplayerPluginDanmuku as { reset?: () => void } | undefined
            danmakuPlugin?.reset?.()
          } catch {
            // ignore
          }
        })
      }

      if (destroyed) {
        try {
          art.destroy(false)
        } catch {
          // ignore
        }
      }
    }

    init().catch(() => {
      message.error('播放器初始化失败')
    })

    return () => {
      destroyed = true
      if (cleanupResize) cleanupResize()
      const art = artRef.current
      artRef.current = null
      try {
        art?.destroy(false)
      } catch {
        // ignore
      }
    }
  }, [videoKey, src, poster, thumbnailsVtt, enableDanmaku])

  useEffect(() => {
    const art = artRef.current
    if (!art?.plugins?.artplayerPluginDanmuku) return
    try {
      art.plugins.artplayerPluginDanmuku.config({
        opacity: danmakuOpacity / 100,
        fontSize: danmakuFontSize,
        speed: speedToDuration(danmakuSpeed),
        mode: danmakuMode,
        visible: danmakuVisible,
      })
    } catch {
      // ignore
    }
  }, [danmakuOpacity, danmakuFontSize, danmakuSpeed, danmakuMode, danmakuVisible])

  const badges = useMemo(() => {
    const items: string[] = []
    if (enableDanmaku) items.push(danmakuVisible ? '弹幕开' : '弹幕关')
    if (thumbnailsVtt) items.push('预览')
    return items
  }, [enableDanmaku, danmakuVisible, thumbnailsVtt])

  return (
    <div className="artVideoRoot">
      <div
        className="artVideoShell"
        ref={shellRef}
        tabIndex={0}
        onFocus={() => {
          try {
            artRef.current?.focus()
          } catch {
            // ignore
          }
        }}
      >
        <div className="artVideoContainer" ref={containerRef} />
        {(title || badges.length) && (
          <div className="artVideoMeta">
            <div className="artVideoTitle">{title || '视频'}</div>
            {badges.length ? (
              <div className="artVideoBadges">
                {badges.map((b) => (
                  <span key={b} className="artVideoBadge">
                    {b}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
