// Function expression for playwright-cli run-code.
// prettier-ignore
async(page)=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const read=()=>page.locator('canvas').evaluate(c=>({x:+c.dataset.x,yaw:+c.dataset.yaw,speed:+c.dataset.speed}))
  const results=[]
  async function reset(){await page.keyboard.press('KeyR');await page.waitForTimeout(350)}
  async function stop(){await page.keyboard.down('Space');await page.waitForFunction(()=>+document.querySelector('canvas').dataset.speed===0);await page.keyboard.up('Space')}
  for(const [key,sign] of [['KeyA',1],['KeyD',-1],['ArrowLeft',1],['ArrowRight',-1]]){
    await reset()
    await page.keyboard.down('KeyW');await page.keyboard.down(key)
    await page.waitForTimeout(750)
    await page.keyboard.up(key);await page.keyboard.up('KeyW');await stop()
    const pose=await read()
    if(pose.x*sign<.1||pose.yaw*sign<.05)throw new Error(JSON.stringify({key,pose}))
    results.push({input:key,...pose})
  }
  await page.setViewportSize({width:390,height:844})
  for(const [label,sign] of [['向左转',1],['向右转',-1]]){
    await reset()
    const r=await page.getByRole('group',{name:'驾驶摇杆圆盘'}).boundingBox()
    await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down()
    await page.mouse.move(r.x+r.width/2-sign*30,r.y+r.height/2-30);await page.waitForTimeout(1000)
    await page.keyboard.up('KeyW');await page.mouse.up();await stop()
    const pose=await read()
    if(pose.x*sign<.1||pose.yaw*sign<.05)throw new Error(JSON.stringify({label,pose}))
    results.push({input:label,...pose})
  }
  await reset()
  await page.setViewportSize({width:1440,height:1000})
  await page.evaluate(v=>window.__steeringChecks=v,results)
}
