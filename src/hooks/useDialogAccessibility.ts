import {useEffect} from 'react';
export function useDialogAccessibility(){useEffect(()=>{
 let active:HTMLElement|null=null;const returnTargets=new Map<HTMLElement,HTMLElement|null>();
 const update=()=>{
  const dialogs=[...document.querySelectorAll<HTMLElement>('.modal-content,.onboarding-card,.command-palette')].filter(x=>x.getClientRects().length);const top=dialogs.at(-1)||null;
  if(top===active)return;
  if(active&&!dialogs.includes(active)){const target=returnTargets.get(active);returnTargets.delete(active);if(target?.isConnected)target.focus();}
  if(top){if(!returnTargets.has(top))returnTargets.set(top,document.activeElement as HTMLElement);top.setAttribute('role','dialog');top.setAttribute('aria-modal','true');if(!top.getAttribute('aria-label')&&!top.getAttribute('aria-labelledby'))top.setAttribute('aria-label',top.querySelector('h2,h3')?.textContent||'Dialog');top.tabIndex=-1;queueMicrotask(()=>{if(top.isConnected&&!top.contains(document.activeElement))top.focus()});}
  active=top;
 };
 const observer=new MutationObserver(update);observer.observe(document.body,{childList:true,subtree:true});update();
 const key=(e:KeyboardEvent)=>{
  if(!active)return;
  if(e.key==='Escape'){const close=active.querySelector<HTMLElement>('[aria-label^="Close"],.dialog-close');if(close){e.preventDefault();e.stopImmediatePropagation();close.click()}return}
  if(e.key!=='Tab')return;
  const list=[...active.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex="0"]')].filter(x=>!(x as HTMLButtonElement).disabled&&x.getClientRects().length);
  if(!list.length){e.preventDefault();active.focus();return}const first=list[0],last=list.at(-1)!;
  if(e.shiftKey&&(document.activeElement===first||document.activeElement===active)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===active||!active.contains(document.activeElement))){e.preventDefault();first.focus()}
 };
 document.addEventListener('keydown',key,true);return()=>{observer.disconnect();document.removeEventListener('keydown',key,true)};
},[])}
