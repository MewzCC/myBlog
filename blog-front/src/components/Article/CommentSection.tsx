import { useState } from 'react'
import { 
  Button, Input, Space, 
  Popconfirm, message, List, Avatar
} from 'antd'
import { 
  LikeOutlined, 
  MessageOutlined, DeleteOutlined, 
  WarningOutlined 
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import type { Comment } from '../../types/api'
import './comment-section.css'

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string, parentId?: string) => void
  onLikeComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
  onReportComment: (commentId: string) => void
}

const { TextArea } = Input

export default function CommentSection({
  comments,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  onReportComment
}: CommentSectionProps) {
  const [inputValue, setInputValue] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [replyValue, setReplyValue] = useState('')

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      message.warning('请输入评论内容')
      return
    }
    onAddComment(inputValue)
    setInputValue('')
  }

  const handleReplySubmit = () => {
    if (!replyValue.trim()) {
      message.warning('请输入回复内容')
      return
    }
    if (replyTo) {
      onAddComment(replyValue, replyTo.id)
      setReplyTo(null)
      setReplyValue('')
    }
  }

  const CommentAction = ({ comment }: { comment: Comment }) => (
    <Space size="small">
      <span onClick={() => onLikeComment(comment.id)} className="commentAction">
        {/* API doesn't have isLiked yet, assume local state or remove filled for now */}
        <LikeOutlined />
        <span className="actionNum">{comment.likes || 0}</span>
      </span>
      <span onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)} className="commentAction">
        <MessageOutlined /> 回复
      </span>
      {/* Mock Admin Privilege */}
      <Popconfirm title="确定删除这条评论吗？" onConfirm={() => onDeleteComment(comment.id)}>
        <span className="commentAction delete">
          <DeleteOutlined /> 删除
        </span>
      </Popconfirm>
      <span onClick={() => onReportComment(comment.id)} className="commentAction report">
        <WarningOutlined /> 举报
      </span>
    </Space>
  )

  return (
    <div className="commentSection">
      <h2 className="sectionTitle">
        评论区 <span className="commentCount">({comments.length})</span>
      </h2>

      {/* Main Input */}
      <div className="commentInputWrapper">
        <div className="inputHeader">
          <span className="inputTitle">发表评论</span>
          <Space>
            <Button type="text" size="small">B</Button>
            <Button type="text" size="small">I</Button>
            <Button type="text" size="small">Code</Button>
          </Space>
        </div>
        <TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="分享你的见解..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="commentTextarea"
        />
        <div className="inputFooter">
          <span className="tip">支持 Markdown 语法</span>
          <Button type="primary" onClick={handleSubmit}>发表评论</Button>
        </div>
      </div>

      {/* Comment List */}
      <List
        className="commentList"
        itemLayout="vertical"
        dataSource={comments}
        renderItem={(item) => (
          <List.Item className="commentItem">
            <List.Item.Meta
              avatar={<Avatar src={item.user.avatar} size={48} />}
              title={
                <div className="commentUser">
                  <span className="userName">{item.user.name}</span>
                  <span className="commentTime">{item.createdAt}</span>
                </div>
              }
              description={
                <div className="commentContent">
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {item.content}
                    </ReactMarkdown>
                  </div>
                  <div className="commentActions">
                    <CommentAction comment={item} />
                  </div>
                  
                  {/* Reply Input */}
                  {replyTo?.id === item.id && (
                    <div className="replyInput">
                      <TextArea
                        value={replyValue}
                        onChange={e => setReplyValue(e.target.value)}
                        placeholder={`回复 @${item.user.name}...`}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        className="commentTextarea"
                      />
                      <div style={{ marginTop: 8, textAlign: 'right' }}>
                        <Button size="small" style={{ marginRight: 8 }} onClick={() => setReplyTo(null)}>取消</Button>
                        <Button type="primary" size="small" onClick={handleReplySubmit}>回复</Button>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {item.replies && item.replies.length > 0 && (
                    <div className="nestedReplies">
                      <List
                        dataSource={item.replies}
                        renderItem={(reply) => (
                          <List.Item className="nestedReplyItem">
                            <List.Item.Meta
                              avatar={<Avatar src={reply.user.avatar} size={32} />}
                              title={
                                <div className="commentUser">
                                  <span className="userName">{reply.user.name}</span>
                                  <span className="commentTime">{reply.createdAt}</span>
                                </div>
                              }
                              description={
                                <div>
                                  <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                      {reply.content}
                                    </ReactMarkdown>
                                  </div>
                                  <div className="commentActions">
                                    <CommentAction comment={reply} />
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}
