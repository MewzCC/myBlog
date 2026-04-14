import { useState, useRef, useEffect } from 'react'
import { Input, Button, Select, Upload, message, Form } from 'antd'
import { PlusOutlined, ArrowLeftOutlined, SaveOutlined, SendOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons'
import type { RcFile } from 'antd/es/upload'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import { createArticle } from '../../api/article'
import MarkdownToolbar, { MarkdownFormat } from './MarkdownToolbar'
import './article-editor.css'

const { TextArea } = Input
const { Option } = Select

export default function ArticleEditorPage() {
  const [form] = Form.useForm()
  const textAreaRef = useRef<any>(null)
  const [content, setContent] = useState('')
  const [cover, setCover] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // 针对移动端键盘的动态可视视口处理
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty(
          '--visual-viewport-height', 
          `${window.visualViewport.height}px`
        )
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      handleResize() // 初始设置
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const handleFormat = (type: MarkdownFormat) => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea
    if (!textArea) return

    const start = textArea.selectionStart
    const end = textArea.selectionEnd
    const text = textArea.value
    const selected = text.substring(start, end)
    
    let insert = ''

    switch (type) {
      case 'bold':
        insert = `**${selected || '加粗文字'}**`
        break
      case 'italic':
        insert = `*${selected || '斜体文字'}*`
        break
      case 'h1':
        insert = `# ${selected || '标题'}`
        break
      case 'h2':
        insert = `## ${selected || '标题'}`
        break
      case 'h3':
        insert = `### ${selected || '标题'}`
        break
      case 'quote':
        insert = `> ${selected || '引用内容'}`
        break
      case 'ul':
        insert = `- ${selected || '列表项'}`
        break
      case 'ol':
        insert = `1. ${selected || '列表项'}`
        break
      case 'link':
        insert = `[${selected || '链接文字'}](url)`
        break
      case 'image':
        insert = `![${selected || '图片描述'}](url)`
        break
      case 'code':
        if (selected.includes('\n')) {
          insert = `\n\`\`\`\n${selected}\n\`\`\`\n`
        } else {
          insert = `\`${selected || '代码'}\``
        }
        break
    }

    // 简化插入逻辑
    const newText = text.substring(0, start) + insert + text.substring(end)
    setContent(newText)
    
    setTimeout(() => {
      textArea.focus()
      if (!selected) {
        let selStart = start + insert.length
        let selEnd = start + insert.length

        if (type === 'bold') { selStart = start + 2; selEnd = start + insert.length - 2 }
        else if (type === 'italic') { selStart = start + 1; selEnd = start + insert.length - 1 }
        else if (type === 'code' && !insert.includes('\n')) { selStart = start + 1; selEnd = start + insert.length - 1 }
        else if (type === 'link') { selStart = start + 1; selEnd = start + insert.indexOf(']') }
        else if (type === 'image') { selStart = start + 2; selEnd = start + insert.indexOf(']') }
        else if (['h1', 'h2', 'h3', 'quote', 'ul', 'ol'].includes(type)) {
           // # text
           const prefixLen = insert.indexOf(' ') + 1
           selStart = start + prefixLen
           selEnd = start + insert.length
        }
        
        textArea.setSelectionRange(selStart, selEnd)
      } else {
        const newEnd = start + insert.length
        textArea.setSelectionRange(newEnd, newEnd)
      }
    }, 0)
  }

  const handlePublish = async () => {
    try {
      const values = await form.validateFields()
      if (!content.trim()) {
        message.error('文章内容不能为空')
        return
      }

      // 规范化分类（如果是数组，取第一个字符串）
      const category = Array.isArray(values.category) ? values.category[0] : values.category
      const submitData = { ...values, category, content, cover }
      setSubmitting(true)
      const res = await createArticle(submitData)
      if (res.data.code === 200) {
        message.success('文章已发布！')
        window.history.back()
        return
      }
      message.error(res.data.message || '发布失败')
    } catch (error) {
      console.error(error)
      message.error('发布失败')
    } finally {
      setSubmitting(false)
    }
  }

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 文件!')
      return Upload.LIST_IGNORE
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片必须小于 2MB!')
      return Upload.LIST_IGNORE
    }
    
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setCover(reader.result as string)
    }
    return false
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传封面</div>
    </div>
  )

  return (
    <div className="editorRoot">
      <header className="editorHeader">
        <div className="editorHeaderLeft">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => window.history.back()}
            className="backBtn"
          />
          <h1 className="editorTitle">写文章</h1>
        </div>
        <div className="editorActions">
          <Button 
            icon={<SettingOutlined />} 
            className="actionBtn mobile-only" 
            onClick={() => setShowSettings(true)}
          />
          <Button icon={<SaveOutlined />} className="actionBtn desktop-only">保存草稿</Button>
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            loading={submitting}
            onClick={handlePublish}
            className="publishBtn"
          >
            发布
          </Button>
        </div>
      </header>

      <div className="editorBody">
        <div className={`editorForm ${showSettings ? 'open' : ''}`}>
          <div className="mobile-settings-header mobile-only">
             <h3>文章设置</h3>
             <Button type="text" icon={<CloseOutlined />} onClick={() => setShowSettings(false)} style={{ color: '#fff' }} />
          </div>
          <Form form={form} layout="vertical">
            <Form.Item name="title" rules={[{ required: true, message: '请输入标题' }]}>
              <Input placeholder="请输入文章标题..." className="titleInput" maxLength={100} />
            </Form.Item>

            <div className="metaGrid">
              <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select 
                  placeholder="选择或输入分类" 
                  className="metaSelect"
                  showSearch
                  mode="tags"
                  maxTagCount={1}
                  onChange={(val) => {
                    // 强制单选行为以支持自定义输入
                    if (Array.isArray(val) && val.length > 1) {
                      const last = val[val.length - 1]
                      form.setFieldsValue({ category: [last] })
                    }
                  }}
                >
                  <Option value="frontend">前端开发</Option>
                  <Option value="backend">后端技术</Option>
                  <Option value="devops">DevOps</Option>
                  <Option value="ai">人工智能</Option>
                  <Option value="life">生活随笔</Option>
                </Select>
              </Form.Item>

              <Form.Item name="tags" label="标签" rules={[{ required: true, message: '请添加标签' }]}>
                <Select 
                  mode="tags" 
                  placeholder="输入标签按回车或逗号" 
                  className="metaSelect"
                  tokenSeparators={[',']}
                  maxTagCount="responsive"
                >
                  <Option value="React">React</Option>
                  <Option value="Vue">Vue</Option>
                  <Option value="TypeScript">TypeScript</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="文章封面">
              <Upload
                name="cover"
                listType="picture-card"
                className="coverUploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
              >
                {cover ? <img src={cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : uploadButton}
              </Upload>
            </Form.Item>

            <Form.Item name="summary" label="摘要" rules={[{ required: true, message: '请输入摘要' }]}>
              <TextArea 
                placeholder="请输入文章摘要（100-200字）..." 
                autoSize={{ minRows: 3, maxRows: 5 }} 
                className="summaryInput"
                maxLength={300}
                showCount
              />
            </Form.Item>
          </Form>
        </div>

        <div className="editorWorkspace">
          <div className="editorPane inputPane" style={{ display: 'flex', flexDirection: 'column' }}>
            <MarkdownToolbar onFormat={handleFormat} />
            <div style={{ flex: 1, position: 'relative' }}>
              <TextArea
                ref={textAreaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="开始你的创作..."
                className="markdownInput"
                bordered={false}
                style={{ height: '100%', resize: 'none' }}
              />
            </div>
          </div>
          <div className="editorPane previewPane">
            <div className="markdownPreview">
              {content ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="emptyPreview">预览区域</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
