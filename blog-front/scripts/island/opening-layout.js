// Validate opening/landing controls in both themes and narrow/landscape layouts.
// prettier-ignore
async(page)=>{
  const results=[]
  for(const [width,height] of [[280,653],[390,844],[640,360],[768,1024],[1440,1000],[3440,1440]]){
    await page.setViewportSize({width,height})
    await page.goto('http://127.0.0.1:4173/')
    const opening=page.getByRole('region',{name:'星球降落开场'})
    await opening.waitFor()
    if(await page.locator('.messageToastError').count())throw Error('Optional homepage reads interrupted opening')
    const r=await opening.boundingBox()
    if(r.x<0||r.x+r.width>width||r.y<0||r.y+r.height>height)throw Error('Opening off screen: '+JSON.stringify({width,height,r}))
    await opening.getByRole('button',{name:/跳过开场/}).click()
    await page.waitForFunction(()=>+document.querySelector('canvas').dataset.intro===1)
    for(const night of [false,true]){
      const toggle=page.getByRole('button',{name:night?'切换到夜晚':'切换到白天'})
      if(await toggle.count())await toggle.click()
      await page.waitForTimeout(350)
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)
      const clock=await page.getByRole('complementary',{name:'岛屿时间'}).boundingBox()
      if(overflow||clock.x<0||clock.x+clock.width>width)throw Error('Clock/page overflow: '+JSON.stringify({width,height,clock}))
      results.push({width,height,night,openingFits:true,clockFits:true})
    }
    await page.getByRole('button',{name:/出发，环岛兜风/}).click()
    const clock=await page.getByRole('complementary',{name:'岛屿时间'}).boundingBox()
    const map=await page.locator('.drift__map').boundingBox()
    if(clock.x<map.x+map.width&&clock.x+clock.width>map.x&&clock.y<map.y+map.height&&clock.y+clock.height>map.y)throw Error('Clock covers driving map')
    if(await page.locator('.drift__journey').isVisible()){
      const journey=await page.locator('.drift__journey').boundingBox()
      if(journey.x<map.x+map.width&&journey.x+journey.width>map.x&&journey.y<map.y+map.height&&journey.y+journey.height>map.y)throw Error('Journey text covers map')
    }
  }
  await page.evaluate(r=>window.__openingLayoutChecks=r,results)
}
