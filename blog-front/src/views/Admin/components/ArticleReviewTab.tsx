import { useEffect, useMemo, useState } from 'react'
import { Button, Drawer, Input, Space, Table, Tag, message } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { approveAdminArticle, getAdminArticles, rejectAdminArticle } from '../../../api/site'
import type { AdminArticleReviewItem, ArticleStatus } from '../../../types/api'

const statusColor: Record<ArticleStatus, string> = {
  approved: 'green',
  pending: 'gold',
  rejected: 'red',
  draft: 'default',
}

const statusText: Record<ArticleStatus, string> = {
  approved: '已通过',
  pending: '待审核',
  rejected: '已驳回',
  draft: '草稿',
}

export default function ArticleReviewTab() {
  const [searchText, setSearchText] = useState('')
  const [articles, setArticles] = useState<AdminArticleReviewItem[]>([])
  const [selectedArticle, setSelectedArticle] = useState<AdminArticleReviewItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = async (keyword?: string) => {
    setLoading(true)
    try {
      const res = await getAdminArticles(keyword)
      if (res.data.code === 200) {
        setArticles(res.data.data)
      } else {
        message.error(res.data.message || '加载审核队列失败')
      }
    } catch (error) {
      console.error(error)
      message.error('加载审核队列失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleApprove = async (id: string) => {
    setActingId(id)
    try {
      const res = await approveAdminArticle(id)
      if (res.data.code === 200) {
        message.success('文章已通过审核')
        await load(searchText)
        setSelectedArticle(null)
      } else {
        message.error(res.data.message || '审核通过失败')
      }
    } catch (error) {
      console.error(error)
      message.error('审核通过失败')
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setActingId(id)
    try {
      const res = await rejectAdminArticle(id)
      if (res.data.code === 200) {
        message.success('文章已驳回')
        await load(searchText)
        setSelectedArticle(null)
      } else {
        message.error(res.data.message || '驳回失败')
      }
    } catch (error) {
      console.error(error)
      message.error('驳回失败')
    } finally {
      setActingId(null)
    }
  }

  const filtered = useMemo(() => {
    if (!searchText.trim()) return articles
    const query = searchText.trim().toLowerCase()
    return articles.filter((item) => item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query))
  }, [articles, searchText])

  return (
    <div className="adminModule reviewModule">
      <div className="reviewHeader">
        <h2 className="moduleTitle">文章审核</h2>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索标题或作者"
          className="reviewSearch"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onPressEnter={() => void load(searchText)}
        />
      </div>

      <div className="reviewTableWrapper">
        <Table
          columns={[
            { title: '编号', dataIndex: 'id', width: 160 },
            { title: '标题', dataIndex: 'title' },
            { title: '作者', dataIndex: 'author', width: 140 },
            { title: '提交时间', dataIndex: 'date', width: 180 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 120,
              render: (status: ArticleStatus) => <Tag color={statusColor[status]}>{statusText[status]}</Tag>,
            },
            {
              title: '操作',
              key: 'actions',
              width: 220,
              render: (_: unknown, record: AdminArticleReviewItem) => (
                <Space size="small">
                  <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedArticle(record)}>
                    预览
                  </Button>
                  {record.status !== 'approved' && (
                    <Button type="text" loading={actingId === record.id} style={{ color: '#52c41a' }} onClick={() => void handleApprove(record.id)}>
                      通过
                    </Button>
                  )}
                  {record.status !== 'rejected' && (
                    <Button type="text" danger loading={actingId === record.id} onClick={() => void handleReject(record.id)}>
                      驳回
                    </Button>
                  )}
                </Space>
              ),
            },
          ]}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="reviewTable"
          scroll={{ y: 'calc(100% - 55px)' }}
        />
      </div>

      <Drawer
        title="文章预览"
        placement="right"
        width={640}
        onClose={() => setSelectedArticle(null)}
        open={!!selectedArticle}
        extra={
          selectedArticle ? (
            <Space>
              <Button onClick={() => setSelectedArticle(null)}>关闭</Button>
              <Button type="primary" loading={actingId === selectedArticle.id} onClick={() => void handleApprove(selectedArticle.id)}>
                审核通过
              </Button>
            </Space>
          ) : null
        }
      >
        {selectedArticle && (
          <div className="articlePreview">
            <h1>{selectedArticle.title}</h1>
            <div className="previewMeta">
              <Tag>{selectedArticle.author}</Tag>
              <span>{selectedArticle.date}</span>
            </div>
            <div className="previewContent" style={{ whiteSpace: 'pre-wrap' }}>
              {selectedArticle.content}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
