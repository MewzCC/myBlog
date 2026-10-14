// Verify numerical light changes, clock progression and responsive controls.
// prettier-ignore
async(page)=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const read=()=>page.locator('canvas').evaluate(c=>({hour:+c.dataset.hour,daylight:+c.dataset.daylight,lighting:JSON.parse(c.dataset.lighting)}))
  const auto=page.getByRole('button',{name:'自动昼夜循环'})
  if(await auto.getAttribute('aria-pressed')==='true')await auto.click()
  const day=page.getByRole('button',{name:'切换到白天'})
  if(await day.count())await day.click()
  await page.waitForTimeout(1500)
  const noon=await read()
  if(noon.hour!==12||noon.daylight!==1||noon.lighting.sun<3||noon.lighting.moon!==0)throw Error('Noon lighting failed')
  await page.getByRole('button',{name:'切换到夜晚'}).click()
  await page.waitForTimeout(1500)
  const night=await read()
  if(night.hour!==0||night.daylight!==0||night.lighting.sun>.1||night.lighting.moon<.5||night.lighting.headlights<25)throw Error('Night lighting failed')
  await auto.click()
  const before=await read();await page.waitForTimeout(2000);const after=await read()
  if(after.hour-before.hour<.05||after.hour-before.hour>.2)throw Error('Clock not progressing at intended rate')
  for(const width of [360,768,1440]){
    await page.setViewportSize({width,height:900})
    const clock=await page.getByRole('complementary',{name:'岛屿时间'}).boundingBox()
    const tools=await page.locator('.drift__tools').boundingBox()
    if(clock.x<0||clock.x+clock.width>width||clock.y<tools.y+tools.height)throw Error('Clock overlaps toolbar or viewport')
  }
  await page.evaluate(r=>window.__dayCycleChecks=r,{noon,night,before,after})
}
