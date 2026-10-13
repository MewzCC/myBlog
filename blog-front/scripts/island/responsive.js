// A function expression consumed by playwright-cli; a leading semicolon is invalid here.
// prettier-ignore
async (page) => {
  const sizes = [
    [280, 653],
    [320, 568],
    [360, 800],
    [390, 844],
    [479, 900],
    [480, 800],
    [640, 360],
    [759, 900],
    [760, 900],
    [768, 1024],
    [820, 1180],
    [900, 600],
    [1024, 768],
    [1099, 720],
    [1100, 720],
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
    [2560, 1080],
    [3440, 1440],
    [3840, 2160],
  ]
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button', { name: /出发，环岛兜风/ }).waitFor()
  const results = []
  for (const mode of ['intro', 'driving']) {
    if (mode === 'driving') await page.getByRole('button', { name: /出发，环岛兜风/ }).click()
    for (const theme of ['light', 'dark']) {
      const toggle = page.getByRole('button', {
        name: theme === 'light' ? '切换到白天' : '切换到夜晚',
      })
      if (await toggle.count()) await toggle.click()
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height })
        results.push(
          await page.evaluate(
            ({ mode, theme, width, height }) => {
              const selectors = [
                '.navBrand',
                '.navActions',
                '.drift__brand',
                '.drift__tools',
                '.drift__welcome',
                '.drift__destinations',
                '.drift__map',
                '.drift__dashboard',
                '.drift__touch',
                '.drift__speed',
              ]
              const boxes = selectors
                .map((s) => [s, document.querySelector(s)])
                .filter(([, e]) => e && getComputedStyle(e).display !== 'none')
                .map(([s, e]) => ({ s, r: e.getBoundingClientRect() }))
              const outside = boxes
                .filter(({ r }) => r.left < -1 || r.right > innerWidth + 1)
                .map(({ s }) => s)
              const overlap = []
              for (let i = 0; i < boxes.length; i++)
                for (let j = i + 1; j < boxes.length; j++) {
                  const a = boxes[i],
                    b = boxes[j]
                  if (a.s === '.drift__dashboard' || b.s === '.drift__dashboard') continue
                  if (
                    a.r.left < b.r.right - 2 &&
                    a.r.right > b.r.left + 2 &&
                    a.r.top < b.r.bottom - 2 &&
                    a.r.bottom > b.r.top + 2
                  )
                    overlap.push([a.s, b.s])
                }
              return {
                mode,
                theme,
                width,
                height,
                overflow: document.documentElement.scrollWidth - innerWidth,
                outside,
                overlap,
              }
            },
            { mode, theme, width, height },
          ),
        )
      }
    }
  }
  await page.evaluate((v) => (window.__islandResponsive = v), results)
  const failures = results.filter(r => r.overflow > 0 || r.outside.length || r.overlap.length)
  if (failures.length) throw new Error(JSON.stringify(failures))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'output/playwright/island-mobile-drive.png' })
}
