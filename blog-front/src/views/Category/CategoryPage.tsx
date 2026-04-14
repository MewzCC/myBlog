import { useEffect, useState } from 'react'
import { Empty, Skeleton, message } from 'antd'
import ArticleCard from '../../components/Article/ArticleCard'
import { getArticles } from '../../api/article'
import type { ArticleSummary } from '../../types/api'
import './category-page.css'

export type CategoryPageProps = {
  id: string
  name: string
  onArticleClick: (id: string) => void
}

export default function CategoryPage({ id, name, onArticleClick }: CategoryPageProps) {
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const isTagView = name.startsWith('Tag:') || name.startsWith('标签:')
        const tagName = isTagView ? name.replace(/^Tag:\s*/, '').replace(/^标签:\s*/, '') : undefined
        const res = await getArticles({
          category: !isTagView && id !== 'all' ? id : undefined,
          tag: tagName,
        })
        if (res.data.code === 200) {
          setArticles(res.data.data.list)
          setTotal(res.data.data.total)
        } else {
          message.error(res.data.message || '加载文章失败')
        }
      } catch (error) {
        console.error(error)
        message.error('加载文章失败')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [id, name])

  return (
    <div className="categoryRoot">
      <header className="categoryHeader">
        <h1 className="categoryTitle">{name}</h1>
        <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14 }}>共 {total} 篇文章</div>
      </header>

      <div className="categoryList">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{ padding: 16, background: 'var(--glass-bg)', borderRadius: 20, border: '1px solid var(--border-color)' }}
            >
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))
        ) : articles.length > 0 ? (
          articles.map((article) => <ArticleCard key={article.id} article={article} onClick={() => onArticleClick(article.id)} />)
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '40px 0' }}>
            <Empty description="暂无文章" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </div>
  )
}
