// Test scene resources, camera trajectory and running/paused animation values.
// prettier-ignore
async(page)=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.environment)
  const read=()=>page.locator('canvas').evaluate(c=>({intro:+c.dataset.intro,camera:JSON.parse(c.dataset.camera),env:JSON.parse(c.dataset.environment)}))
  const first=await read()
  await page.screenshot({path:'output/playwright/planet-opening.png'})
  if(first.intro>.4)throw Error('Globe opening missing')
  await page.getByRole('button',{name:'降落小岛 ↘'}).click()
  let previous=first.camera.position,largestStep=0
  for(let i=0;i<45;i++){
    await page.waitForTimeout(200)
    const state=await read(),p=state.camera.position
    largestStep=Math.max(largestStep,Math.hypot(...p.map((v,j)=>v-previous[j])))
    previous=p
    if(state.intro===1)break
  }
  const landed=await read()
  await page.screenshot({path:'output/playwright/living-coast.png'})
  if(landed.intro!==1||largestStep>65||Math.hypot(...landed.camera.position.map((v,j)=>v-first.camera.position[j]))<250)throw Error('Camera arrival discontinuous/incomplete')
  if(landed.env.assets!==5||landed.env.grass!==120||landed.env.islets!==3||landed.env.buoys!==8||!landed.env.windCompiled||!landed.env.treeWindCompiled)throw Error('Live assets missing: '+JSON.stringify(landed.env))
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  // Sample a full interval so a periodic animation's turning point cannot look frozen.
  const motionSamples=[await read()]
  for(let i=0;i<10;i++){await page.waitForTimeout(200);motionSamples.push(await read())}
  for(const key of ['windTime','windSample','treeWind','beacon','wing','boat','water','turbine']){
    const values=motionSamples.map(sample=>sample.env[key])
    if(Math.max(...values)-Math.min(...values)<.001)throw Error('Frozen '+key)
  }
  await page.getByRole('button',{name:'暂停驾驶'}).click()
  await page.waitForTimeout(300);const paused=await read();await page.waitForTimeout(700);const still=await read()
  for(const key of ['windTime','treeWind','beacon','wing','boat','water','turbine'])if(paused.env[key]!==still.env[key])throw Error('Pause failed '+key)
  await page.getByRole('button',{name:'继续驾驶'}).click()
  await page.waitForTimeout(700);const resumed=await read()
  if(resumed.env.windTime<=still.env.windTime)throw Error('Resume failed')
  await page.evaluate(r=>window.__livingWorldChecks=r,{first,landed,largestStep,paused,still,resumed})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/跳过开场/}).click()
  await page.waitForFunction(()=>+document.querySelector('canvas').dataset.intro===1)
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('http://127.0.0.1:4173/')
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.environment)
  if((await read()).intro!==0)throw Error('Reduced motion skipped the initial planet')
  await page.getByRole('button',{name:'降落小岛 ↘'}).click()
  await page.waitForFunction(()=>+document.querySelector('canvas').dataset.intro===1)
  await page.emulateMedia({reducedMotion:'no-preference'})
}
