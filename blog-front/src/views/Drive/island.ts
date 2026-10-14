export type StationId = 'about' | 'work' | 'notes' | 'guestbook'
export const islandSize = { width: 104, depth: 96 }
export type ResidentTelemetry = {
  id: string
  name: string
  kind: string
  x: number
  z: number
  hp: number
  recovering: boolean
  motion?: 'walking' | 'ragdoll' | 'getting-up'
  bodyParts?: number
  jointError?: number
  tilt?: number
  physicalParts?: number
  activity?: 'wandering' | 'resting' | 'ragdoll' | 'getting-up'
  gaitPhase?: number
  legAngles?: number[]
}
export const stations = [
  {
    id: 'about',
    name: '灯塔 / 关于我',
    en: 'THE LIGHTHOUSE',
    icon: '◉',
    x: -17,
    z: -17,
    color: '#ffbd69',
    description: '每一座岛，都有一个故事。认识这座小岛的主人。',
  },
  {
    id: 'work',
    name: '车库 / 创作实验',
    en: 'MAKER GARAGE',
    icon: '⚒',
    x: 17,
    z: -17,
    color: '#81dbc5',
    description: '好奇心是引擎，代码是零件。这里停放我的技术探索。',
  },
  {
    id: 'notes',
    name: '书店 / 文章',
    en: 'LITTLE BOOKSHOP',
    icon: '▤',
    x: 17,
    z: 17,
    color: '#ff9580',
    description: '一些代码，一些生活，一些值得绕路的想法。',
  },
  {
    id: 'guestbook',
    name: '邮局 / 留言',
    en: 'POST OFFICE',
    icon: '✉',
    x: -17,
    z: 17,
    color: '#a6bafa',
    description: '旅途愉快。临走之前，留一张明信片吧。',
  },
] as const
export const spawn = { x: 0, y: 1.1, z: 8 }
export const tokens = [
  [0, 15],
  [10, 18],
  [18, 8],
  [18, -6],
  [9, -18],
  [-5, -18],
  [-18, -7],
  [-18, 5],
] as const
export type DriveInput = { throttle: number; steer: number; brake: boolean; boost: boolean }
export type IslandTelemetry = {
  intro?: number
  introPhase?: 'orbit' | 'approach' | 'landed'
  hour?: number
  daylight?: number
  y: number
  x: number
  z: number
  yaw: number
  speed: number
  nearest: StationId | null
  collected: number
  visited: StationId[]
  fps: number
  residents: ResidentTelemetry[]
  hits: number
  lastHit: { name: string; damage: number; hp: number } | null
}
export type IslandSettings = {
  dayCycle?: boolean
  dark: boolean
  driving: boolean
  overview: boolean
  paused: boolean
  quality: 'auto' | 'high' | 'low'
  sound: boolean
}
export const initialTelemetry: IslandTelemetry = {
  y: spawn.y,
  x: spawn.x,
  z: spawn.z,
  yaw: 0,
  speed: 0,
  nearest: null,
  collected: 0,
  visited: [],
  fps: 0,
  residents: [],
  hits: 0,
  lastHit: null,
}
