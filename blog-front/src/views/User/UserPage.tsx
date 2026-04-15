import { useState } from 'react'
import { Avatar, Tag, Switch } from 'antd'
import { UserOutlined, SettingOutlined, SafetyCertificateOutlined, StarOutlined, HistoryOutlined } from '@ant-design/icons'
import './user-page.css'
import { useUserStore } from '../../stores/userStore'
import { useSettingsStore } from '../../stores/settingsStore'
import UserProfileEdit from './UserProfileEdit'
import DemoChart from '../../components/Charts/DemoChart'

interface UserPageProps {
  onNavigate?: (route: any) => void
}

export default function UserPage({ onNavigate }: UserPageProps) {
  const [tab, setTab] = useState('profile')
  const { enableSakura, toggleSakura } = useSettingsStore()
  const userInfo = useUserStore((s) => s.userInfo)
  const isAdmin = userInfo?.roles?.includes('admin')

  const handleAdminClick = () => {
    if (onNavigate) {
      onNavigate({ name: 'admin' })
    }
  }

  return (
    <div className="userRoot">
      <aside className="userSide">
        <div
          style={{
            padding: '0 16px 20px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 16,
          }}
        >
          <Avatar
            size={80}
            src={userInfo?.avatar}
            icon={<UserOutlined />}
            style={{ marginBottom: 12, border: '2px solid rgba(255,255,255,0.2)' }}
          />
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {userInfo?.name || '未登录'}
            {isAdmin && (
              <Tag color="gold" style={{ margin: 0 }}>
                管理员
              </Tag>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{userInfo?.bio || '暂无简介'}</div>
        </div>

        <div className="userMenu">
          <div className={`userMenuItem ${tab === 'profile' ? 'userMenuItemActive' : ''}`} onClick={() => setTab('profile')}>
            <UserOutlined style={{ marginRight: 8 }} />
            个人资料
          </div>
          <div className={`userMenuItem ${tab === 'favorites' ? 'userMenuItemActive' : ''}`} onClick={() => setTab('favorites')}>
            <StarOutlined style={{ marginRight: 8 }} />
            我的收藏
          </div>
          <div className={`userMenuItem ${tab === 'history' ? 'userMenuItemActive' : ''}`} onClick={() => setTab('history')}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            浏览历史
          </div>
          <div className={`userMenuItem ${tab === 'settings' ? 'userMenuItemActive' : ''}`} onClick={() => setTab('settings')}>
            <SettingOutlined style={{ marginRight: 8 }} />
            账号设置
          </div>
          {isAdmin && (
            <div className="userMenuItem" onClick={handleAdminClick} style={{ marginTop: 16, color: '#ffd666' }}>
              <SafetyCertificateOutlined style={{ marginRight: 8 }} />
              系统管理
            </div>
          )}
        </div>
      </aside>

      <main className="userMain">
        {tab === 'profile' && (
          <div>
            <h2 className="userTitle">个人资料</h2>
            <p>管理你的基本信息，修改后会自动保存。</p>
            <div style={{ marginTop: 20 }}>
              <UserProfileEdit />
            </div>
          </div>
        )}
        {tab === 'favorites' && (
          <div>
            <h2 className="userTitle">我的收藏</h2>
            <p>这里会展示你收藏的文章列表。</p>
          </div>
        )}
        {tab === 'history' && (
          <div>
            <h2 className="userTitle">浏览历史</h2>
            <p>最近阅读趋势</p>
            <div style={{ marginTop: 20 }}>
              <DemoChart />
            </div>
          </div>
        )}
        {tab === 'settings' && (
          <div>
            <h2 className="userTitle">账号设置</h2>
            <p>你可以在这里调整个性化显示选项。</p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>樱花特效</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    开启或关闭全站樱花飘落效果
                  </div>
                </div>
                <Switch checked={enableSakura} onChange={toggleSakura} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
