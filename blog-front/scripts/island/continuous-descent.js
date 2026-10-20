// Measure the entire rendered flight, including the hidden part inside dense clouds.
// prettier-ignore
async(page)=>{
  const results=[]
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:1000})
    await page.goto('http://127.0.0.1:4173/')
    await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.camera)
    const read=()=>page.locator('canvas').evaluate(c=>({p:+c.dataset.intro,position:JSON.parse(c.dataset.camera).position,cover:+c.dataset.cloudCover,altitude:+c.dataset.planetAltitude}))
    const samples=[await read()]
    while(samples.at(-1).p<1&&samples.length<160){
      await page.waitForTimeout(160)
      const next=await read(),previous=samples.at(-1)
      if(next.position[1]>previous.position[1]+.02)throw Error('Camera climbed: '+JSON.stringify({previous,next}))
      samples.push(next)
    }
    if(samples.at(-1).p!==1)throw Error('Landing incomplete')
    const inside=samples.filter(s=>s.p>.6&&s.p<.72)
    if(inside.length<4||inside.at(-1).position[1]>=inside[0].position[1])throw Error('Cloud flight did not keep descending')
    for(const s of samples.filter(s=>s.p>=.72)){
      const t=Math.max(0,Math.min(1,(s.p-.72)/.28)),expected=1-t*t*(3-2*t)
      if(Math.abs(s.cover-expected)>.00001)throw Error('Approved cloud clearing changed')
    }
    await page.screenshot({path:`output/playwright/continuous-descent-${width}.png`})
    results.push({width,samples})
  }
  await page.evaluate(r=>window.__continuousDescentChecks=r,results)
}
