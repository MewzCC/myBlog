// Native simulation: autonomous travel and independently articulated footsteps.
// prettier-ignore
async (page) => {
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const day=page.getByRole('button',{name:'切换到白天'})
  if(await day.count())await day.click()
  const read=()=>page.locator('canvas').evaluate(c=>JSON.parse(c.dataset.residents))
  await page.waitForTimeout(500)
  const first=await read(), results=first.map(a=>({id:a.id,distance:0,legRange:0,firstLeg:a.legAngles[0],phase:a.gaitPhase,activities:new Set()}))
  for(let i=0;i<60;i++){
    await page.waitForTimeout(250)
    const current=await read()
    current.forEach((a,j)=>{
      const result=results[j], start=first[j]
      result.distance=Math.max(result.distance,Math.hypot(a.x-start.x,a.z-start.z))
      result.legRange=Math.max(result.legRange,Math.abs(a.legAngles[0]-result.firstLeg))
      result.activities.add(a.activity)
      if(Math.abs(a.x)>48||Math.abs(a.z)>44)throw Error('Resident out of bounds: '+a.id)
    })
  }
  const report=results.map(r=>({...r,activities:[...r.activities]}))
  await page.evaluate(r=>window.__wanderChecks=r,report)
  await page.screenshot({path:'output/playwright/resident-wandering.png'})
  for(const r of report)if(r.distance<2||r.legRange<0.2)throw Error('Inactive resident: '+JSON.stringify(r))
}
