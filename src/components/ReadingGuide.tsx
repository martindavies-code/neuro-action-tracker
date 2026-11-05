import type {SupportedLanguage} from '../types';
import {ui} from '../services/uiCopy';
import {useEffect,useState} from 'react';
export function ReadingGuide({enabled,language='auto'}:{enabled:boolean;language?:SupportedLanguage}){const [y,setY]=useState(200);useEffect(()=>{const move=(e:PointerEvent)=>{if(e.pointerType!=='touch')setY(e.clientY)};if(enabled)window.addEventListener('pointermove',move);return()=>window.removeEventListener('pointermove',move)},[enabled]);return enabled?<><div aria-hidden="true" className="reading-guide" style={{top:y}}/><label className="reading-guide-control">{ui('Reading guide',language)}<input type="range" min="0" max={window.innerHeight} value={y} onChange={e=>setY(+e.target.value)}/></label></>:null}
