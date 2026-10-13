// Function expression for playwright-cli run-code.
// prettier-ignore
async (page) => {
  const results=[]
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  for(const dark of [false,true]) {
    const toggle=page.getByRole('button',{name:dark?'切换到夜晚':'切换到白天'})
    if(await toggle.count())await toggle.click()
    for(const [width,height] of [[280,653],[390,844],[640,360],[768,1024],[1440,1000],[3440,1440]]) {
      await page.setViewportSize({width,height})
      for(const name of ['灯塔 / 关于我','车库 / 创作实验','书店 / 文章','邮局 / 留言']) {
        await page.getByRole('button',{name:'目录 ☰'}).click()
        await page.getByRole('dialog').getByRole('button').filter({hasText:name}).click()
        const panel=page.getByRole('dialog',{name})
        await panel.waitFor()
        await page.waitForTimeout(750)
        const bounds=await panel.evaluate(e=>{const r=e.getBoundingClientRect(); const content=e.querySelector('.drift__panel-content');return {left:r.left,right:r.right,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,outer:getComputedStyle(e).transform,inner:getComputedStyle(content).transform}})
        if(bounds.overflow || bounds.left < -2 || bounds.right > width+2)throw new Error(JSON.stringify({width,height,name,dark,bounds}))
        await panel.getByRole('button',{name:'关闭面板'}).click()
        await page.getByRole('complementary',{name:'路过站点提示'}).waitFor()
        await page.waitForTimeout(750)
        const overlap=await page.evaluate(()=>{const r=document.querySelector('.drift__passing').getBoundingClientRect();const t=document.querySelector('.drift__touch').getBoundingClientRect();const m=document.querySelector('.drift__map').getBoundingClientRect();const hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;return {touch: t.width>0&&hit(r,t),map:hit(r,m),left:r.left,right:r.right}})
        if(overlap.touch||overlap.map||overlap.left<0||overlap.right>width)throw new Error(JSON.stringify({width,height,name,dark,overlap}))
        results.push({width,height,name,dark})
      }
      if(width===390) {
        await page.screenshot({path:`D:/Project/myBlog/output/playwright/station-mobile-${dark?'night':'day'}-passing.png`})
        await page.getByRole('button',{name:'看看这里 ↗'}).click()
        await page.waitForTimeout(750)
        await page.screenshot({path:`D:/Project/myBlog/output/playwright/station-mobile-${dark?'night':'day'}-parked.png`})
        await page.getByRole('button',{name:'关闭面板'}).click()
      }
    }
  }
  await page.evaluate(r=>window.__arrivalResponsiveResults=r,results)
}
