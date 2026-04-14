// Mock data setup
import Mock from 'mockjs'

Mock.setup({
  timeout: '200-600'
})

// Real-world tech articles data
const articles = [
  {
    id: '1',
    title: 'React 19：并发渲染的未来与实践',
    summary: '深入探讨 React 19 带来的新特性，包括 Compiler、Actions 以及服务端组件的最新进展。本文将通过实际案例演示如何利用这些新特性提升应用性能。',
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2024-03-15T10:00:00.000Z',
    views: 12580,
    likes: 856,
    comments: 124,
    tags: ['React', 'Frontend', 'Performance'],
    category: '前端开发',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '9',
    title: 'Vue 3.4：更快的解析器与更高效的响应式系统',
    summary: 'Vue 3.4 带来了重写的模板解析器，速度提升 2 倍！同时优化了响应式系统的计算开销。本文将带你详细了解这些底层优化带来的性能红利。',
    cover: 'https://images.unsplash.com/photo-1627398242450-2701705a6304?q=80&w=2084&auto=format&fit=crop',
    publishDate: '2023-12-28T10:00:00.000Z',
    views: 10580,
    likes: 756,
    comments: 114,
    tags: ['Vue.js', 'Frontend', 'Performance'],
    category: '前端开发',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '10',
    title: '2023 年前端技术总结：回顾与展望',
    summary: '从 AI 辅助编程到 Rust 工具链的全面爆发，2023 年是前端领域变革的一年。本文盘点了年度重磅技术事件，并对 2024 年的技术趋势进行展望。',
    cover: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2023-12-31T23:59:00.000Z',
    views: 25800,
    likes: 1856,
    comments: 324,
    tags: ['Frontend', 'Summary', 'Trend'],
    category: '生活随笔',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '11',
    title: 'WebAssembly 在图像处理中的应用',
    summary: 'WebAssembly 让浏览器拥有了原生级的计算能力。本文通过一个在线图片滤镜应用，演示如何使用 Rust + WASM 实现高性能的图像处理功能。',
    cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2022-11-15T10:00:00.000Z',
    views: 6580,
    likes: 456,
    comments: 54,
    tags: ['WebAssembly', 'Rust', 'Graphics'],
    category: '前端开发',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '12',
    title: '微服务架构下的分布式事务解决方案',
    summary: '在微服务架构中，保证数据一致性是一个巨大的挑战。本文深入分析 TCC、Saga、Seata 等常见分布式事务解决方案的原理与适用场景。',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    publishDate: '2022-08-20T14:00:00.000Z',
    views: 13580,
    likes: 956,
    comments: 134,
    tags: ['Microservices', 'Backend', 'Architecture'],
    category: '后端技术',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '2',
    title: 'TypeScript 5.4 带来的新特性解析',
    summary: 'TypeScript 5.4 发布了！NoInfer 工具类型、闭包中的类型细化保留以及更多激动人心的更新。让我们一起来看看这些新特性如何帮助我们写出更健壮的代码。',
    cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop',
    publishDate: '2024-03-10T14:30:00.000Z',
    views: 8930,
    likes: 642,
    comments: 89,
    tags: ['TypeScript', 'JavaScript'],
    category: '前端开发',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '3',
    title: '深入理解 Node.js 事件循环机制',
    summary: '事件循环是 Node.js 的核心。本文通过详尽的图解和代码示例，剖析 timers、pending callbacks、idle、poll、check、close callbacks 六个阶段的执行细节。',
    cover: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2024-03-05T09:15:00.000Z',
    views: 15420,
    likes: 1205,
    comments: 230,
    tags: ['Node.js', 'Backend', 'Deep Dive'],
    category: '后端技术',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '4',
    title: '使用 Rust 构建高性能 Web 服务',
    summary: 'Rust 正在重塑 Web 开发的格局。本文介绍如何使用 Axum 和 Tokio 构建一个高并发、内存安全的 RESTful API 服务，并与 Go 语言进行性能对比。',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop',
    publishDate: '2024-02-28T16:45:00.000Z',
    views: 7850,
    likes: 530,
    comments: 67,
    tags: ['Rust', 'WebAssembly', 'Performance'],
    category: '后端技术',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '5',
    title: 'AI Agent 开发指南：从原理到实战',
    summary: '大语言模型 (LLM) 开启了 AI 新纪元。本文将教你如何使用 LangChain 和 OpenAI API 构建一个能够自主规划任务、调用工具的智能 Agent。',
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2024-02-20T11:20:00.000Z',
    views: 21050,
    likes: 3400,
    comments: 512,
    tags: ['AI', 'LLM', 'LangChain'],
    category: '人工智能',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '6',
    title: 'CSS 现代化：Tailwind 与 CSS-in-JS 的终极对决',
    summary: '样式方案层出不穷。本文深入对比 Tailwind CSS 原子化方案与 Styled-components 等运行时方案的优劣，助你为下一个项目做出最佳技术选型。',
    cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2024-02-15T13:00:00.000Z',
    views: 9800,
    likes: 720,
    comments: 156,
    tags: ['CSS', 'Tailwind', 'Design'],
    category: 'UI 设计',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '7',
    title: 'Docker 与 Kubernetes 容器化部署最佳实践',
    summary: '容器化已成为微服务架构的标配。本文分享在生产环境中使用 K8s 管理容器集群的实战经验，包括服务发现、负载均衡和故障恢复策略。',
    cover: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=2071&auto=format&fit=crop',
    publishDate: '2024-02-10T09:30:00.000Z',
    views: 6500,
    likes: 410,
    comments: 45,
    tags: ['DevOps', 'Docker', 'K8s'],
    category: 'DevOps',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  },
  {
    id: '8',
    title: 'Next.js 14 App Router 全面解析',
    summary: 'Next.js 14 带来了革命性的 App Router。从 Server Actions 到流式渲染，本文带你全面掌握 Next.js 的最新开发范式。',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2070&auto=format&fit=crop',
    publishDate: '2024-02-05T15:10:00.000Z',
    views: 11200,
    likes: 950,
    comments: 180,
    tags: ['Next.js', 'React', 'SSR'],
    category: '前端开发',
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    }
  }
]

