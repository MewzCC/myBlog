// Inspect the masked world switch and gradual clearing in the actual renderer.
// prettier-ignore
async(page)=>{
  const errors=[]
  page.on('console',m=>{if(m.type()==='error'&&/shader|webgl/i.test(m.text()))errors.push(m.text())})
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:1000})
    await page.goto('http://127.0.0.1:4173/')
    const read=()=>page.locator('canvas').evaluate(c=>({p:+c.dataset.intro,cover:+c.dataset.cloudCover,clearing:+c.dataset.cloudClearing,island:c.dataset.islandVisible,rendering:c.dataset.cloudRendering,altitude:+c.dataset.planetAltitude}))
    const stages=[]
    for(const p of [.2,.4,.53,.64,.83,.94,1]){
      await page.waitForFunction(p=>+document.querySelector('canvas')?.dataset.intro>=p,p,{timeout:24000})
      const s=await read();stages.push(s)
      if(p<=.4&&(s.cover!==0||s.rendering!=='false'))throw Error('Clouds rendered before camera alignment')
      if(p===.4&&s.altitude<=35)throw Error('Camera entered the cloud shell too early')
      if(p===.53&&(s.altitude>=35||s.altitude<=10))throw Error('Camera did not descend through the spherical clouds')
      if(p===.53&&s.cover!==0)throw Error('Flat mist concealed the volumetric cloud passage')
      if(p===.64&&(s.cover!==1||s.island!=='true'))throw Error('Island switch was not masked')
      await page.screenshot({path:`output/playwright/cloud-${width}-${p}.png`})
    }
    if(!(stages[4].cover<stages[3].cover&&stages[5].cover<stages[4].cover&&stages[6].cover===0))throw Error('Cloud bank did not gradually clear')
  }
  if(errors.length)throw Error(errors.join('\n'))
}
