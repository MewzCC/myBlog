// A function expression consumed by playwright-cli; a leading semicolon is invalid here.
// prettier-ignore
async (page) => {
  const profile = {
    id: 'test-profile',
    name: 'Sakura',
    avatar: '',
    bio: '写代码，也收集生活里的小小惊喜。',
    stats: { articles: 6, tags: 3, categories: 2 },
  }
  const articles = Array.from({ length: 6 }, (_, i) => ({
    id: String(i + 1),
    title: '岛屿测试文章 ' + (i + 1),
    summary: '真实 API 结构的隔离测试数据',
    cover: '',
    publishDate: '2026-10-13',
    views: 5,
    likes: 2,
    comments: 0,
    tags: ['技术'],
    author: profile,
    content: '# 岛屿测试正文',
  }))
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (!path.startsWith('/api/')) return route.continue()
    const data =
      path === '/api/articles'
        ? { list: articles, total: 6 }
        : path.endsWith('/comments')
          ? []
          : path.startsWith('/api/articles/')
            ? { ...articles[0], favorites: 0, isLiked: false, isFavorited: false }
            : path.endsWith('/profile')
              ? profile
              : path.endsWith('/settings')
                ? { enableGuestbook: true, enableSocials: true, enableUserEdit: false }
                : []
    await route.fulfill({ json: { code: 200, data, message: 'ok' } })
  })
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button', { name: /出发，环岛兜风/ }).waitFor()
  await page.getByRole('button', { name: '前往书店 / 文章' }).click()
  await page.getByRole('button', { name: /岛屿测试文章 1/ }).click()
  await page.waitForURL('**/?page=article&id=1')
  await page.getByRole('heading', { name: '岛屿测试正文' }).waitFor()
  const articleUrl = page.url()
  await page.getByRole('button', { name: '首页', exact: true }).click()
  await page.getByRole('button', { name: /出发，环岛兜风/ }).waitFor()
  await page.getByRole('button', { name: '前往邮局 / 留言' }).click()
  await page.getByRole('button', { name: /写一张明信片/ }).click()
  await page.waitForURL('**/?page=guestbook')
  const guestbookUrl = page.url()
  await page.getByRole('button', { name: '首页', exact: true }).click()
  await page.getByRole('button', { name: /出发，环岛兜风/ }).click()
  await page.getByRole('button', { name: '暂停驾驶' }).click()
  const before = await page.locator('canvas').getAttribute('data-z')
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(800)
  await page.keyboard.up('KeyW')
  const after = await page.locator('canvas').getAttribute('data-z')
  await page.getByRole('button', { name: /继续旅程/ }).click()
  await page.getByRole('button', { name: '前往灯塔 / 关于我' }).click()
  await page.waitForFunction(
    () => Math.abs(+document.querySelector('canvas').dataset.x + 17) < 0.01,
  )
  await page.keyboard.press('Escape')
  await page.keyboard.press('KeyE')
  await page.getByRole('dialog', { name: '灯塔 / 关于我' }).waitFor()
  await page.evaluate((v) => (window.__contentChecks = v), {
    articleUrl,
    guestbookUrl,
    pause: { before, after },
    station: {
      x: await page.locator('canvas').getAttribute('data-x'),
      z: await page.locator('canvas').getAttribute('data-z'),
    },
  })
}
