// Actual vehicle impacts, seven articulated residents, grounded landing and recovery.
// prettier-ignore
async (page) => {
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/跳过开场/}).click()
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const day=page.getByRole('button',{name:'切换到白天'})
  if(await day.count())await day.click()
  const read=()=>page.locator('canvas').evaluate(c=>JSON.parse(c.dataset.residents))
  const first=await read(),results=[]
  for(const actor of first){
    await page.getByRole('button',{name:/岛民图鉴/}).click()
    await page.getByRole('button',{name:'寻找'+actor.name,exact:true}).click()
    const before=(await read()).find(r=>r.id===actor.id).hp
    await page.keyboard.down('KeyW')
    try { await page.waitForFunction(({id,hp})=>JSON.parse(document.querySelector('canvas').dataset.residents).some(r=>r.id===id&&r.hp<hp&&r.motion==='ragdoll'),{id:actor.id,hp:before},{timeout:12000}) }
    finally { await page.keyboard.up('KeyW') }
    await page.keyboard.down('Space');await page.waitForTimeout(100);await page.keyboard.up('Space')
    let maxTilt=0,maxJointError=0,frames=0
    for(let i=0;i<6;i++){
      const state=(await read()).find(r=>r.id===actor.id)
      if(state.motion==='ragdoll'){
        if(state.physicalParts!==state.bodyParts||state.bodyParts<4)throw Error('Missing fallen-part collisions: '+actor.id)
        maxTilt=Math.max(maxTilt,state.tilt)
        maxJointError=Math.max(maxJointError,state.jointError)
        frames++
      }
      await page.waitForTimeout(200)
    }
    if(!frames||maxTilt<0.12||maxJointError>0.2)throw Error(JSON.stringify({id:actor.id,maxTilt,maxJointError,frames}))
    if(['momo','capy','bunny'].includes(actor.id))await page.screenshot({path:'output/playwright/ragdoll-'+actor.id+'-landing.png'})
    await page.waitForFunction(id=>JSON.parse(document.querySelector('canvas').dataset.residents).some(r=>r.id===id&&r.motion==='walking'),actor.id,{timeout:15000})
    results.push({id:actor.id,maxTilt,maxJointError,frames,recovered:true})
  }
  await page.evaluate(r=>window.__ragdollChecks=r,results)
}
