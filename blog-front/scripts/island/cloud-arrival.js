// Inspect the masked world switch and gradual clearing in the actual renderer.
// prettier-ignore
async(page)=>{
  const errors=[]
  page.on('console',m=>{if(m.type()==='error'&&/shader|webgl/i.test(m.text()))errors.push(m.text())})
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:1000})
    await page.goto('http://127.0.0.1:4173/')
    const read=()=>page.locator('canvas').evaluate(c=>({p:+c.dataset.intro,cover:+c.dataset.cloudCover,clearing:+c.dataset.cloudClearing,island:c.dataset.islandVisible}))
    const stages=[]
    for(const p of [.36,.5,.7,.85,1]){
      await page.waitForFunction(p=>+document.querySelector('canvas')?.dataset.intro>=p,p,{timeout:16000})
      const s=await read();stages.push(s)
      if(p===.5&&(s.cover!==1||s.island!=='true'))throw Error('Island switch was not masked')
      await page.screenshot({path:`output/playwright/cloud-${width}-${p}.png`})
    }
    if(!(stages[2].cover<stages[1].cover&&stages[3].cover<stages[2].cover&&stages[4].cover===0))throw Error('Cloud bank did not gradually clear')
  }
  if(errors.length)throw Error(errors.join('\n'))
}
