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
        message.error(res.data.message || 'Failed to load review queue')
      }
    } catch (error) {
      console.error(error)
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
        message.success('Article approved')
        await load(searchText)
        setSelectedArticle(null)
      } else {
        message.error(res.data.message || 'Approval failed')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setActingId(id)
    try {
      const res = await rejectAdminArticle(id)
      if (res.data.code === 200) {
        message.success('Article rejected')
        await load(searchText)
        setSelectedArticle(null)
      } else {
        message.error(res.data.message || 'Rejection failed')
      }
    } catch (error) {
      console.error(error)
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
        <h2 className="moduleTitle">Article Review</h2>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search title or author"
          className="reviewSearch"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onPressEnter={() => void load(searchText)}
        />
      </div>

      <div className="reviewTableWrapper">
        <Table
          columns={[
            { title: 'ID', dataIndex: 'id', width: 160 },
            { title: 'Title', dataIndex: 'title' },
            { title: 'Author', dataIndex: 'author', width: 140 },
            { title: 'Submitted At', dataIndex: 'date', width: 180 },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (status: ArticleStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 220,
              render: (_: unknown, record: AdminArticleReviewItem) => (
                <Space size="small">
                  <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedArticle(record)}>
                    Preview
                  </Button>
                  {record.status !== 'approved' && (
                    <Button type="text" loading={actingId === record.id} style={{ color: '#52c41a' }} onClick={() => void handleApprove(record.id)}>
                      Approve
                    </Button>
                  )}
                  {record.status !== 'rejected' && (
                    <Button type="text" danger loading={actingId === record.id} onClick={() => void handleReject(record.id)}>
                      Reject
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
        title="Article Preview"
        placement="right"
        width={640}
        onClose={() => setSelectedArticle(null)}
        open={!!selectedArticle}
        extra={
          selectedArticle ? (
            <Space>
              <Button onClick={() => setSelectedArticle(null)}>Close</Button>
              <Button type="primary" loading={actingId === selectedArticle.id} onClick={() => void handleApprove(selectedArticle.id)}>
                Approve
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
