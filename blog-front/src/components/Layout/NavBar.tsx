import { useState, type FormEvent } from 'react'
import type { Route } from '../../types/route'
import './navbar.css'
import { useUserStore } from '../../stores/userStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { EditOutlined, BgColorsOutlined, CheckOutlined } from '@ant-design/icons'
import { Button, Tooltip, Dropdown, type MenuProps } from 'antd'

export type NavBarProps = {
  onNavigate: (route: Route) => void
  onOpenAuth: () => void
  onOpenRegister: () => void
  onLogout: () => void
}

export default function NavBar({ onNavigate, onOpenAuth, onOpenRegister, onLogout }: NavBarProps) {
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const userInfo = useUserStore((s) => s.userInfo)
  const isAdmin = userInfo?.roles?.includes('admin')
  const { theme, setTheme } = useSettingsStore()

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onNavigate({ name: 'search', params: { query: query.trim() } })
      setMobileOpen(false)
    }
  }

  const handleNav = (route: Route) => {
    onNavigate(route)
    setMobileOpen(false)
  }

  const themeItems: MenuProps['items'] = [
    {
      key: 'light',
      label: '浅色模式',
      icon: theme === 'light' ? <CheckOutlined /> : undefined,
      onClick: () => setTheme('light'),
    },
    {
      key: 'dark',
      label: '深色模式',
      icon: theme === 'dark' ? <CheckOutlined /> : undefined,
      onClick: () => setTheme('dark'),
    },
    {
      key: 'system',
      label: '跟随系统',
      icon: theme === 'system' ? <CheckOutlined /> : undefined,
      onClick: () => setTheme('system'),
    },
  ]

  const userItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人主页',
      onClick: () => handleNav({ name: 'user' }),
    },
    {
      key: 'account',
      label: '账号设置',
      onClick: () => handleNav({ name: 'user' }),
    },
    ...(isAdmin
      ? [
          {
            key: 'admin',
            label: '后台管理',
            onClick: () => handleNav({ name: 'admin' }),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      danger: true,
      onClick: onLogout,
    },
  ]

  return (
    <header className="navRoot" role="navigation" aria-label="主导航">
      <div className="navBrand" onClick={() => handleNav({ name: 'home' })}>
        <div className="navLogo" aria-hidden="true" />
        <span className="navName">Sakura BLOG</span>
      </div>

      <nav className="navMenu" aria-label="主菜单">
        <button className="navMenuItem" onClick={() => handleNav({ name: 'home' })}>首页</button>
        <button className="navMenuItem" onClick={() => handleNav({ name: 'category', params: { id: 'all', name: '全部分类' } })}>分类</button>
        <button className="navMenuItem" onClick={() => handleNav({ name: 'archive' })}>归档</button>
        <button className="navMenuItem" onClick={() => handleNav({ name: 'guestbook' })}>留言板</button>
        <button className="navMenuItem" onClick={() => handleNav({ name: 'about' })}>关于</button>
      </nav>

      <div className="navActions">
        <form className="navSearch" onSubmit={onSearchSubmit} role="search">
          <input
            className="navSearchInput"
            placeholder="搜索文章"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="搜索文章"
          />
        </form>
        {isAdmin && (
          <Tooltip title="发布文章">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleNav({ name: 'editor' })} className="navWriteBtn" />
          </Tooltip>
        )}
        <Dropdown menu={{ items: themeItems }} placement="bottomRight" arrow>
          <Button type="text" icon={<BgColorsOutlined />} className="navWriteBtn" aria-label="切换主题" />
        </Dropdown>
        {userInfo ? (
          <Dropdown
            menu={{ items: userItems }}
            trigger={['hover']}
            placement="bottomRight"
            overlayClassName="navUserDropdownOverlay"
            arrow
          >
            <button type="button" className="navUser" aria-label="账户菜单">
              <img src={userInfo.avatar} alt={userInfo.name} className="navUserAvatar" />
              <span className="navUserName">{userInfo.name}</span>
            </button>
          </Dropdown>
        ) : (
          <div className="navAuthActions">
            <button className="navAuthBtn navAuthBtnLogin" type="button" onClick={onOpenAuth}>
              登录
            </button>
            <button className="navAuthBtn navAuthBtnRegister" type="button" onClick={onOpenRegister}>
              注册
            </button>
          </div>
        )}
        <button
          className="navBurger"
          type="button"
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileOpen ? 'true' : 'false'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="navBurgerBar" />
        </button>
      </div>

      {mobileOpen ? (
        <nav className="navMobileMenu" aria-label="移动端菜单">
          <form className="navSearch" onSubmit={onSearchSubmit} role="search">
            <input
              className="navSearchInput"
              placeholder="搜索文章"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索文章"
            />
          </form>
          <button className="navMobileMenuItem" onClick={() => handleNav({ name: 'home' })}>首页</button>
          <button className="navMobileMenuItem" onClick={() => handleNav({ name: 'category', params: { id: 'all', name: '分类' } })}>分类</button>
          <button className="navMobileMenuItem" onClick={() => handleNav({ name: 'tag', params: { id: 'all', name: '标签' } })}>标签</button>
          <button className="navMobileMenuItem" onClick={() => handleNav({ name: 'archive' })}>归档</button>
          <button className="navMobileMenuItem" onClick={() => handleNav({ name: 'about' })}>关于</button>
        </nav>
      ) : null}
    </header>
  )
}
