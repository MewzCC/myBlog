// Physical forward/reverse ramp traversal, without changing simulation state.
// prettier-ignore
async(page)=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const read=()=>page.locator('canvas').evaluate(c=>({x:+c.dataset.x,y:+c.dataset.y,z:+c.dataset.z,yaw:+c.dataset.yaw,speed:+c.dataset.speed}))
  const results=[]
  for(const reverse of [false,true]){
    await page.keyboard.press('KeyR');await page.waitForTimeout(500)
    if(reverse){
      await page.keyboard.down('Space');await page.keyboard.down('KeyD')
      await page.waitForFunction(()=>+document.querySelector('canvas').dataset.yaw < -3.13,{},{timeout:20000})
      await page.keyboard.up('KeyD');await page.keyboard.up('Space')
    }
    const key=reverse?'KeyS':'KeyW'
    await page.keyboard.down(key)
    await page.waitForFunction(()=>+document.querySelector('canvas').dataset.z>19,{},{timeout:15000})
    await page.keyboard.up(key);await page.keyboard.down('Space')
    await page.waitForFunction(()=>+document.querySelector('canvas').dataset.speed===0)
    await page.keyboard.up('Space');await page.waitForTimeout(300)
    let peak=0
    await page.keyboard.down(key)
    try{
      for(let i=0;i<100;i++){
        await page.waitForTimeout(100)
        const state=await read();peak=Math.max(peak,state.y)
        if(state.z>28)break
      }
    }finally{await page.keyboard.up(key)}
    const end=await read()
    if(end.z<28||peak<1.2||Math.abs(end.x)>1.5)throw Error('Ramp traversal failed: '+JSON.stringify({reverse,peak,end}))
    results.push({reverse,peak,end})
  }
  await page.evaluate(r=>window.__terrainChecks=r,results)
}
