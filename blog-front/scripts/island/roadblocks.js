// Drive into a road cone using only keyboard controls; inspect real bodies.
// prettier-ignore
async (page) => {
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/跳过开场/}).click()
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const read=()=>page.locator('canvas').evaluate(c=>JSON.parse(c.dataset.props))
  await page.waitForTimeout(500)
  const before=await read()
  const cones=before.filter(p=>p.name==='traffic-cone')
  if(cones.length!==4||cones.some(p=>p.colliders!==3||p.mass>=10))throw Error('Missing compound/light cones')
  await page.keyboard.down('Space');await page.keyboard.down('KeyD')
  await page.waitForFunction(()=>+document.querySelector('canvas').dataset.yaw<-.585,{},{timeout:10000})
  await page.keyboard.up('KeyD');await page.keyboard.up('Space')
  await page.keyboard.down('KeyW')
  try { await page.waitForFunction(()=>JSON.parse(document.querySelector('canvas').dataset.props).some(p=>p.name==='traffic-cone'&&p.origin.x===-6&&Math.hypot(p.position.x+6,p.position.z-17)>.8),{},{timeout:10000}) }
  finally { await page.keyboard.up('KeyW') }
  await page.keyboard.down('Space');await page.waitForTimeout(500);await page.keyboard.up('Space')
  const after=await read()
  await page.evaluate(v=>window.__roadblockChecks=v,{before,after})
  await page.screenshot({path:'output/playwright/roadblock-impact.png'})
}
