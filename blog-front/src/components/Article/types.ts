export interface User {
  id: string
  name: string
  avatar: string
}

export interface Comment {
  id: string
  user: User
  content: string
  createdAt: string
  likes: number
  dislikes: number
  replies?: Comment[]
  isLiked?: boolean
  isDisliked?: boolean
}

export interface Article {
  id: string
  title: string
  author: User
  publishDate: string
  content: string
  views: number
  tags: string[]
  likes: number
  dislikes: number
  favorites: number
  comments: number
  isLiked?: boolean
  isDisliked?: boolean
  isFavorited?: boolean
}

export interface RelatedArticle {
  id: string
  title: string
  cover: string
  date: string
}
