import { ConfigProvider, theme } from 'antd'
import { Suspense, lazy, useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  AuthMode,
  ForgotErrors,
  LoginErrors,
  LoginFormValue,
  PasswordStrength,
  RegisterErrors,
  RegisterFormValue,
} from './components/AuthCard/AuthCard'
import NavBar from './components/Layout/NavBar'
import VideoBackground from './components/VideoBackground/VideoBackground'
import SakuraEffect from './components/Effects/SakuraEffect'
import CustomCursor from './components/Effects/CustomCursor'
import { message } from './components/Message/MessageProvider'
import bgMainVideo from './assets/videos/bg_main.mp4'
import type { Route } from './types/route'
import {
  getUserInfo,
  login,
  logout,
  register,
  resetPassword,
  sendRegisterCode,
  sendResetPasswordCode,
} from './api/auth'
import { getSiteSettings } from './api/site'
import { useUserStore } from './stores/userStore'
import { useSettingsStore } from './stores/settingsStore'

const HomePage = lazy(() => import('./views/Home/HomePage'))
const LoginPage = lazy(() => import('./views/LoginPage/LoginPage'))
const ArticlePage = lazy(() => import('./views/Article/ArticlePage'))
const CategoryPage = lazy(() => import('./views/Category/CategoryPage'))
const UserPage = lazy(() => import('./views/User/UserPage'))
const SearchPage = lazy(() => import('./views/Search/SearchPage'))
const ArchivePage = lazy(() => import('./views/Archive/ArchivePage'))
const GuestbookPage = lazy(() => import('./views/Guestbook/GuestbookPage'))
const AboutPage = lazy(() => import('./views/About/AboutPage'))
const ArticleEditorPage = lazy(() => import('./views/Editor/ArticleEditorPage'))
const AdminPage = lazy(() => import('./views/Admin/AdminPage'))
const NotFoundPage = lazy(() => import('./views/NotFound/NotFoundPage'))

const DEFAULT_BACKGROUND_VIDEO = bgMainVideo

const isLikelyEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim())

const getPasswordStrength = (password: string): PasswordStrength => {
  const rules = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^\w\s]/.test(password),
  ]
  const score = rules.reduce((acc, ok) => acc + (ok ? 1 : 0), 0)
  const percent = Math.round((score / rules.length) * 100)
  const label = score <= 1 ? '弱' : score === 2 ? '一般' : score === 3 ? '良好' : score === 4 ? '强' : '很强'
  return { percent, label }
}

const routeToUrl = (route: Route): string => {
  const params = new URLSearchParams()
  params.set('page', route.name)
  if ('params' in route) {
    Object.entries(route.params).forEach(([key, value]) => {
      params.set(key, String(value))
    })
  }
  return `?${params.toString()}`
}

