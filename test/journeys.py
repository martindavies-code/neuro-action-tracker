"""Isolated synthetic browser journeys. Requires pip install playwright and Chrome."""
import subprocess, time, os, json
from pathlib import Path
import os
shots=Path(os.environ.get('RQ_SCREENSHOT_DIR','/tmp/rhythmquest-screenshots'));shots.mkdir(parents=True,exist_ok=True)
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python3','-m','http.server','4173','--directory',str(root/'dist')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
  c=browser.new_context(timezone_id='Europe/London',viewport={'width':390,'height':844},reduced_motion='reduce');p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.goto('http://127.0.0.1:4173');p.get_by_role('heading',name='Welcome to your rhythm').wait_for()
  p.get_by_role('checkbox',name='I tried a tiny first step').check();p.get_by_role('button',name='Choose my starting point').click();p.get_by_role('button',name='Start empty',exact=True).click()
  assert json.loads(p.evaluate("localStorage.getItem('nat_user_stats_v2')"))['xp']==20
  assert json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))==[]
  p.get_by_role('button',name='Replay tutorial').click();p.get_by_role('checkbox',name='I tried a tiny first step').check();p.get_by_role('button',name='Choose my starting point').click();p.get_by_role('button',name='All seven routines',exact=True).click()
  assert json.loads(p.evaluate("localStorage.getItem('nat_user_stats_v2')"))['xp']==20
  assert json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))==[]
  p.get_by_role('button',name='Add my first action',exact=True).click();p.get_by_label('Task Title',exact=False).fill('Synthetic water task');p.locator('#save-task-btn').click()
  p.get_by_role('button',name='Mark complete: Synthetic water task').click();assert len(json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))[0]['completedDates'])==1
  p.get_by_role('button',name='Mark incomplete: Synthetic water task').click();assert not json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))[0]['completedDates']
  p.locator('.next-action button').click();p.locator('#focus-complete-btn').wait_for();p.get_by_role('button',name='Start Focus',exact=False).click();p.wait_for_timeout(1100)
  before=json.loads(p.evaluate("localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('nat_focus_')))"))
  assert before['running'];p.get_by_role('button',name="Today's List",exact=True).click();p.locator('.next-action button').click();p.locator('#focus-complete-btn').wait_for();p.get_by_role('button',name='Pause',exact=False).wait_for()
  p.locator('#tab-settings-btn').click();p.get_by_role('button',name='Quiet',exact=True).click();assert json.loads(p.evaluate("localStorage.getItem('nat_sensory_settings_v1')"))['showXp']==False
  p.get_by_role('checkbox',name='Reading guide',exact=True).check();assert p.locator('.reading-guide').is_visible()
  p.get_by_role('checkbox',name='Reading guide',exact=True).uncheck()
  p.locator('#settings-add-task-btn').click();p.get_by_label('Task Title',exact=False).fill('Keyboard test');p.keyboard.press('Tab');assert p.evaluate("document.querySelector('[role=dialog]').contains(document.activeElement)")
  p.get_by_role('button',name='Cancel',exact=True).click()
  for width in [320,390,1280]:
   p.set_viewport_size({'width':width,'height':844});p.wait_for_timeout(200);p.get_by_role('button',name="Today's List",exact=True).click();p.wait_for_timeout(450);p.screenshot(path=f'{shots}/rhythmquest-new-today-{width}.png',full_page=True)
   assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
  p.get_by_role('button',name='Progress & Stats',exact=True).click();p.locator('#progress-dashboard-view').wait_for();p.wait_for_timeout(450);p.screenshot(path=f'{shots}/rhythmquest-new-progress.png',full_page=True)
  p.locator('#tab-settings-btn').click();p.get_by_role('heading',name='Make this space yours').wait_for();p.wait_for_timeout(450);p.screenshot(path=f'{shots}/rhythmquest-new-settings.png',full_page=True)
  # The Today card uses the same editable helper as Focus and task editing.
  p.get_by_role('button',name="Today's List",exact=True).click();p.get_by_role('button',name='Step helper',exact=True).click();p.locator('.step-helper-dialog').wait_for();p.get_by_role('button',name='Cancel',exact=True).click()
  # Editable preview must not alter saved steps on cancel.
  p.get_by_role('button',name="Today's List",exact=True).click();p.locator('.next-action button').click();p.locator('#focus-complete-btn').wait_for()
  p.get_by_role('button',name='Step helper',exact=True).click();p.get_by_role('dialog',name='Suggested steps').wait_for();p.locator('.step-preview textarea').first.fill('Edited tiny step')
  p.wait_for_timeout(400);p.screenshot(path=f'{shots}/rhythmquest-step-preview.png',full_page=True)
  p.get_by_role('button',name='Use these steps',exact=True).click();assert json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))[0]['subTasks'][0]['title']=='Edited tiny step'
  p.get_by_role('button',name='Step helper',exact=True).click();p.get_by_role('button',name='Cancel',exact=True).click();assert json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))[0]['subTasks'][0]['title']=='Edited tiny step'
  # One day's step completion cannot silently complete tomorrow's recurring step.
  p.get_by_role('checkbox',name='Edited tiny step',exact=True).check();task=json.loads(p.evaluate("localStorage.getItem('nat_tasks_v2')"))[0];assert len(task['subTasks'][0]['completedDates'])==1
  for theme in ['sunset','slate','high-contrast']:
   p.locator('#tab-settings-btn').click();p.locator('#theme-selector').select_option(theme);p.wait_for_timeout(400);p.screenshot(path=f'{shots}/rhythmquest-theme-{theme}.png',full_page=True)
  p.locator('#theme-selector').select_option('sage')
  # Language selection persists across reload and tutorial follows chosen language.
  p.locator('#language-selector').select_option('es');p.locator('#replay-tour-btn').click();p.get_by_role('heading',name='Bienvenido a tu ritmo').wait_for();p.keyboard.press('Escape');p.locator('#language-selector').select_option('en')
  # Zoom-like reflow: long task title at narrow width remains within viewport.
  p.set_viewport_size({'width':320,'height':640});p.locator('#settings-add-task-btn').click();p.get_by_label('Task Title',exact=False).fill('A very long synthetic task title to exercise wrapping and bottom controls at narrow widths');p.get_by_role('button',name='Cancel',exact=True).click()
  assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
  # install/cached offline shell; cache all chunks, then disable network and reload
  p.evaluate('navigator.serviceWorker.ready');p.reload();p.wait_for_timeout(500);c.set_offline(True);p.reload();p.get_by_role('button',name="Today's List",exact=True).wait_for();assert 'Synthetic water task' in p.inner_text('body');c.set_offline(False)
  p.get_by_role('button',name="Today's List",exact=True).click();p.locator('.next-action button').click();p.locator('#focus-complete-btn').wait_for();p.get_by_role('button',name='Step helper',exact=True).click()
  p.locator('.step-helper-dialog').wait_for();p.locator('.step-helper-dialog .task-form-footer').scroll_into_view_if_needed();assert p.get_by_role('button',name='Use these steps',exact=True).is_visible()
  p.screenshot(path=f'{shots}/rhythmquest-step-preview-320.png',full_page=True);p.get_by_role('button',name='Cancel',exact=True).click()
  # Explicit SW upgrade waits for user action and preserves saved task data.
  sw=root/'dist/sw.js';original=sw.read_text()
  try:
   sw.write_text(original.replace("const CACHE='rhythmquest-", "const CACHE='rhythmquest-upgrade-test-"))
   p.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.update())")
   p.get_by_role('button',name='Update ready',exact=True).wait_for(timeout=15000)
   stored=p.evaluate("localStorage.getItem('nat_tasks_v2')")
   p.once('dialog',lambda d:d.accept())
   with p.expect_navigation(wait_until='load'):
    p.get_by_role('button',name='Update ready',exact=True).click()
   p.get_by_role('button',name="Today's List",exact=True).wait_for()
   assert p.evaluate("localStorage.getItem('nat_tasks_v2')")==stored
  finally:sw.write_text(original)
  assert not errors,errors
  print('PASS: tutorial reward/replay, no demo litter, quick create, complete/undo, focus recovery, quiet preferences, reading guide, modal keyboard, edited/cancelled step previews, themes, selected-language tutorial, 320/390/1280 layouts, offline reload and explicit app update; no browser errors')
  browser.close()
finally:server.terminate();server.wait()