const articleReactionState = new Map<string, { isLiked: boolean; likes: number; isFavorited: boolean; favorites: number }>()

// Auth
Mock.mock(/\/api\/auth\/login/, 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  
  
  if (username === 'admin' && password === 'admin123') {
    return {
      code: 200,
      message: 'Success',
      data: {
        token: 'mock-token-admin-123456',
        user: {
          id: 'admin',
          name: 'Admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
          roles: ['admin'],
          bio: '全栈开发者。热爱 React, Node.js 和设计。'
        }
      }
    }
  }

  // Default user login (if not admin)
  return {
    code: 200,
    message: 'Success',
    data: {
      token: 'mock-token-user-123456',
      user: {
        id: 'user',
        name: 'User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
        roles: ['user'],
        bio: '普通用户'
      }
    }
  }
})

Mock.mock(/\/api\/auth\/logout/, 'post', {
  code: 200,
  message: 'Success',
  data: null
})

Mock.mock(/\/api\/auth\/me/, 'get', {
  code: 200,
  message: 'Success',
  data: {
    id: 'admin',
    name: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    roles: ['admin'],
    bio: '全栈开发者。热爱 React, Node.js 和设计。',
    socials: {
      github: 'https://github.com/admin',
      twitter: 'https://twitter.com/admin',
      bilibili: 'https://bilibili.com',
      douyin: 'https://douyin.com',
      email: 'admin@example.com'
    },
    stats: {
      articles: 128,
      tags: 32,
      categories: 12
    }
  }
})

Mock.mock(/\/api\/auth\/me/, 'put', {
  code: 200,
  message: 'Success',
  data: {
    id: 'admin',
    name: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    roles: ['admin'],
    bio: '全栈开发者。热爱 React, Node.js 和设计。',
    socials: {
      github: 'https://github.com/admin',
      twitter: 'https://twitter.com/admin',
      bilibili: 'https://bilibili.com',
      douyin: 'https://douyin.com',
      email: 'admin@example.com'
    },
    stats: {
      articles: 128,
      tags: 32,
      categories: 12
    }
  }
})

// Blogger Profile
Mock.mock(/\/api\/blogger\/profile/, 'get', {
  code: 200,
  message: 'Success',
  data: {
    id: 'admin',
    name: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    roles: ['admin'],
    bio: '全栈开发者。热爱 React, Node.js 和设计。',
    socials: {
      github: 'https://github.com/admin',
      twitter: 'https://twitter.com/admin',
      bilibili: 'https://bilibili.com',
      douyin: 'https://douyin.com',
      email: 'admin@example.com'
    },
    stats: {
      articles: 128,
      tags: 32,
      categories: 12
    }
  }
})

