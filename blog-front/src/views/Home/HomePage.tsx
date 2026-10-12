import { useEffect, useRef, useState } from 'react'
import type { Route } from '../../types/route'
import ArticleCard from '../../components/Article/ArticleCard'
import './home-page.css'
import { getArticles } from '../../api/article'
import type { ArticleSummary } from '../../types/api'
import HomeSidebar from './HomeSidebar'
import PersonalIntro from './PersonalIntro'
import { message } from '../../components/Message/MessageProvider'

export type HomePageProps = {
  onNavigate: (route: Route) => void
  onOpenAuth: () => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [page] = useState(1)
  const [slide, setSlide] = useState(0)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const topArticles = articles.slice(0, 4)
  const listArticles = articles.slice(4)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const res = await getArticles({ page, pageSize: 20 })
        if (res.data.code === 200) {
          setArticles(res.data.data.list)
        } else {
          message.error(res.data.message)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [page])

  useEffect(() => {
    if (topArticles.length === 0) return
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % topArticles.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [topArticles.length])

  return (
    <div className="homeRoot">
      <main className="homeMain" ref={stageRef}>
        <PersonalIntro onNavigate={onNavigate} />
        {topArticles.length > 0 && (
          <section className="homeTop" aria-label="置顶文章">
            <div className="homeTopHead">
              <h2 className="homeH1">
                灵感精选 <span>FEATURED STORIES</span>
              </h2>
            </div>

            <div
              className="homeCarousel"
              role="region"
              aria-roledescription="carousel"
              aria-label="置顶文章轮播"
            >
              <div className="homeCarouselViewport">
                <div
                  className="homeCarouselTrack"
                  style={{ transform: `translate3d(-${slide * 100}%, 0, 0)` }}
                >
                  {topArticles.map((x, i) => (
                    <article
                      key={x.id}
                      className="homeSlide"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} / ${topArticles.length}`}
                      aria-hidden={i === slide ? 'false' : 'true'}
                      onClick={() => onNavigate({ name: 'article', params: { id: x.id } })}
                    >
                      <div
                        className="homeSlideBg"
                        aria-hidden="true"
                        style={{ backgroundImage: x.cover ? `url(${x.cover})` : undefined }}
                      />
                      <div className="homeSlideOverlay" aria-hidden="true" />
                      <div className="homeSlideContent">
                        <h2 className="homeSlideTitle">{x.title}</h2>
                        <p className="homeSlideSummary">{x.summary}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="homeCarouselControls">
                <div className="homeDots" role="tablist" aria-label="轮播分页">
                  {topArticles.map((x, i) => (
                    <button
                      key={x.id}
                      className={i === slide ? 'homeDot homeDotActive' : 'homeDot'}
                      type="button"
                      aria-label={`切换到第 ${i + 1} 张`}
                      aria-pressed={i === slide ? 'true' : 'false'}
                      onClick={() => setSlide(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="homeBody">
          <div className="homeContent">
            <h2 className="homeWritingTitle">
              日常与思考 <span>NOTES & IDEAS</span>
            </h2>
            {loading && articles.length === 0 ? (
              <div className="homeLoading">正在加载文章...</div>
            ) : (
              <div className="homeList">
                {articles.length === 0 && (
                  <div className="homeEmpty">
                    <span>✧</span>
                    <h3>花园正在生长</h3>
                    <p>这里将收藏技术、生活与一闪而过的灵感。</p>
                    <button onClick={() => onNavigate({ name: 'about' })}>先认识一下我 ↗</button>
                  </div>
                )}
                {listArticles.map((x) => (
                  <ArticleCard
                    key={x.id}
                    article={x}
                    onClick={() => onNavigate({ name: 'article', params: { id: x.id } })}
                  />
                ))}
              </div>
            )}
          </div>

          <HomeSidebar />
        </section>
        <footer className="homeFooter">
          <span>SAKURA / DIGITAL GARDEN</span>
          <span>保持好奇 · 下次再见 ✳</span>
        </footer>
      </main>
    </div>
  )
}
