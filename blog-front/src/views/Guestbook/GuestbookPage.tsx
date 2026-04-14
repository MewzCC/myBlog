import { useState, useEffect } from 'react'
import { Input, Button, List, Avatar } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import './guestbook-page.css'
import { message } from '../../components/Message/MessageProvider'
import { getGuestbookMessages, postGuestbookMessage } from '../../api/guestbook'
import type { GuestbookMessage } from '../../types/api'
import { useSettingsStore } from '../../stores/settingsStore'

export default function GuestbookPage() {
  const [comments, setComments] = useState<GuestbookMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { enableGuestbook } = useSettingsStore()

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const res = await getGuestbookMessages()
      if (res.data.code === 200) {
        setComments(res.data.data)
      }
    } catch (error) {
      message.error('加载留言失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    try {
      setSubmitting(true)
      const res = await postGuestbookMessage(inputValue)
      if (res.data.code === 200) {
        setComments([res.data.data, ...comments])
        setInputValue('')
        message.success('留言成功！')
      } else {
        message.error(res.data.message || '留言失败')
      }
    } catch (error) {
      message.error('留言失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="guestbookRoot">
      <div className="guestbookHeader">
        <h1 className="guestbookTitle">留言板</h1>
        <p className="guestbookSubtitle">欢迎留下你的足迹，无论是建议、鼓励还是闲聊</p>
      </div>

      <div className="guestbookContent">
        {!enableGuestbook ? (
          <div className="guestbookClosed">
            <LockOutlined style={{ fontSize: 24, marginBottom: 8, color: 'rgba(255,255,255,0.5)' }} />
            <p>留言板功能已关闭</p>
          </div>
        ) : (
          <div className="guestbookInput">
            <Input.TextArea
              rows={4}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="写下你想说的话... (留言需审核后显示)"
              style={{ 
                background: 'var(--input-bg)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius-sm)', 
                padding: '16px'
              }}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button type="primary" loading={submitting} onClick={handleSubmit}>
                发表留言
              </Button>
            </div>
          </div>
        )}

        <List
          className="guestbookList"
          loading={loading}
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={item => (
            <List.Item className="guestbookItem">
              <List.Item.Meta
                avatar={<Avatar src={item.user.avatar} size={48} />}
                title={<span className="guestbookUser">{item.user.name}</span>}
                description={
                  <div>
                    <div className="guestbookText">{item.content}</div>
                    <div className="guestbookDate">{item.createdAt}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}
