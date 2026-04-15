import { useState, useEffect, Fragment } from 'react'
import { Timeline } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import './archive-page.css'
import { getArticles } from '../../api/article'
import type { ArticleSummary } from '../../types/api'
import { message } from '../../components/Message/MessageProvider'

export type ArchivePageProps = {
  onArticleClick: (id: string) => void
}

export default function ArchivePage({ onArticleClick }: ArchivePageProps) {
  const [articles, setArticles] = useState<ArticleSummary[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getArticles({ pageSize: 100 })
        if (res.data.code === 200) {
          setArticles(res.data.data.list)
        }
      } catch (error) {
        console.error(error)
        message.error('加载归档失败')
      }
    }

    void fetchData()
  }, [])

  const groupedArticles = articles.reduce((acc, article) => {
    const year = new Date(article.publishDate).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(article)
    return acc
  }, {} as Record<number, ArticleSummary[]>)

  const years = Object.keys(groupedArticles)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="archiveRoot">
      <div className="archiveHeader">
        <h1 className="archiveTitle">归档时光</h1>
        <p className="archiveSubtitle">记录一路走来的每一步，共 {articles.length} 篇文章</p>
      </div>

      <div className="archiveContent">
        <Timeline mode="left">
          {years.map((year) => (
            <Fragment key={year}>
              <Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />} color="red">
                <h2 className="archiveYear">{year}</h2>
              </Timeline.Item>
              {groupedArticles[year].map((article) => (
                <Timeline.Item key={article.id} color="#7c5cff">
                  <div className="archiveItem" onClick={() => onArticleClick(article.id)}>
                    <span className="archiveDate">
                      {new Date(article.publishDate).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                    </span>
                    <span className="archiveItemTitle">{article.title}</span>
                  </div>
                </Timeline.Item>
              ))}
            </Fragment>
          ))}
        </Timeline>
      </div>
    </div>
  )
}
