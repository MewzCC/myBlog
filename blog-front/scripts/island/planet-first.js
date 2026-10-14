// Assert first visible scene stays on the planet until an explicit landing.
// prettier-ignore
async(page)=>{
  const reports=[]
  for(const [width,height,reduced] of [[1440,1000,false],[390,844,false],[1440,1000,true]]){
    await page.setViewportSize({width,height})
    await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'})
    await page.goto('http://127.0.0.1:4173/')
    await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.introPhase)
    const read=()=>page.locator('canvas').evaluate(c=>({phase:c.dataset.introPhase,intro:+c.dataset.intro,island:c.dataset.islandVisible,camera:JSON.parse(c.dataset.camera).position}))
    const first=await read()
    if(first.phase!=='orbit'||first.intro!==0||first.island!=='false')throw Error('Island exposed before landing: '+JSON.stringify(first))
    await page.waitForTimeout(width===1440&&!reduced?9000:1000)
    const held=await read()
    if(held.phase!=='orbit'||held.intro!==0||held.island!=='false'||Math.hypot(...held.camera.map((n,i)=>n-first.camera[i]))>.001)throw Error('Opening auto-advanced')
    await page.getByRole('button',{name:'降落小岛 ↘'}).click()
    await page.waitForFunction(()=>document.querySelector('canvas').dataset.introPhase==='landed',{},{timeout:12000})
    const landed=await read()
    if(landed.intro!==1||landed.island!=='true'||Math.hypot(...landed.camera.map((n,i)=>n-first.camera[i]))<200)throw Error('Landing failed')
    reports.push({width,height,reduced,first,held,landed})
  }
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.evaluate(r=>window.__planetFirstChecks=r,reports)
}
