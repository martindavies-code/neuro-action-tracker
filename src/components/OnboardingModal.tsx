import {ui} from '../services/uiCopy';
import {useState,useEffect} from 'react';
import {DEFAULT_TASKS,setOnboardingCompleted} from '../services/storageService';
import type {TaskItem,UserStats,SupportedLanguage} from '../types';
interface Props {language?:SupportedLanguage;isOpen:boolean;onClose:()=>void;stats:UserStats;onAddTask:(data:Partial<TaskItem>)=>TaskItem;onCompleteTask:(t:TaskItem)=>void;onUpdateStats:(s:Partial<UserStats>)=>void}
export function OnboardingModal({isOpen,onClose,stats,onAddTask,onUpdateStats,language='auto'}:Props){
 const [step,setStep]=useState(0);const [practised,setPractised]=useState(false);
 useEffect(()=>{if(!isOpen)return;const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){setStep(0);setPractised(false);onClose()}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[isOpen,onClose]);
 if(!isOpen)return null;
 const close=()=>{setStep(0);setPractised(false);setOnboardingCompleted(true);onClose()};
 const choose=(pack:'empty'|'morning'|'all')=>{if(!localStorage.getItem('nat_tasks_v2')){const list=pack==='empty'?[]:DEFAULT_TASKS.filter(t=>pack==='all'||t.category==='morning').map(t=>({...t,createdAt:new Date().toISOString()}));try{localStorage.setItem('nat_tasks_v2',JSON.stringify(list))}catch{window.dispatchEvent(new CustomEvent('rhythm-storage-error'));return;}window.dispatchEvent(new Event('rhythm-reload-tasks'));}close()};
 return <div className="onboarding-overlay"><section className="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="welcome-title" tabIndex={-1}>
 <button className="btn-icon dialog-close" onClick={close} aria-label={ui('Close tutorial',language)}>×</button>
 <p className="eyebrow">{ui('A small start is enough',language)}</p><h2 id="welcome-title">{ui(step===0?'Welcome to your rhythm':'Make it yours',language)}</h2>
 {step===0?<><p>{ui('Two minutes is a start. Everything else can wait.',language)}</p><p>{ui('Practice stays here, not in your real tasks.',language)}</p><label className="practice-check"><input type="checkbox" checked={practised} onChange={e=>{setPractised(e.target.checked);if(e.target.checked&&!stats.tutorialXpAwarded){onUpdateStats({...stats,xp:stats.xp+20,tutorialXpAwarded:true});}}}/> {ui('I tried a tiny first step',language)}</label><p>{ui(stats.tutorialXpAwarded?'Your welcome reward is already safe.':'Your first practice earns a one-time 20 XP reward.',language)}</p><button className="btn-primary" onClick={()=>setStep(1)}>{ui('Choose my starting point',language)}</button></>:<><p>{ui('Choose a starting pack.',language)}</p><div className="starter-options"><button className="btn-primary" onClick={()=>choose('empty')}>{ui('Start empty',language)}</button><button className="btn-secondary" onClick={()=>choose('morning')}>{ui('Just mornings',language)}</button><button className="btn-secondary" onClick={()=>choose('all')}>{ui('All seven routines',language)}</button></div><p>{ui('Your existing tasks stay as they are.',language)}</p><button className="btn-secondary" onClick={()=>{onAddTask({title:'My first small action',recurrenceType:'one-off',xpValue:0});close()}}>{ui('Add a zero-XP one-off example',language)}</button></>}
 </section></div>
}