// Articles List
Mock.mock(/\/api\/articles(\?.*)?$/, () => {
  // Simple filtering logic could be added here if needed
  // For now, return the static realistic list
  return {
    code: 200,
    message: 'Success',
    data: {
      list: articles,
      total: articles.length
    }
  }
})

const articleCommentsMock = [
  {
    id: 'cmt-1001',
    content: '这篇文章把核心概念讲得很清楚，尤其是并发渲染那一段，读完马上就能在项目里试起来。',
    createdAt: '2026-04-06 10:22:15',
    likes: 84,
    user: {
      id: 'u-zhangwen',
      name: '张文',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangwen'
    },
    replies: [
      {
        id: 'rp-10011',
        content: '同感，我已经把这部分改到线上模块了，渲染抖动明显减少。',
        createdAt: '2026-04-06 11:05:42',
        likes: 17,
        user: {
          id: 'u-lina',
          name: '李娜',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina'
        }
      }
    ]
  },
  {
    id: 'cmt-1002',
    content: '示例代码很实用，建议后续再补一节“旧项目迁移步骤”，这样对团队落地会更友好。',
    createdAt: '2026-04-05 19:48:09',
    likes: 56,
    user: {
      id: 'u-chenhao',
      name: '陈浩',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenhao'
    },
    replies: []
  },
  {
    id: 'cmt-1003',
    content: '从性能指标到工程实践都覆盖到了，阅读体验很好，排版也很舒服。',
    createdAt: '2026-04-05 14:20:33',
    likes: 41,
    user: {
      id: 'u-wangxia',
      name: '王霞',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangxia'
    },
    replies: [
      {
        id: 'rp-10031',
        content: '我也觉得结构很清晰，目录和重点标注很加分。',
        createdAt: '2026-04-05 15:02:19',
        likes: 9,
        user: {
          id: 'u-sunqi',
          name: '孙琪',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi'
        }
      }
    ]
  },
  {
    id: 'cmt-1004',
    content: '如果后面能补充一份 demo 仓库地址就更完美了，方便新人直接对照学习。',
    createdAt: '2026-04-04 09:31:28',
    likes: 28,
    user: {
      id: 'u-zhaoyu',
      name: '赵雨',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoyu'
    },
    replies: []
  }
]

// Article Comments
Mock.mock(/\/api\/articles\/\w+\/comments/, 'get', () => {
  return {
    code: 200,
    message: 'Success',
    data: articleCommentsMock
  }
})

// Article Detail
Mock.mock(/\/api\/articles\/\w+$/, (options) => {
  // Extract ID from url if possible, or just return a random realistic article detail
  // options.url: /api/articles/1
  const id = options.url.split('/').pop()
  const found = articles.find(a => a.id === id) || articles[0]
  const reaction = articleReactionState.get(found.id) || { isLiked: false, likes: found.likes, isFavorited: false, favorites: 120 }

  return {
    code: 200,
    message: 'Success',
    data: {
      ...found,
      likes: reaction.likes,
      // Add content for detail
      content: `
# ${found.title}

> ${found.summary}

## 引言

在当今快速发展的前端领域，技术的更新迭代令人目不暇接。${found.title} 作为一个重要的技术话题，值得我们深入探讨。

## 核心概念解析

这里我们将详细分析相关的核心概念...

### 代码示例

\`\`\`typescript
// 这是一个示例代码块
interface User {
  id: string;
  name: string;
}

function printUser(user: User) {
  console.log(\`User: \${user.name}\`);
}
\`\`\`

## 实践案例

在实际项目中，我们遇到了这样的问题...

1. 性能瓶颈
2. 维护成本
3. 扩展性不足

通过引入新技术，我们成功解决了这些问题。

## 总结

${found.title} 为我们提供了新的视角和解决方案。

---

*感谢阅读！如果觉得有帮助，请点赞关注。*
      `,
      favorites: reaction.favorites,
      isLiked: reaction.isLiked,
      isFavorited: reaction.isFavorited
    }
  }
})

Mock.mock(/\/api\/articles$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const id = Date.now().toString()
  const newArticle = {
    id,
    title: body.title,
    summary: body.summary,
    cover: body.cover,
    publishDate: new Date().toISOString(),
    views: 0,
    likes: 0,
    comments: 0,
    tags: body.tags || [],
    category: body.category,
    author: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
    content: body.content,
    favorites: 0,
    isLiked: false,
    isFavorited: false,
  }

  articles.unshift(newArticle)
  articleReactionState.set(id, { isLiked: false, likes: 0, isFavorited: false, favorites: 0 })

  return {
    code: 200,
    message: 'Success',
    data: newArticle,
  }
})

