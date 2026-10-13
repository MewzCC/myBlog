// A function expression consumed by playwright-cli; a leading semicolon is invalid here.
// prettier-ignore
async (page) => {
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button', { name: /出发，环岛兜风/ }).click()
  await page.getByRole('button', { name: '回到出发点' }).click()
  await page.getByRole('button', { name: '前往书店 / 文章' }).click()
  await page.waitForFunction(
    () => Math.abs(+document.querySelector('canvas').dataset.x - 17) < 0.01,
  )
  await page.keyboard.press('Escape')
  await page.keyboard.down('Space')
  await page.keyboard.down('KeyD')
  await page.waitForFunction(
    () => Number(document.querySelector('canvas').dataset.yaw) < -1.5,
    {},
    { timeout: 15000 },
  )
  await page.keyboard.up('KeyD')
  await page.keyboard.up('Space')
  await page.keyboard.down('KeyW')
  await page.waitForFunction(
    () => Number(document.querySelector('canvas').dataset.x) < 9.4,
    {},
    { timeout: 8000 },
  )
  await page.keyboard.up('KeyW')
  await page.keyboard.down('Space')
  await page.waitForFunction(() => Number(document.querySelector('canvas').dataset.speed) < 2)
  await page.keyboard.down('KeyA')
  await page.waitForFunction(
    () => Number(document.querySelector('canvas').dataset.yaw) > -0.08,
    {},
    { timeout: 15000 },
  )
  await page.keyboard.up('KeyA')
  await page.keyboard.up('Space')
  await page.keyboard.down('KeyW')
  try {
    await page.waitForFunction(
      () => Number(document.querySelector('canvas').dataset.propsMoved) > 0,
      {},
      { timeout: 10000 },
    )
  } finally {
    await page.keyboard.up('KeyW')
  }
  const props = await page.locator('canvas').getAttribute('data-props-moved')
  await page.getByRole('button', { name: /岛民图鉴/ }).click()
  await page.getByRole('button', { name: '寻找慢慢' }).click()
  // Reverse along the new western road to the northern beach boundary.
  await page.keyboard.down('KeyS')
  await page.waitForFunction(
    () => Number(document.querySelector('canvas').dataset.z) < -45,
    {},
    { timeout: 15000 },
  )
  await page.waitForTimeout(900)
  await page.keyboard.up('KeyS')
  const boundary = await page.locator('canvas').getAttribute('data-z')
  if (+boundary < -46 || +boundary > -45) throw Error('Expanded beach boundary failed')
  await page.getByRole('button', { name: '开启声音' }).click()
  await page.waitForFunction(
    () => document.querySelector('canvas').dataset.audioState === 'running',
  )
  const sound = await page.locator('canvas').getAttribute('data-audio-state')
  await page.getByRole('button', { name: '关闭声音' }).click()
  await page.evaluate((v) => (window.__physicsCheck = v), {
    propsMoved: props,
    boundaryZ: boundary,
    sound,
  })
}
