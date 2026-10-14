// Verify foliage contact and the shore boundary after adding environment assets.
// prettier-ignore
async(page)=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/跳过开场/}).click()
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const read=()=>page.locator('canvas').evaluate(c=>({x:+c.dataset.x,y:+c.dataset.y,z:+c.dataset.z,speed:+c.dataset.speed}))
  await page.keyboard.down('Space');await page.keyboard.down('KeyA')
  await page.waitForFunction(()=>+document.querySelector('canvas').dataset.yaw>1.55,{},{timeout:12000})
  await page.keyboard.up('KeyA');await page.keyboard.up('Space')
  await page.keyboard.down('KeyW');await page.waitForTimeout(2500);await page.keyboard.up('KeyW')
  const forest=await read()
  if(forest.x<3||forest.x>8||forest.speed>3)throw Error('Foliage collision failed: '+JSON.stringify(forest))
  await page.getByRole('button',{name:'前往灯塔 / 关于我'}).click()
  await page.keyboard.press('Escape')
  await page.keyboard.down('Space');await page.keyboard.down('KeyD')
  await page.waitForFunction(()=>Math.abs(+document.querySelector('canvas').dataset.yaw)<.015,{},{timeout:12000})
  await page.keyboard.up('KeyD');await page.keyboard.up('Space')
  await page.keyboard.down('KeyS')
  try{await page.waitForFunction(()=>+document.querySelector('canvas').dataset.z < -44,{},{timeout:15000});await page.waitForTimeout(1200)}
  finally{await page.keyboard.up('KeyS')}
  const boundary=await read()
  if(boundary.z < -45.5||boundary.z > -44||boundary.y>1.6||Math.abs(boundary.x+17)>1)throw Error('Shore boundary failed: '+JSON.stringify(boundary))
  await page.evaluate(r=>window.__solidWorldChecks=r,{forest,boundary})
}
