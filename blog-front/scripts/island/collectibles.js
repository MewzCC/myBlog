// A function expression consumed by playwright-cli; a leading semicolon is invalid here.
// prettier-ignore
async (page) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/跳过开场/}).click()
  await page.getByRole('button', { name: /出发，环岛兜风/ }).click()
  const read = () =>
    page.evaluate(() => {
      const c = document.querySelector('canvas')
      return {
        x: +c.dataset.x,
        z: +c.dataset.z,
        yaw: +c.dataset.yaw,
        speed: +c.dataset.speed,
        collected: +document.querySelector('.drift__map-caption b').textContent.split('/')[0],
      }
    })
  const targets = [
    [0, 15],
    [10, 18],
    [18, 8],
    [23, 9, true],
    [23, -6, true],
    [18, -6],
    [9, -18],
    [-5, -18],
    [-18, -7],
    [-18, 5],
  ]
  const results = []
  for (const [x, z, waypoint] of targets) {
    await page.keyboard.down('Space')
    await page.waitForFunction(() => +document.querySelector('canvas').dataset.speed < 2)
    const s = await read(),
      target = Math.atan2(x - s.x, z - s.z),
      diff = Math.atan2(Math.sin(target - s.yaw), Math.cos(target - s.yaw))
    if (Math.abs(diff) > 0.035) {
      const key = diff > 0 ? 'KeyA' : 'KeyD'
      await page.keyboard.down(key)
      try {
        await page.waitForFunction(
          (target) => {
            const y = +document.querySelector('canvas').dataset.yaw
            return Math.abs(Math.atan2(Math.sin(target - y), Math.cos(target - y))) < 0.035
          },
          target,
          { timeout: 40000 },
        )
      } finally {
        await page.keyboard.up(key)
      }
    }
    await page.keyboard.up('Space')
    await page.keyboard.down('KeyW')
    try {
      if (waypoint) await page.waitForFunction(
        ({x,z}) => Math.hypot(+document.querySelector('canvas').dataset.x-x,+document.querySelector('canvas').dataset.z-z)<1.2,
        {x,z},
        {timeout:12000},
      )
      else await page.waitForFunction(
        (count) =>
          +document.querySelector('.drift__map-caption b').textContent.split('/')[0] > count,
        s.collected,
        { timeout: 12000 },
      )
    } finally {
      await page.keyboard.up('KeyW')
    }
    results.push(await read())
    await page.evaluate((v) => (window.__tokenProgress = v), results)
  }
  await page.keyboard.down('Space')
  await page.waitForFunction(() => +document.querySelector('canvas').dataset.speed < 2)
  await page.keyboard.up('Space')
  await page.getByText(/全部灵感已收集/).waitFor()
  await page.evaluate(() => (window.__allTokensVerified = true))
}