Mock.mock(/\/api\/articles\/\w+\/like/, 'post', (options) => {
  const parts = options.url.split('/')
  const id = parts[3]
  const article = articles.find((a) => a.id === id)
  const baseLikes = article?.likes || 0
  const current = articleReactionState.get(id) || { isLiked: false, likes: baseLikes, isFavorited: false, favorites: 0 }
  const nextIsLiked = !current.isLiked
  const nextLikes = Math.max(0, current.likes + (nextIsLiked ? 1 : -1))
  const next = { ...current, isLiked: nextIsLiked, likes: nextLikes }
  articleReactionState.set(id, next)
  if (article) article.likes = nextLikes
  return {
    code: 200,
    message: 'Success',
    data: { likes: nextLikes, isLiked: nextIsLiked },
  }
})

Mock.mock(/\/api\/articles\/\w+\/favorite/, 'post', (options) => {
  const parts = options.url.split('/')
  const id = parts[3]
  const current = articleReactionState.get(id) || { isLiked: false, likes: 0, isFavorited: false, favorites: 0 }
  const nextIsFavorited = !current.isFavorited
  const nextFavorites = Math.max(0, current.favorites + (nextIsFavorited ? 1 : -1))
  const next = { ...current, isFavorited: nextIsFavorited, favorites: nextFavorites }
  articleReactionState.set(id, next)
  return {
    code: 200,
    message: 'Success',
    data: { favorites: nextFavorites, isFavorited: nextIsFavorited },
  }
})

const guestbookMessagesMock = [
  {
    id: 'gb-2001',
    content: '博客风格很舒服，文章更新也稳定，已经收藏为我的日常技术阅读站点了。',
    createdAt: '2026-04-06 21:18:06',
    user: {
      id: 'g-liming',
      name: '李明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liming'
    }
  },
  {
    id: 'gb-2002',
    content: '刚看完性能优化系列，内容很扎实，期待后续出一篇关于监控体系的实战文章。',
    createdAt: '2026-04-06 16:42:57',
    user: {
      id: 'g-zhouyan',
      name: '周妍',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouyan'
    }
  },
  {
    id: 'gb-2003',
    content: '页面交互做得很细腻，移动端体验也不错，读起来非常顺手。',
    createdAt: '2026-04-05 23:09:14',
    user: {
      id: 'g-hejun',
      name: '何俊',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hejun'
    }
  },
  {
    id: 'gb-2004',
    content: '感谢分享，这里学到不少前端工程化技巧，已经推荐给团队同事一起看。',
    createdAt: '2026-04-05 13:26:35',
    user: {
      id: 'g-luqi',
      name: '陆琪',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luqi'
    }
  },
  {
    id: 'gb-2005',
    content: '希望后面可以增加“文章难度标签”，方便不同阶段的读者快速筛选内容。',
    createdAt: '2026-04-04 20:14:52',
    user: {
      id: 'g-xiaobei',
      name: '肖北',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaobei'
    }
  },
  {
    id: 'gb-2006',
    content: '来打卡留言，祝博客越做越好！',
    createdAt: '2026-04-04 08:58:11',
    user: {
      id: 'g-chengyu',
      name: '程宇',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chengyu'
    }
  }
]

// Guestbook Messages
Mock.mock(/\/api\/guestbook\/messages/, 'get', () => {
  return {
    code: 200,
    message: 'Success',
    data: guestbookMessagesMock
  }
})

Mock.mock(/\/api\/guestbook\/messages/, 'post', (options) => {
  const { content } = JSON.parse(options.body)
  return {
    code: 200,
    message: 'Success',
    data: {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toLocaleString(),
      user: {
        id: 'visitor',
        name: '访客',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Visitor'
      }
    }
  }
})

// Categories
Mock.mock(/\/api\/meta\/categories/, 'get', {
  code: 200,
  message: 'Success',
  data: [
    { id: 'frontend', name: '前端开发', count: 45 },
    { id: 'backend', name: '后端技术', count: 28 },
    { id: 'devops', name: 'DevOps', count: 15 },
    { id: 'ui', name: 'UI 设计', count: 12 },
    { id: 'life', name: '生活随笔', count: 8 }
  ]
})

