// Native UI navigation and actual Rapier contacts, consumed by playwright-cli.
// prettier-ignore
async (page) => {
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button',{name:/出发，环岛兜风/}).click()
  const day=page.getByRole('button',{name:'切换到白天'})
  if(await day.count())await day.click()
  await page.waitForFunction(()=>JSON.parse(document.querySelector('canvas').dataset.residents||'[]').length===7)
  const state=()=>page.locator('canvas').evaluate(c=>({residents:JSON.parse(c.dataset.residents),size:c.dataset.islandSize,hits:+c.dataset.hits,x:+c.dataset.x,z:+c.dataset.z}))
  const first=await state()
  if(first.size!=='104x96')throw Error('Expanded map missing')
  const visit=async(name)=>{
    await page.getByRole('button',{name:/岛民图鉴/}).click()
    await page.getByRole('button',{name:'寻找'+name,exact:true}).click()
    await page.waitForTimeout(200)
  }
  const hit=async(id,name)=>{
    await visit(name)
    const before=(await state()).residents.find(r=>r.id===id).hp
    try{
      await page.keyboard.down('KeyW')
      await page.waitForFunction(({id,before})=>JSON.parse(document.querySelector('canvas').dataset.residents).find(r=>r.id===id).hp<before,{id,before},{timeout:7000})
    }finally{await page.keyboard.up('KeyW')}
    await page.keyboard.down('Space')
    await page.waitForTimeout(250)
    await page.keyboard.up('Space')
    const after=(await state()).residents.find(r=>r.id===id)
    if(after.hp<0||after.hp>=before)throw Error('Invalid health after contact')
    return {id,before,hp:after.hp}
  }
  const contacts=[]
  for(const r of first.residents){
    contacts.push(await hit(r.id,r.name))
    if(['capy','bunny','miso'].includes(r.id)){
      const p=await state()
      if(r.id==='capy'&&p.x>-35)throw Error('Expanded west area is not reachable')
      if(r.id==='bunny'&&p.z<30)throw Error('Expanded campsite is not reachable')
      await page.screenshot({path:'output/playwright/resident-'+r.id+'.png'})
    }
  }
  let momo=(await state()).residents.find(r=>r.id==='momo')
  while(momo.hp>0){
    contacts.push(await hit('momo','MOMO'))
    momo=(await state()).residents.find(r=>r.id==='momo')
  }
  if(!momo.recovering)throw Error('Zero HP did not enter resting state')
  await page.screenshot({path:'output/playwright/resident-resting.png'})
  await page.waitForTimeout(700)
  if((await state()).residents.find(r=>r.id==='momo').hp!==0)throw Error('Recovered too early')
  await page.waitForFunction(()=>JSON.parse(document.querySelector('canvas').dataset.residents).find(r=>r.id==='momo').hp===100,{},{timeout:30000})
  await page.keyboard.down('Space');await page.waitForTimeout(1000);await page.keyboard.up('Space')
  momo=(await state()).residents.find(r=>r.id==='momo')
  if(momo.recovering||momo.hp!==100)throw Error('Recovery or stationary contact failed')
  await page.screenshot({path:'output/playwright/resident-recovered.png'})
  await page.getByRole('button',{name:/岛民图鉴/}).click()
  await page.screenshot({path:'output/playwright/resident-field-guide.png'})
  await page.getByRole('button',{name:'关闭面板'}).click()
  await page.evaluate(result=>window.__wildlifeChecks=result,{contacts,recovered:momo,size:first.size,allSevenContacts:true})
}
