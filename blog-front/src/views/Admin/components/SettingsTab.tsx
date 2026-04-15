import { useEffect, useState } from 'react'
import { Spin, Switch, message } from 'antd'
import { getAdminSiteSettings, updateAdminSiteSettings } from '../../../api/site'
import { useSettingsStore } from '../../../stores/settingsStore'
import type { SiteSettings } from '../../../types/api'

export default function SettingsTab() {
  const { enableGuestbook, enableSocials, enableUserEdit, applyServerSettings } = useSettingsStore()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminSiteSettings()
        if (res.data.code === 200) {
          applyServerSettings(res.data.data)
        } else {
          message.error(res.data.message)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [applyServerSettings])

  const save = async (next: SiteSettings) => {
    setSaving(true)
    try {
      const res = await updateAdminSiteSettings(next)
      if (res.data.code === 200) {
        applyServerSettings(res.data.data)
        message.success('设置已保存')
      } else {
        message.error(res.data.message || '保存设置失败')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="adminModule settingsModule" style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
        <Spin />
      </div>
    )
  }

  return (
    <div className="adminModule settingsModule">
      <h2 className="moduleTitle">系统设置</h2>
      <div className="settingsGrid" style={{ opacity: saving ? 0.75 : 1 }}>
        <div className="settingCard">
          <div className="settingInfo">
            <h3>留言板</h3>
            <p>允许访客在留言板页面阅读和发布消息。</p>
          </div>
          <div className="settingControl">
            <Switch
              checked={enableGuestbook}
              loading={saving}
              onChange={(checked) =>
                void save({
                  enableGuestbook: checked,
                  enableUserEdit,
                  enableSocials,
                })
              }
            />
          </div>
        </div>

        <div className="settingCard">
          <div className="settingInfo">
            <h3>用户资料编辑</h3>
            <p>允许普通用户编辑社交链接等扩展资料信息。</p>
          </div>
          <div className="settingControl">
            <Switch
              checked={enableUserEdit}
              loading={saving}
              onChange={(checked) =>
                void save({
                  enableGuestbook,
                  enableUserEdit: checked,
                  enableSocials,
                })
              }
            />
          </div>
        </div>

        <div className="settingCard">
          <div className="settingInfo">
            <h3>Social Links</h3>
            <p>在公开页面中展示博主的社交账号信息。</p>
          </div>
          <div className="settingControl">
            <Switch
              checked={enableSocials}
              loading={saving}
              onChange={(checked) =>
                void save({
                  enableGuestbook,
                  enableUserEdit,
                  enableSocials: checked,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