// Tags
Mock.mock(/\/api\/meta\/tags/, 'get', {
  code: 200,
  message: 'Success',
  data: [
    { id: 'react', name: 'React', count: 20 },
    { id: 'typescript', name: 'TypeScript', count: 18 },
    { id: 'nextjs', name: 'Next.js', count: 12 },
    { id: 'nodejs', name: 'Node.js', count: 10 },
    { id: 'css', name: 'CSS', count: 8 },
    { id: 'tailwind', name: 'Tailwind', count: 6 },
    { id: 'docker', name: 'Docker', count: 5 },
    { id: 'git', name: 'Git', count: 4 },
    { id: 'vite', name: 'Vite', count: 3 }
  ]
})

const videoStore = new Map<
  string,
  {
    danmaku: any[]
    analytics: { plays: Set<string>; playCount: number; events: number; lastEventAt: number }
  }
>()

const ensureVideo = (videoKey: string) => {
  const existing = videoStore.get(videoKey)
  if (existing) return existing

  const init = {
    danmaku: [
      { text: '欢迎来发弹幕～', time: 1, mode: 0, color: '#FFFFFF' },
      { text: '支持滚动/顶部/底部', time: 3, mode: 0, color: '#7c5cff' },
      { text: '拖动进度条可预览（如配置了缩略图）', time: 6, mode: 2, color: '#ff5ca8' },
    ],
    analytics: {
      plays: new Set<string>(),
      playCount: 0,
      events: 0,
      lastEventAt: Date.now(),
    },
  }
  videoStore.set(videoKey, init)
  return init
}

Mock.mock(/\/api\/upload\/video$/, 'post', () => {
  const videoKey = `video_${Date.now()}_${Math.random().toString(16).slice(2)}`
  ensureVideo(videoKey)
  return {
    code: 200,
    message: 'Success',
    data: {
      videoKey,
      url: 'https://artplayer.org/assets/sample/video.mp4',
      mime: 'video/mp4',
      size: 1024 * 1024,
      poster: 'https://artplayer.org/assets/sample/poster.jpg',
    },
  }
})

Mock.mock(/\/api\/videos\/([^/]+)\/danmaku$/, 'get', (options) => {
  const match = options.url.match(/\/api\/videos\/([^/]+)\/danmaku/)
  const rawKey = match?.[1] || ''
  const videoKey = decodeURIComponent(rawKey)
  const store = ensureVideo(videoKey)
  return {
    code: 200,
    message: 'Success',
    data: store.danmaku,
  }
})

Mock.mock(/\/api\/videos\/([^/]+)\/danmaku$/, 'post', (options) => {
  const match = options.url.match(/\/api\/videos\/([^/]+)\/danmaku/)
  const rawKey = match?.[1] || ''
  const videoKey = decodeURIComponent(rawKey)
  const store = ensureVideo(videoKey)
  const body = JSON.parse(options.body)

  const item = {
    text: body.text,
    time: typeof body.time === 'number' ? body.time : 0,
    mode: typeof body.mode === 'number' ? body.mode : 0,
    color: body.color || '#FFFFFF',
    border: !!body.border,
    style: body.style || {},
    user: body.user,
  }

  store.danmaku.push(item)
  store.analytics.lastEventAt = Date.now()

  return {
    code: 200,
    message: 'Success',
    data: item,
  }
})

Mock.mock(/\/api\/videos\/([^/]+)\/events$/, 'post', (options) => {
  const match = options.url.match(/\/api\/videos\/([^/]+)\/events/)
  const rawKey = match?.[1] || ''
  const videoKey = decodeURIComponent(rawKey)
  const store = ensureVideo(videoKey)
  const body = JSON.parse(options.body)

  store.analytics.events += 1
  store.analytics.lastEventAt = Date.now()

  if (body?.event === 'play' && body?.viewerId) {
    store.analytics.plays.add(String(body.viewerId))
    store.analytics.playCount += 1
  }

  return {
    code: 200,
    message: 'Success',
    data: null,
  }
})

Mock.mock(/\/api\/analytics\/videos$/, 'get', () => {
  const data = Array.from(videoStore.entries()).map(([videoKey, store]) => {
    return {
      videoKey,
      plays: store.analytics.playCount,
      uniqueViewers: store.analytics.plays.size,
      events: store.analytics.events,
      lastEventAt: store.analytics.lastEventAt,
    }
  })
  return {
    code: 200,
    message: 'Success',
    data,
  }
})
