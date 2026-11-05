"""Selected-language synthetic journeys and screenshot evidence."""
import subprocess,json
from pathlib import Path
import os
shots=Path(os.environ.get('RQ_SCREENSHOT_DIR','/tmp/rhythmquest-screenshots'));shots.mkdir(parents=True,exist_ok=True)
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python3','-m','http.server','4175','--directory',str(root/'dist')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
  for lang in ['es','fr','de','pt','it','ja','zh','ko']:
   c=b.new_context(viewport={'width':390,'height':844},timezone_id='Europe/London',reduced_motion='reduce');p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.add_init_script("localStorage.setItem('nat_sensory_settings_v1',JSON.stringify({language:"+json.dumps(lang)+",reducedMotion:true}));localStorage.setItem('nat_onboarding_completed_v1','true');")
   p.goto('http://127.0.0.1:4175');p.locator('#tab-settings-btn').click();p.locator('#language-selector').wait_for();assert p.locator('#language-selector').input_value()==lang
   p.wait_for_timeout(400);p.screenshot(path=f'{shots}/rhythmquest-language-{lang}-settings.png',full_page=True)
   p.locator('#replay-tour-btn').click();p.locator('.onboarding-card').wait_for();assert 'Welcome to your rhythm' not in p.locator('.onboarding-card').inner_text();p.keyboard.press('Escape')
   p.locator('#settings-add-task-btn').click();p.locator('#task-title-input').fill('Synthetic action');p.locator('details.task-options').evaluate('(e)=>e.open=true')
   p.locator('.task-options .btn-secondary').first.click();p.locator('.step-helper-dialog').wait_for();assert 'Suggested steps' not in p.locator('.step-helper-dialog').inner_text();p.keyboard.press('Escape');p.locator('#save-task-btn').click()
   p.locator('#tab-today-btn').click();p.locator('.next-action button').click();p.locator('#focus-complete-btn').wait_for();assert 'Start Focus' not in p.inner_text('body');p.screenshot(path=f'{shots}/rhythmquest-language-{lang}-focus.png',full_page=True)
   for width in [320,390]:
    p.set_viewport_size({'width':width,'height':844});p.locator('.timer-controls').screenshot(path=f'{shots}/rhythmquest-timer-{lang}-{width}.png');assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.locator('#tab-dashboard-btn').click();p.locator('#progress-dashboard-view').wait_for();p.locator('#progress-dashboard-view>details').evaluate('(e)=>e.open=true');p.wait_for_timeout(400)
   p.screenshot(path=f'{shots}/rhythmquest-language-{lang}-progress.png',full_page=True)
   body=p.inner_text('body');assert 'Total Wins Logged' not in body;assert 'Milestone Badges' not in body;assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert not errors,errors
   c.close();print('PASS language',lang)
  b.close()
finally:server.terminate();server.wait()
