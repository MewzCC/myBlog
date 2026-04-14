import './article-card.css'
import type { ArticleSummary } from '../../types/api'

export type ArticleCardProps = {
  article: ArticleSummary
  onClick: () => void
}

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <article className="cardRoot" onClick={onClick} aria-label={article.title}>
      {article.cover && <img src={article.cover} alt="" className="cardCover" />}
      <div className="cardContent">
        <h3 className="cardTitle">{article.title}</h3>
        <p className="cardSummary">{article.summary}</p>
        <div className="cardMeta">
          <span>{new Date(article.publishDate).toLocaleDateString()}</span>
          <span>阅读 {article.views}</span>
          <span>点赞 {article.likes}</span>
          <span>评论 {article.comments}</span>
        </div>
        <div className="cardTags">
          {article.tags.map(tag => <span key={tag} className="cardTag">#{tag}</span>)}
        </div>
      </div>
    </article>
  )
}
