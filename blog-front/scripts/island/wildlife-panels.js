// Real field-guide and atlas panels across phone, tablet and desktop viewports.
// prettier-ignore
async (page) => {
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).waitFor()
  await page.waitForFunction(()=>JSON.parse(document.querySelector('canvas').dataset.residents||'[]').length===7)
  const results=[]
  for(const dark of [false,true]){
    const toggle=page.getByRole('button',{name:dark?'切换到夜晚':'切换到白天'})
    if(await toggle.count())await toggle.click()
    for(const [width,height] of [[280,653],[320,568],[390,844],[640,360],[768,1024],[1440,1000]]){
      await page.setViewportSize({width,height})
      for(const panel of ['atlas','wildlife']){
        await page.getByRole('button',{name:panel==='atlas'?'打开岛屿地图':/岛民图鉴/}).click()
        const dialog=page.getByRole('dialog')
        await dialog.waitFor()
        const bounds=await dialog.boundingBox()
        if(bounds.x<0||bounds.x+bounds.width>width+1||bounds.y<0||bounds.y+bounds.height>height+1)throw Error(JSON.stringify({panel,width,height,bounds}))
        if(panel==='atlas')await dialog.getByRole('img',{name:/扩展岛屿全图/}).waitFor()
        else if(await dialog.getByRole('button',{name:/寻找/}).count()!==7)throw Error('Incomplete field guide')
        if(width===390)await page.screenshot({path:'output/playwright/'+panel+'-mobile-'+(dark?'night':'day')+'.png'})
        await page.keyboard.press('Escape')
        if(await dialog.count())throw Error('Escape did not dismiss panel')
        results.push({panel,width,height,dark})
      }
    }
  }
  await page.evaluate(r=>window.__wildlifePanelChecks=r,results)
}
