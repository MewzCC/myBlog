import { useEffect, useState } from 'react'
import ArticleCard from '../../components/Article/ArticleCard'
import './search-page.css'
import { getArticles } from '../../api/article'
import type { ArticleSummary } from '../../types/api'
import { message } from '../../components/Message/MessageProvider'

export type SearchPageProps = {
  query: string
  onArticleClick: (id: string) => void
}

export default function SearchPage({ query, onArticleClick }: SearchPageProps) {
  const [filter, setFilter] = useState('all')
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getArticles({ keyword: query })
        if (res.data.code === 200) {
          setArticles(res.data.data.list)
        } else {
          message.error(res.data.message || '搜索失败')
        }
      } catch (error) {
        message.error('搜索失败')
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      void fetchData()
    } else {
      setArticles([])
    }
  }, [query])

  return (
    <div className="searchRoot">
      <header className="searchHeader">
        <h1 className="searchTitle">“{query}” 的搜索结果</h1>
        <div className="searchFilters">
          <button
            className={`searchFilter ${filter === 'all' ? 'searchFilterActive' : ''}`}
            onClick={() => setFilter('all')}
          >
            综合排序
          </button>
          <button
            className={`searchFilter ${filter === 'latest' ? 'searchFilterActive' : ''}`}
            onClick={() => setFilter('latest')}
          >
            最新发布
          </button>
          <button
            className={`searchFilter ${filter === 'hot' ? 'searchFilterActive' : ''}`}
            onClick={() => setFilter('hot')}
          >
            最多阅读
          </button>
        </div>
      </header>

      <div className="searchList">
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>正在搜索...</div>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.id} article={article} onClick={() => onArticleClick(article.id)} />
          ))
        )}
      </div>
    </div>
  )
}
