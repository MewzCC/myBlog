import { GithubOutlined, MailOutlined, TwitterOutlined, VideoCameraOutlined, YoutubeOutlined } from '@ant-design/icons'
import { Avatar, Button, Skeleton, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { getAllCategories, getAllTags } from '../../api/meta'
import { getBloggerProfile } from '../../api/user'
import { useSettingsStore } from '../../stores/settingsStore'
import type { Category, Tag as TagType, User } from '../../types/api'
import './home-sidebar.css'

export default function HomeSidebar() {
  const [profile, setProfile] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const { enableSocials } = useSettingsStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [profileRes, catRes, tagRes] = await Promise.all([getBloggerProfile(), getAllCategories(), getAllTags()])
        if (profileRes.data.code === 200) setProfile(profileRes.data.data)
        if (catRes.data.code === 200) setCategories(catRes.data.data)
        if (tagRes.data.code === 200) setTags(tagRes.data.data)
      } catch (error) {
        console.error('Failed to fetch sidebar data', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  if (loading && !profile) {
    return (
      <aside className="homeSidebar">
        <div className="sidebarCard profileCard">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </div>
      </aside>
    )
  }

  if (!profile) return null

  return (
    <aside className="homeSidebar">
      <div className="sidebarCard profileCard">
        <div className="profileBg" />
        <div className="profileContent">
          <Avatar size={80} src={profile.avatar} className="profileAvatar" />
          <h3 className="profileName">{profile.name}</h3>
          <p className="profileBio">{profile.bio || 'No bio yet.'}</p>

          <div className="profileStats">
            <div className="statItem">
              <span className="statValue">{profile.stats?.articles || 0}</span>
              <span className="statLabel">Articles</span>
            </div>
            <div className="statItem">
              <span className="statValue">{profile.stats?.tags || 0}</span>
              <span className="statLabel">Tags</span>
            </div>
            <div className="statItem">
              <span className="statValue">{profile.stats?.categories || 0}</span>
              <span className="statLabel">Categories</span>
            </div>
          </div>

          <Button type="primary" block className="followBtn">
            Follow
          </Button>

          {enableSocials && (
            <div className="socialLinks">
              {profile.socials?.github && (
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer">
                  <GithubOutlined className="socialIcon" />
                </a>
              )}
              {profile.socials?.twitter && (
                <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer">
                  <TwitterOutlined className="socialIcon" />
                </a>
              )}
              {profile.socials?.bilibili && (
                <a href={profile.socials.bilibili} target="_blank" rel="noopener noreferrer">
                  <YoutubeOutlined className="socialIcon" />
                </a>
              )}
              {profile.socials?.douyin && (
                <a href={profile.socials.douyin} target="_blank" rel="noopener noreferrer">
                  <VideoCameraOutlined className="socialIcon" />
                </a>
              )}
              {profile.socials?.email && (
                <a href={`mailto:${profile.socials.email}`}>
                  <MailOutlined className="socialIcon" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sidebarCard">
        <h4 className="cardTitle">Categories</h4>
        <ul className="categoryList">
          {categories.map((category) => (
            <li key={category.id} className="categoryItem">
              <span>{category.name}</span>
              <span className="categoryCount">{category.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebarCard">
        <h4 className="cardTitle">Popular Tags</h4>
        <div className="tagCloud">
          {tags.map((tag) => (
            <Tag key={tag.id} className="tagItem">
              {tag.name}
            </Tag>
          ))}
        </div>
      </div>
    </aside>
  )
}
