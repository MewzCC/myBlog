import { useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import { 
  SettingOutlined, 
  AuditOutlined, 
  ArrowLeftOutlined
} from '@ant-design/icons'
import SettingsTab from './components/SettingsTab'
import ArticleReviewTab from './components/ArticleReviewTab'
import './admin-page.css'

const { Sider, Content } = Layout

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('settings')

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="adminRoot">
      <Layout style={{ height: '100vh', background: 'transparent' }}>
        <Sider width={240} className="adminSidebar">
          <div className="adminLogo">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="adminBackBtn" />
            <span>管理后台</span>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key)}
            className="adminMenu"
            items={[
              { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
              { key: 'review', icon: <AuditOutlined />, label: '文章审核' }
            ]}
          />
        </Sider>
        
        <Content className="adminContent">
          {activeTab === 'settings' ? <SettingsTab /> : <ArticleReviewTab />}
        </Content>
      </Layout>
    </div>
  )
}
