import { useEffect, useState } from 'react'
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Skeleton, Tag, message } from 'antd'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'
import ArticleActions from '../../components/Article/ArticleActions'
import CommentSection from '../../components/Article/CommentSection'
import {
  createArticleComment,
  favoriteArticle,
  getArticleComments,
  getArticleDetail,
  likeArticle,
} from '../../api/article'
import { deleteComment, likeComment, reportComment } from '../../api/comment'
import type { ArticleDetail, Comment } from '../../types/api'
import './article-page.css'

export type ArticlePageProps = {
  id: string
}

export default function ArticlePage({ id }: ArticlePageProps) {
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const [articleRes, commentsRes] = await Promise.all([getArticleDetail(id), getArticleComments(id)])
      if (articleRes.data.code === 200) {
        setArticle(articleRes.data.data)
      } else {
        message.error(articleRes.data.message)
      }
      if (commentsRes.data.code === 200) {
        setComments(commentsRes.data.data)
      }
    } catch (error) {
      console.error(error)
      message.error('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const handleLike = async () => {
    if (!article) return
    try {
      const res = await likeArticle(article.id)
      if (res.data.code === 200) {
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                likes: res.data.data.likes,
                isLiked: res.data.data.isLiked,
              }
            : prev,
        )
      } else {
        message.error(res.data.message || 'Failed to update like')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFavorite = async () => {
    if (!article) return
    try {
      const res = await favoriteArticle(article.id)
      if (res.data.code === 200) {
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                favorites: res.data.data.favorites,
                isFavorited: res.data.data.isFavorited,
              }
            : prev,
        )
      } else {
        message.error(res.data.message || 'Failed to update favorite')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    message.success('Link copied')
  }

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!article) return
    try {
      const res = await createArticleComment(article.id, { content, parentId })
      if (res.data.code === 200) {
        await load()
        message.success(parentId ? 'Reply posted' : 'Comment posted')
      } else {
        message.error(res.data.message || 'Failed to post comment')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await likeComment(commentId)
      if (res.data.code === 200) {
        await load()
      } else {
        message.error(res.data.message || 'Failed to like comment')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await deleteComment(commentId)
      if (res.data.code === 200) {
        await load()
        message.success('Comment deleted')
      } else {
        message.error(res.data.message || 'Failed to delete comment')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleReportComment = async (commentId: string) => {
    try {
      const res = await reportComment(commentId)
      if (res.data.code === 200) {
        message.success('Comment reported')
      } else {
        message.error(res.data.message || 'Failed to report comment')
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="articlePageRoot">
        <div className="articleMain">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
  }

  if (!article) {
    return <div className="articlePageRoot">Article not found.</div>
  }

  return (
    <div className="articlePageRoot">
      <main className="articleMain">
        <Button className="articleBackBtn" type="text" icon={<ArrowLeftOutlined />} onClick={() => window.history.back()} />
        <header className="articleHeader">
          <div className="articleTags">
            {article.tags.map((tag) => (
              <Tag key={tag} color="gold">
                {tag}
              </Tag>
            ))}
          </div>
          <h1 className="articleTitle">{article.title}</h1>
          <div className="articleMeta">
            <span className="metaItem">
              <UserOutlined /> {article.author.name}
            </span>
            <span className="metaItem">
              <CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString()}
            </span>
            <span className="metaItem">
              <EyeOutlined /> {article.views} views
            </span>
            <span className="metaItem">
              <MessageOutlined /> {article.comments} comments
            </span>
          </div>
        </header>

        {article.cover && (
          <div className="articleCover">
            <img src={article.cover} alt={article.title} />
          </div>
        )}

        <div className="articleContent">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {article.content}
          </ReactMarkdown>
        </div>

        <ArticleActions article={article} onLike={handleLike} onFavorite={handleFavorite} onShare={handleShare} />

        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onDeleteComment={handleDeleteComment}
          onReportComment={handleReportComment}
        />
      </main>

      <aside className="articleSide">
        <div className="sideBlock authorBlock">
          <div className="authorAvatar">
            <img src={article.author.avatar} alt={article.author.name} />
          </div>
          <div className="authorName">{article.author.name}</div>
          <div className="authorBio">{article.author.bio || 'This author has not added a bio yet.'}</div>
          <Button type="primary" block>
            关注
          </Button>
        </div>
      </aside>
    </div>
  )
}
