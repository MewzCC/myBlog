export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface User {
  id: string
  name: string
  avatar: string
  roles?: string[]
  bio?: string
  socials?: {
    github?: string
    twitter?: string
    bilibili?: string
    douyin?: string
    email?: string
  }
  stats?: {
    articles: number
    tags: number
    categories: number
  }
}

export interface AuthResponse {
  token: string
  user: User
}

export interface VerificationCodeRequest {
  email: string
}

export interface VerificationCodeResult {
  delivery: 'email' | 'mock'
  debugCode?: string | null
}

export interface RegisterRequest {
  email: string
  code: string
  password: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  password: string
}

export interface ArticleSummary {
  id: string
  title: string
  summary: string
  cover: string
  publishDate: string
  views: number
  likes: number
  comments: number
  tags: string[]
  category?: string
  author: User
  status?: ArticleStatus
}

export interface ArticleDetail extends ArticleSummary {
  content: string
  favorites: number
  isLiked: boolean
  isFavorited: boolean
}

export interface CreateArticleRequest {
  title: string
  content: string
  summary: string
  cover?: string
  category: string
  tags: string[]
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
  likes: number
  replies?: Comment[]
}

export interface ArticleListResponse {
  list: ArticleSummary[]
  total: number
}

export interface GuestbookMessage {
  id: string
  content: string
  createdAt: string
  user: User
}

export interface Category {
  id: string
  name: string
  count: number
}

export interface Tag {
  id: string
  name: string
  count: number
}

export type ArticleStatus = 'approved' | 'pending' | 'rejected' | 'draft'

export interface SiteSettings {
  enableGuestbook: boolean
  enableUserEdit: boolean
  enableSocials: boolean
}

export interface AdminArticleReviewItem {
  id: string
  title: string
  author: string
  date: string
  status: ArticleStatus
  content: string
}

export interface CommentCreateRequest {
  content: string
  parentId?: string
}

export interface CommentActionResponse {
  likes: number
  isLiked: boolean
}

export interface VideoUploadResponse {
  videoKey: string
  url: string
  mime: string
  size: number
  poster?: string
  thumbnailsVtt?: string
}

export interface VideoDanmakuUser {
  id: string
  name: string
  avatar?: string
  anonymous: boolean
}

export interface VideoDanmakuItem {
  text: string
  time?: number
  mode?: 0 | 1 | 2
  color?: string
  border?: boolean
  style?: Record<string, any>
  user?: VideoDanmakuUser
}

export interface VideoEventPayload {
  viewerId: string
  event: string
  at: number
  data?: Record<string, any>
}

export interface VideoAnalyticsItem {
  videoKey: string
  plays: number
  uniqueViewers: number
  events: number
  lastEventAt: number
}
