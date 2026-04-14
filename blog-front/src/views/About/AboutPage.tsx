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
          <img src={profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} alt={profile?.name || 'Admin'} />
        </div>
        <h1 className="aboutTitle">About</h1>
        <p className="aboutBio">{profile?.bio || 'Full-stack developer, open-source enthusiast, and lifelong learner.'}</p>
        {enableSocials && (
          <div className="aboutSocials">
            {profile?.socials?.github && (
              <a href={profile.socials.github} target="_blank" rel="noopener noreferrer">
                <GithubOutlined />
              </a>
            )}
            {profile?.socials?.twitter && (
              <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer">
                <TwitterOutlined />
              </a>
            )}
            {profile?.socials?.email && (
              <a href={`mailto:${profile.socials.email}`}>
                <MailOutlined />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="aboutContent">
        <section className="aboutSection">
          <h2 className="aboutSectionTitle">
            <CodeOutlined /> Tech Stack
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
            <RocketOutlined /> About This Site
          </h2>
          <p>This blog is used to document engineering practices, experiments, and lessons learned while building products.</p>
          <p>It now runs as a real full-stack application with a React front end and a Spring Boot backend.</p>
        </section>

        <section className="aboutSection">
          <h2 className="aboutSectionTitle">
            <HeartOutlined /> Personal Notes
          </h2>
          <p>I care about building software that is useful, maintainable, and kind to the people who use it and maintain it.</p>
        </section>
      </div>
    </div>
  )
}
