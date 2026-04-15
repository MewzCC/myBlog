import { useEffect, useState, useCallback } from 'react'
import { message } from '../../components/Message/MessageProvider'
import { debounce } from '../../utils/common'
import { Upload, Modal, Input } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { PlusOutlined } from '@ant-design/icons'
import './user-profile-edit.css'
import { updateUserInfo } from '../../api/user'
import { useUserStore } from '../../stores/userStore'
import { useSettingsStore } from '../../stores/settingsStore'
import type { User } from '../../types/api'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const SYSTEM_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Precious',
]

export default function UserProfileEdit() {
  const userInfo = useUserStore((s) => s.userInfo)
  const login = useUserStore((s) => s.login)
  const token = useUserStore((s) => s.token)
  const { enableUserEdit } = useSettingsStore()

  const isAdmin = userInfo?.roles?.includes('admin')
  const showFullEdit = isAdmin || enableUserEdit

  const [profile, setProfile] = useState<Partial<User>>({
    avatar: userInfo?.avatar || '',
    name: userInfo?.name || '',
    bio: userInfo?.bio || '',
    socials: userInfo?.socials || {},
  })

  const [errors, setErrors] = useState<{ name?: string }>({})
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const validateName = (name: string): string | undefined => {
    if (name.length < 2 || name.length > 20) return '昵称长度需要在 2 到 20 个字符之间'
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(name)) return '昵称只能包含中文、英文、数字和下划线'
    return undefined
  }

  const saveProfile = async (data: Partial<User>) => {
    setSaving(true)
    try {
      const res = await updateUserInfo(data)
      if (res.data.code === 200) {
        setLastSaved(Date.now())
        if (token && userInfo) {
          login(token, { ...userInfo, ...data } as User)
        }
      } else {
        message.error(res.data.message || '保存失败')
      }
    } catch (error) {
      console.error(error)
      message.error('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const debouncedSave = useCallback(
    debounce((data: Partial<User>) => {
      void saveProfile(data)
    }, 500),
    [token, userInfo],
  )

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const err = validateName(val)
    setErrors((prev) => ({ ...prev, name: err }))

    const newProfile = { ...profile, name: val }
    setProfile(newProfile)

    if (!err) {
      debouncedSave(newProfile)
    }
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const newProfile = { ...profile, bio: val }
    setProfile(newProfile)
    debouncedSave(newProfile)
  }

  const handleSocialChange = (key: keyof NonNullable<User['socials']>, val: string) => {
    const newSocials = { ...profile.socials, [key]: val }
    const newProfile = { ...profile, socials: newSocials }
    setProfile(newProfile)
    debouncedSave(newProfile)
  }

  const beforeUpload = (file: RcFile) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error('仅支持 JPG 或 PNG 格式图片')
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_FILE_SIZE) {
      message.error('图片大小不能超过 2MB')
      return Upload.LIST_IGNORE
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      const newProfile = { ...profile, avatar: base64 }
      setProfile(newProfile)
      void saveProfile(newProfile)
    }

    return false
  }

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj as RcFile)
        reader.onload = () => resolve(reader.result as string)
      })
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleSystemAvatar = (url: string) => {
    const newProfile = { ...profile, avatar: url }
    setProfile(newProfile)
    void saveProfile(newProfile)
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  )

  return (
    <div className="profileEditRoot">
      <div className="profileForm">
        <div className="formItem">
          <label className="formLabel">头像</label>
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onPreview={handlePreview}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="头像" style={{ width: '100%', borderRadius: '50%' }} />
            ) : (
              uploadButton
            )}
          </Upload>
          <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
            <img alt="头像预览" style={{ width: '100%' }} src={previewImage} />
          </Modal>

          <div style={{ marginTop: 12 }}>
            <div className="formLabel" style={{ fontSize: 12, marginBottom: 8 }}>或者选择系统头像：</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {SYSTEM_AVATARS.map((url, i) => (
                <div
                  key={i}
                  onClick={() => handleSystemAvatar(url)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: profile.avatar === url ? '2px solid #7c5cff' : '2px solid transparent',
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                  }}
                  className="systemAvatarItem"
                >
                  <img src={url} alt={`系统头像-${i + 1}`} style={{ width: '100%', height: '100%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="formItem">
          <label className="formLabel">昵称</label>
          <input
            className={`formInput ${errors.name ? 'error' : ''}`}
            value={profile.name}
            onChange={handleNameChange}
            placeholder="请输入昵称"
          />
          {errors.name && <div className="formError">{errors.name}</div>}
        </div>

        <div className="formItem">
          <label className="formLabel">个人简介</label>
          <Input.TextArea
            className="formInput"
            value={profile.bio}
            onChange={handleBioChange}
            placeholder="介绍一下自己..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {showFullEdit && (
          <div className="formItem">
            <label className="formLabel">社交链接</label>
            <div style={{ display: 'grid', gap: 12 }}>
              <Input
                className="formInput"
                prefix={<span style={{ color: '#fff', opacity: 0.5, width: 60 }}>GitHub</span>}
                value={profile.socials?.github}
                onChange={(e) => handleSocialChange('github', e.target.value)}
                placeholder="https://github.com/..."
              />
              <Input
                className="formInput"
                prefix={<span style={{ color: '#fff', opacity: 0.5, width: 60 }}>Twitter</span>}
                value={profile.socials?.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
              <Input
                className="formInput"
                prefix={<span style={{ color: '#fff', opacity: 0.5, width: 60 }}>Bilibili</span>}
                value={profile.socials?.bilibili}
                onChange={(e) => handleSocialChange('bilibili', e.target.value)}
                placeholder="https://space.bilibili.com/..."
              />
              <Input
                className="formInput"
                prefix={<span style={{ color: '#fff', opacity: 0.5, width: 60 }}>抖音</span>}
                value={profile.socials?.douyin}
                onChange={(e) => handleSocialChange('douyin', e.target.value)}
                placeholder="https://v.douyin.com/..."
              />
              <Input
                className="formInput"
                prefix={<span style={{ color: '#fff', opacity: 0.5, width: 60 }}>邮箱</span>}
                value={profile.socials?.email}
                onChange={(e) => handleSocialChange('email', e.target.value)}
                placeholder="请输入联系邮箱"
              />
            </div>
          </div>
        )}

        <div className="formStatus">
          {saving ? (
            <span className="statusSaving">保存中...</span>
          ) : lastSaved ? (
            <span className="statusSaved">已保存于 {new Date(lastSaved).toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
