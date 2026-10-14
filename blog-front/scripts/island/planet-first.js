// Verify distant planet framing and an uninterrupted automatic camera approach.
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
    const distance=Math.hypot(first.camera[0],first.camera[1]+140,first.camera[2])
    if(first.phase!=='orbit'||first.intro!==0||first.island!=='false'||distance<1000)throw Error('Opening not distant planet: '+JSON.stringify(first))
    if(!reduced)await page.screenshot({path:`output/playwright/planet-distant-${width}.png`})
    let previous=first,largestStep=0,samples=0
    while(previous.phase!=='landed'&&samples<70){
      await page.waitForTimeout(200)
      const next=await read()
      if(next.intro<previous.intro)throw Error('Approach reversed')
      const step=Math.hypot(...next.camera.map((v,i)=>v-previous.camera[i]))
      largestStep=Math.max(largestStep,step)
      if(!reduced&&step>90*Math.max(1,height/width))throw Error('Camera jumped: '+step)
      previous=next;samples++
    }
    if(previous.phase!=='landed'||previous.intro!==1||previous.island!=='true')throw Error('Automatic landing failed')
    await page.waitForTimeout(200)
    const settled=await read()
    if(Math.hypot(...settled.camera.map((v,i)=>v-previous.camera[i]))>2)throw Error('Overview handoff jumped')
    reports.push({width,height,reduced,distance,largestStep,samples,first,landed:previous})
  }
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.evaluate(r=>window.__planetFirstChecks=r,reports)
}
