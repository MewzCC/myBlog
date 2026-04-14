import { useState } from 'react'
import { Tooltip, Button } from 'antd'
import { 
  BoldOutlined, 
  ItalicOutlined, 
  OrderedListOutlined, 
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  CodeOutlined,
  FontSizeOutlined,
  PlusOutlined,
  CloseOutlined
} from '@ant-design/icons'
import './markdown-toolbar.css'

export type MarkdownFormat = 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'quote' | 'link' | 'image' | 'code' | 'ul' | 'ol'

interface MarkdownToolbarProps {
  onFormat: (type: MarkdownFormat) => void
}

export default function MarkdownToolbar({ onFormat }: MarkdownToolbarProps) {
  const [expanded, setExpanded] = useState(false)

  const tools: { type: MarkdownFormat; icon: React.ReactNode; tip: string }[] = [
    { type: 'h1', icon: <span style={{ fontWeight: 700, fontSize: 16 }}>H1</span>, tip: '一级标题' },
    { type: 'h2', icon: <span style={{ fontWeight: 700, fontSize: 14 }}>H2</span>, tip: '二级标题' },
    { type: 'h3', icon: <span style={{ fontWeight: 700, fontSize: 13 }}>H3</span>, tip: '三级标题' },
    { type: 'bold', icon: <BoldOutlined />, tip: '加粗' },
    { type: 'italic', icon: <ItalicOutlined />, tip: '斜体' },
    { type: 'quote', icon: <FontSizeOutlined style={{ transform: 'rotate(90deg)' }} />, tip: '引用' },
    { type: 'ul', icon: <UnorderedListOutlined />, tip: '无序列表' },
    { type: 'ol', icon: <OrderedListOutlined />, tip: '有序列表' },
    { type: 'link', icon: <LinkOutlined />, tip: '链接' },
    { type: 'image', icon: <PictureOutlined />, tip: '图片' },
    { type: 'code', icon: <CodeOutlined />, tip: '代码块' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {expanded && <div className="mobile-toolbar-overlay" onClick={() => setExpanded(false)} />}
      
      <div className={`markdownToolbar ${expanded ? 'mobile-expanded' : ''}`}>
        <div className="toolbar-scroll-container">
          {tools.map((tool) => (
            <Tooltip key={tool.type} title={tool.tip} mouseEnterDelay={0.5} trigger={['hover']}>
              <Button 
                type="text" 
                icon={tool.icon} 
                onClick={() => {
                  onFormat(tool.type)
                }}
                className="toolbarBtn"
              />
            </Tooltip>
          ))}
        </div>
      </div>
      
      {/* Mobile Toggle Button */}
      <Button 
        className="mobile-toolbar-toggle"
        type="primary"
        shape="circle"
        icon={expanded ? <CloseOutlined /> : <PlusOutlined />}
        size="large"
        onClick={() => setExpanded(!expanded)}
      />
    </>
  )
}