const urlToRoute = (): Route => {
  const params = new URLSearchParams(window.location.search)
  const page = params.get('page')

  switch (page) {
    case 'article':
      return { name: 'article', params: { id: params.get('id') || '' } }
    case 'category':
      return { name: 'category', params: { id: params.get('id') || '', name: params.get('name') || '' } }
    case 'tag':
      return { name: 'tag', params: { id: params.get('id') || '', name: params.get('name') || '' } }
    case 'search':
      return { name: 'search', params: { query: params.get('query') || '' } }
    case 'archive':
      return { name: 'archive' }
    case 'guestbook':
      return { name: 'guestbook' }
    case 'about':
      return { name: 'about' }
    case 'editor':
      return { name: 'editor' }
    case 'user':
      return { name: 'user' }
    case 'auth':
      return { name: 'auth' }
    default:
      if (!page || page === 'home') return { name: 'home' }
      return { name: '404' }
  }
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [route, setRoute] = useState<Route>(urlToRoute)
  const { theme: appTheme, applyServerSettings } = useSettingsStore()
  const [isDark, setIsDark] = useState(true)

  const [loginValue, setLoginValue] = useState<LoginFormValue>({ account: '', password: '' })
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({})
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  const [registerValue, setRegisterValue] = useState<RegisterFormValue>({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  })
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({})
  const [registerSubmitting, setRegisterSubmitting] = useState(false)
  const [registerCodeSecondsLeft, setRegisterCodeSecondsLeft] = useState(0)
  const [registerCodeSending, setRegisterCodeSending] = useState(false)

  const [forgotValue, setForgotValue] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  })
  const [forgotErrors, setForgotErrors] = useState<ForgotErrors>({})
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotCodeSecondsLeft, setForgotCodeSecondsLeft] = useState(0)
  const [forgotCodeSending, setForgotCodeSending] = useState(false)

  const registerStrength = useMemo(() => getPasswordStrength(registerValue.password), [registerValue.password])
  const forgotStrength = useMemo(() => getPasswordStrength(forgotValue.password), [forgotValue.password])

  useEffect(() => {
    const checkSystem = () => window.matchMedia('(prefers-color-scheme: dark)').matches

    const updateTheme = () => {
      const dark = appTheme === 'system' ? checkSystem() : appTheme === 'dark'
      setIsDark(dark)
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    }

    updateTheme()

    if (appTheme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = (event: MediaQueryListEvent) => {
        setIsDark(event.matches)
        document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light')
      }
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [appTheme])

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state) {
        setRoute(event.state)
      } else {
        setRoute(urlToRoute())
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const siteRes = await getSiteSettings()
        if (siteRes.data.code === 200) {
          applyServerSettings(siteRes.data.data)
        }
      } catch (error) {
        console.error(error)
      }

      const token = useUserStore.getState().token
      if (!token) return

      try {
        const userRes = await getUserInfo()
        if (userRes.data.code === 200) {
          useUserStore.getState().login(token, userRes.data.data)
        } else {
          useUserStore.getState().logout()
        }
      } catch (error) {
        console.error(error)
        useUserStore.getState().logout()
      }
    }

    void bootstrap()
  }, [applyServerSettings])

  useEffect(() => {
    if (registerCodeSecondsLeft <= 0) return
    const id = window.setInterval(() => {
      setRegisterCodeSecondsLeft((seconds) => (seconds > 0 ? seconds - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [registerCodeSecondsLeft])

  useEffect(() => {
    if (forgotCodeSecondsLeft <= 0) return
    const id = window.setInterval(() => {
      setForgotCodeSecondsLeft((seconds) => (seconds > 0 ? seconds - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [forgotCodeSecondsLeft])

  const resetAuthState = () => {
    setMode('login')
    setLoginValue({ account: '', password: '' })
    setLoginErrors({})
    setLoginSubmitting(false)
    setRegisterValue({ email: '', code: '', password: '', confirmPassword: '' })
    setRegisterErrors({})
    setRegisterSubmitting(false)
    setRegisterCodeSecondsLeft(0)
    setRegisterCodeSending(false)
    setForgotValue({ email: '', code: '', password: '', confirmPassword: '' })
    setForgotErrors({})
    setForgotSubmitting(false)
    setForgotCodeSecondsLeft(0)
    setForgotCodeSending(false)
  }

  useEffect(() => {
    if (route.name !== 'auth') {
      resetAuthState()
    }
  }, [route.name])

  const handleNavigate = (newRoute: Route) => {
    setRoute(newRoute)
    window.history.pushState(newRoute, '', routeToUrl(newRoute))
  }

  const onLoginChange = (next: LoginFormValue) => {
    setLoginValue(next)
    setLoginErrors((prev) => ({
      ...prev,
      account: next.account !== loginValue.account ? undefined : prev.account,
      password: next.password !== loginValue.password ? undefined : prev.password,
    }))
  }

  const onRegisterChange = (next: RegisterFormValue) => {
    setRegisterValue(next)
    setRegisterErrors((prev) => ({
      ...prev,
      email: next.email !== registerValue.email ? undefined : prev.email,
      code: next.code !== registerValue.code ? undefined : prev.code,
      password: next.password !== registerValue.password ? undefined : prev.password,
      confirmPassword: next.confirmPassword !== registerValue.confirmPassword ? undefined : prev.confirmPassword,
    }))
  }

  const onForgotChange = (next: typeof forgotValue) => {
    setForgotValue(next)
    setForgotErrors((prev) => ({
      ...prev,
      email: next.email !== forgotValue.email ? undefined : prev.email,
      code: next.code !== forgotValue.code ? undefined : prev.code,
      password: next.password !== forgotValue.password ? undefined : prev.password,
      confirmPassword: next.confirmPassword !== forgotValue.confirmPassword ? undefined : prev.confirmPassword,
    }))
  }

  const onLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: LoginErrors = {}
    if (!loginValue.account.trim()) nextErrors.account = '请输入账号'
    if (!loginValue.password.trim()) nextErrors.password = '请输入密码'
    setLoginErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoginSubmitting(true)
    try {
      const res = await login({ username: loginValue.account.trim(), password: loginValue.password })
      if (res.data.code === 200) {
        useUserStore.getState().login(res.data.data.token, res.data.data.user)
        message.success('登录成功')
        handleNavigate({ name: 'home' })
      } else {
        message.error(res.data.message || '登录失败')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoginSubmitting(false)
    }
  }

  const onModeChange = (next: AuthMode) => {
    setMode(next)
    setLoginErrors({})
    setRegisterErrors({})
    setForgotErrors({})
  }

  const onOpenAuth = () => {
    setMode('login')
    handleNavigate({ name: 'auth' })
  }

  const onOpenRegister = () => {
    setMode('register')
    handleNavigate({ name: 'auth' })
  }

  const onLogout = () => {
    void (async () => {
      try {
        await logout()
      } catch (error) {
        console.error(error)
      } finally {
        useUserStore.getState().logout()
        message.success('已退出登录')
        handleNavigate({ name: 'home' })
      }
    })()
  }

  const onRegisterRequestCode = () => {
    if (!isLikelyEmail(registerValue.email)) {
      setRegisterErrors((prev) => ({ ...prev, email: '请输入正确的邮箱地址' }))
      return
    }
    if (registerCodeSecondsLeft > 0 || registerCodeSending) return

    void (async () => {
      setRegisterCodeSecondsLeft(60)
      setRegisterCodeSending(true)
      try {
        const res = await sendRegisterCode({ email: registerValue.email.trim() })
        if (res.data.code === 200) {
          setRegisterErrors((prev) => ({ ...prev, email: undefined }))
          const debugCode = res.data.data?.debugCode
          message.success(debugCode ? `开发环境验证码：${debugCode}` : res.data.message || '验证码已发送')
        } else {
          setRegisterCodeSecondsLeft(0)
          message.error(res.data.message || '验证码发送失败')
        }
      } catch (error) {
        setRegisterCodeSecondsLeft(0)
        console.error(error)
      } finally {
        setRegisterCodeSending(false)
      }
    })()
  }

  const onForgotRequestCode = () => {
    if (!isLikelyEmail(forgotValue.email)) {
      setForgotErrors((prev) => ({ ...prev, email: '请输入正确的邮箱地址' }))
      return
    }
    if (forgotCodeSecondsLeft > 0 || forgotCodeSending) return

    void (async () => {
      setForgotCodeSecondsLeft(60)
      setForgotCodeSending(true)
      try {
        const res = await sendResetPasswordCode({ email: forgotValue.email.trim() })
        if (res.data.code === 200) {
          setForgotErrors((prev) => ({ ...prev, email: undefined }))
          const debugCode = res.data.data?.debugCode
          message.success(debugCode ? `开发环境验证码：${debugCode}` : res.data.message || '验证码已发送')
        } else {
          setForgotCodeSecondsLeft(0)
          message.error(res.data.message || '验证码发送失败')
        }
      } catch (error) {
        setForgotCodeSecondsLeft(0)
        console.error(error)
      } finally {
        setForgotCodeSending(false)
      }
    })()
  }

  const onRegisterSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}
    if (!isLikelyEmail(registerValue.email)) nextErrors.email = '请输入正确的邮箱地址'
    if (registerValue.code.trim().length < 4) nextErrors.code = '请输入验证码'
    if (!registerValue.password.trim()) nextErrors.password = '请输入密码'
    if (registerValue.password !== registerValue.confirmPassword) nextErrors.confirmPassword = '两次输入的密码不一致'
    setRegisterErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setRegisterSubmitting(true)
    try {
      const res = await register({
        email: registerValue.email.trim(),
        code: registerValue.code.trim(),
        password: registerValue.password,
      })
      if (res.data.code === 200) {
        useUserStore.getState().login(res.data.data.token, res.data.data.user)
        message.success('注册成功')
        handleNavigate({ name: 'home' })
      } else {
        message.error(res.data.message || '注册失败')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setRegisterSubmitting(false)
    }
  }

  const onForgotSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: ForgotErrors = {}
    if (!isLikelyEmail(forgotValue.email)) nextErrors.email = '请输入正确的邮箱地址'
    if (forgotValue.code.trim().length < 4) nextErrors.code = '请输入验证码'
    if (!forgotValue.password.trim()) nextErrors.password = '请输入新密码'
    if (forgotValue.password !== forgotValue.confirmPassword) nextErrors.confirmPassword = '两次输入的密码不一致'
    setForgotErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setForgotSubmitting(true)
    try {
      const res = await resetPassword({
        email: forgotValue.email.trim(),
        code: forgotValue.code.trim(),
        password: forgotValue.password,
      })
      if (res.data.code === 200) {
        message.success('密码重置成功')
        setMode('login')
        setLoginValue({ account: forgotValue.email.trim(), password: '' })
        handleNavigate({ name: 'auth' })
      } else {
        message.error(res.data.message || '密码重置失败')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setForgotSubmitting(false)
    }
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f75ff',
          colorInfo: '#61d6ff',
          colorBgBase: isDark ? '#071427' : '#f3fafc',
          colorTextBase: isDark ? 'rgba(242, 248, 255, 0.96)' : 'rgba(16, 39, 63, 0.94)',
        },
      }}
    >
      <div className="appViewport">
        <CustomCursor />
        <SakuraEffect />
        <VideoBackground
          videoSrc={DEFAULT_BACKGROUND_VIDEO}
          active={route.name === 'auth'}
          backgroundBlurPx={5}
          zoomScale={1.28}
          zoomBlurPx={0}
        />

        <Suspense
          fallback={
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
              正在加载...
            </div>
          }
        >
          {route.name === 'auth' ? (
            <>
              <LoginPage
                mode={mode}
                loginValue={loginValue}
                loginErrors={loginErrors}
                loginSubmitting={loginSubmitting}
                onLoginChange={onLoginChange}
                onLoginSubmit={onLoginSubmit}
                registerValue={registerValue}
                registerErrors={registerErrors}
                registerSubmitting={registerSubmitting}
                registerStrength={registerStrength}
                registerCodeSecondsLeft={registerCodeSecondsLeft}
                registerCodeSending={registerCodeSending}
                onRegisterChange={onRegisterChange}
                onRegisterSubmit={onRegisterSubmit}
                onRegisterRequestCode={onRegisterRequestCode}
                forgotValue={forgotValue}
                forgotErrors={forgotErrors}
                forgotSubmitting={forgotSubmitting}
                forgotStrength={forgotStrength}
                forgotCodeSecondsLeft={forgotCodeSecondsLeft}
                forgotCodeSending={forgotCodeSending}
                onForgotChange={onForgotChange}
                onForgotSubmit={onForgotSubmit}
                onForgotRequestCode={onForgotRequestCode}
                onModeChange={onModeChange}
              />
              <button className="appBackHome" type="button" onClick={() => handleNavigate({ name: 'home' })} aria-label="返回首页">
                返回首页
              </button>
            </>
          ) : route.name === 'editor' ? (
            <ArticleEditorPage />
          ) : (
            <>
              <NavBar
                onNavigate={handleNavigate}
                onOpenAuth={onOpenAuth}
                onOpenRegister={onOpenRegister}
                onLogout={onLogout}
              />
              <div key={route.name} className="appView">
                {route.name === 'home' && <HomePage onNavigate={handleNavigate} onOpenAuth={onOpenAuth} />}
                {route.name === 'article' && <ArticlePage id={route.params.id} />}
                {route.name === 'category' && (
                  <CategoryPage
                    id={route.params.id}
                    name={route.params.name}
                    onArticleClick={(id) => handleNavigate({ name: 'article', params: { id } })}
                  />
                )}
                {route.name === 'tag' && (
                  <CategoryPage
                    id={route.params.id}
                    name={`标签: ${route.params.name}`}
                    onArticleClick={(id) => handleNavigate({ name: 'article', params: { id } })}
                  />
                )}
                {route.name === 'user' && <UserPage onNavigate={handleNavigate} />}
                {route.name === 'admin' && <AdminPage />}
                {route.name === 'search' && (
                  <SearchPage
                    query={route.params.query}
                    onArticleClick={(id) => handleNavigate({ name: 'article', params: { id } })}
                  />
                )}
                {route.name === 'archive' && (
                  <ArchivePage onArticleClick={(id) => handleNavigate({ name: 'article', params: { id } })} />
                )}
                {route.name === 'guestbook' && <GuestbookPage />}
                {route.name === 'about' && <AboutPage />}
                {route.name === '404' && <NotFoundPage />}
              </div>
            </>
          )}
        </Suspense>
      </div>
    </ConfigProvider>
  )
}
