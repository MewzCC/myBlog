import { Button, Result } from 'antd'
import './not-found.css'

export default function NotFoundPage() {
  return (
    <div className="notFoundRoot">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <Button type="primary" onClick={() => window.location.href = '/'}>
            返回首页
          </Button>
        }
      />
    </div>
  )
}
