import { 
  LikeOutlined, LikeFilled, 
  StarOutlined, StarFilled, 
  ShareAltOutlined
} from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import type { ArticleDetail } from '../../types/api'
import './article-actions.css'

interface ArticleActionsProps {
  article: ArticleDetail
  onLike: () => void
  onFavorite: () => void
  onShare: () => void
}

export default function ArticleActions({ 
  article, 
  onLike, 
  onFavorite, 
  onShare 
}: ArticleActionsProps) {
  return (
    <div className="articleActions">
      <div className="actionGroup">
        <Tooltip title={article.isLiked ? "取消点赞" : "点赞"}>
          <Button 
            type={article.isLiked ? "primary" : "default"} 
            shape="circle" 
            icon={article.isLiked ? <LikeFilled /> : <LikeOutlined />} 
            size="large"
            onClick={onLike}
            className="actionBtn"
          />
        </Tooltip>
        <span className="actionCount">{article.likes}</span>
      </div>

      <div className="actionGroup">
        <Tooltip title={article.isFavorited ? "取消收藏" : "收藏"}>
          <Button 
            type={article.isFavorited ? "primary" : "default"} 
            shape="circle" 
            icon={article.isFavorited ? <StarFilled /> : <StarOutlined />} 
            size="large"
            onClick={onFavorite}
            className={`actionBtn ${article.isFavorited ? 'favorited' : ''}`}
          />
        </Tooltip>
        <span className="actionCount">{article.favorites}</span>
      </div>

      <div className="actionGroup">
        <Tooltip title="分享文章">
          <Button 
            shape="circle" 
            icon={<ShareAltOutlined />} 
            size="large"
            onClick={onShare}
            className="actionBtn"
          />
        </Tooltip>
      </div>
    </div>
  )
}
