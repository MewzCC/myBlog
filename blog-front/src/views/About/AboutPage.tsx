import { CodeOutlined, GithubOutlined, HeartOutlined, MailOutlined, RocketOutlined, TwitterOutlined } from '@ant-design/icons'
import { Skeleton, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { getBloggerProfile } from '../../api/user'
import { useSettingsStore } from '../../stores/settingsStore'
import type { User } from '../../types/api'
import './about-page.css'

export default function AboutPage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { enableSocials } = useSettingsStore()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBloggerProfile()
        if (res.data.code === 200) {
          setProfile(res.data.data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  if (loading) {
    return (
      <div className="aboutRoot">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    )
  }

  return (
    <div className="aboutRoot">
      <div className="aboutHeader">
        <div className="aboutAvatar">
          <img src={profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} alt={profile?.name || '站长'} />
        </div>
        <h1 className="aboutTitle">关于我</h1>
        <p className="aboutBio">{profile?.bio || '一名喜欢打磨细节的全栈开发者，也持续记录产品、工程和日常思考。'}</p>
        {enableSocials && (
          <div className="aboutSocials">
            {profile?.socials?.github && (
              <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubOutlined />
              </a>
            )}
            {profile?.socials?.twitter && (
              <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterOutlined />
              </a>
            )}
            {profile?.socials?.email && (
              <a href={`mailto:${profile.socials.email}`} aria-label="邮箱">
                <MailOutlined />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="aboutContent">
        <section className="aboutSection">
          <h2 className="aboutSectionTitle">
            <CodeOutlined /> 技术栈
          </h2>
          <div className="aboutTags">
            <Tag color="blue">React</Tag>
            <Tag color="cyan">TypeScript</Tag>
            <Tag color="green">Spring Boot</Tag>
            <Tag color="purple">Redis</Tag>
            <Tag color="orange">MySQL</Tag>
            <Tag color="magenta">Docker</Tag>
          </div>
        </section>

        <section className="aboutSection">
          <h2 className="aboutSectionTitle">
            <RocketOutlined /> 关于这个站点
          </h2>
          <p>这个博客用来记录工程实践、技术实验，以及在做产品过程中产生的复盘与总结。</p>
          <p>现在它已经不再只是一个静态展示页，而是一套真正可运行的 React 前端与 Spring Boot 后端应用。</p>
        </section>

        <section className="aboutSection">
          <h2 className="aboutSectionTitle">
            <HeartOutlined /> 一点碎碎念
          </h2>
          <p>我希望做出来的软件不只好用、可维护，也能对使用它和维护它的人保持足够友好。</p>
        </section>
      </div>
    </div>
  )
}
