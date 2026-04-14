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
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : score === 4 ? 'Strong' : 'Excellent'
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
  return '?' + params.toString()
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

  const [forgotValue, setForgotValue] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  })
  const [forgotErrors, setForgotErrors] = useState<ForgotErrors>({})
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotCodeSecondsLeft, setForgotCodeSecondsLeft] = useState(0)

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
    setForgotValue({ email: '', code: '', password: '', confirmPassword: '' })
    setForgotErrors({})
    setForgotSubmitting(false)
    setForgotCodeSecondsLeft(0)
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
    if (!loginValue.account.trim()) nextErrors.account = 'Account is required'
    if (!loginValue.password.trim()) nextErrors.password = 'Password is required'
    setLoginErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoginSubmitting(true)
    try {
      const res = await login({ username: loginValue.account.trim(), password: loginValue.password })
      if (res.data.code === 200) {
        useUserStore.getState().login(res.data.data.token, res.data.data.user)
        message.success('Login successful')
        handleNavigate({ name: 'home' })
      } else {
        message.error(res.data.message || 'Login failed')
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
        message.success('Logged out')
        handleNavigate({ name: 'home' })
      }
    })()
  }

  const onRegisterRequestCode = () => {
    if (!isLikelyEmail(registerValue.email)) {
      setRegisterErrors((prev) => ({ ...prev, email: 'Please enter a valid email' }))
      return
    }
    if (registerCodeSecondsLeft > 0) return

    void (async () => {
      try {
        const res = await sendRegisterCode({ email: registerValue.email.trim() })
        if (res.data.code === 200) {
          setRegisterErrors((prev) => ({ ...prev, email: undefined }))
          setRegisterCodeSecondsLeft(60)
          message.success('Verification code sent')
        } else {
          message.error(res.data.message || 'Failed to send verification code')
        }
      } catch (error) {
        console.error(error)
      }
    })()
  }

  const onForgotRequestCode = () => {
    if (!isLikelyEmail(forgotValue.email)) {
      setForgotErrors((prev) => ({ ...prev, email: 'Please enter a valid email' }))
      return
    }
    if (forgotCodeSecondsLeft > 0) return

    void (async () => {
      try {
        const res = await sendResetPasswordCode({ email: forgotValue.email.trim() })
        if (res.data.code === 200) {
          setForgotErrors((prev) => ({ ...prev, email: undefined }))
          setForgotCodeSecondsLeft(60)
          message.success('Verification code sent')
        } else {
          message.error(res.data.message || 'Failed to send verification code')
        }
      } catch (error) {
        console.error(error)
      }
    })()
  }

  const onRegisterSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}
    if (!isLikelyEmail(registerValue.email)) nextErrors.email = 'Please enter a valid email'
    if (registerValue.code.trim().length < 4) nextErrors.code = 'Verification code is required'
    if (!registerValue.password.trim()) nextErrors.password = 'Password is required'
    if (registerValue.password !== registerValue.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match'
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
        message.success('Registration successful')
        handleNavigate({ name: 'home' })
      } else {
        message.error(res.data.message || 'Registration failed')
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
    if (!isLikelyEmail(forgotValue.email)) nextErrors.email = 'Please enter a valid email'
    if (forgotValue.code.trim().length < 4) nextErrors.code = 'Verification code is required'
    if (!forgotValue.password.trim()) nextErrors.password = 'New password is required'
    if (forgotValue.password !== forgotValue.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match'
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
        message.success('Password reset successful')
        setMode('login')
        setLoginValue({ account: forgotValue.email.trim(), password: '' })
        handleNavigate({ name: 'auth' })
      } else {
        message.error(res.data.message || 'Password reset failed')
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
          videoSrc=""
          active={route.name === 'auth'}
          backgroundBlurPx={5}
          zoomScale={1.28}
          zoomBlurPx={0}
        />

        <Suspense
          fallback={
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
              Loading...
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
                onRegisterChange={onRegisterChange}
                onRegisterSubmit={onRegisterSubmit}
                onRegisterRequestCode={onRegisterRequestCode}
                forgotValue={forgotValue}
                forgotErrors={forgotErrors}
                forgotSubmitting={forgotSubmitting}
                forgotStrength={forgotStrength}
                forgotCodeSecondsLeft={forgotCodeSecondsLeft}
                onForgotChange={onForgotChange}
                onForgotSubmit={onForgotSubmit}
                onForgotRequestCode={onForgotRequestCode}
                onModeChange={onModeChange}
              />
              <button className="appBackHome" type="button" onClick={() => handleNavigate({ name: 'home' })} aria-label="Back home">
                Back Home
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
                    name={`Tag: ${route.params.name}`}
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
