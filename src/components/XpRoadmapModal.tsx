import {createPortal} from 'react-dom';
import type {CompanionChoice,UserStats,SupportedLanguage} from '../types';
import {LEVEL_THRESHOLDS} from '../services/gamificationService';
import {CompanionArt} from './CompanionArt';
import {ui} from '../services/uiCopy';
interface Props{isOpen:boolean;onClose:()=>void;stats:UserStats;companionChoice?:CompanionChoice;onSelectCompanion?:(choice:CompanionChoice)=>void;language?:SupportedLanguage}
export function XpRoadmapModal({isOpen,onClose,stats,companionChoice='pip',onSelectCompanion,language='auto'}:Props){
 if(!isOpen)return null;
 return createPortal(<div className="modal-backdrop"><section className="modal-content" role="dialog" aria-modal="true" aria-label={ui('Optional rewards',language)}><button className="btn-icon dialog-close" aria-label={ui('Close',language)} onClick={onClose}>×</button><h2>{ui('Optional rewards',language)}</h2><p>{ui('XP is an optional record of effort, not a measure of your worth or health.',language)}</p><p>{ui('Rewards can be hidden without losing progress.',language)}</p><h3>{ui('Level',language)} {stats.level}</h3><p>{stats.xp} XP</p><ol>{LEVEL_THRESHOLDS.map(level=><li key={level.level}>{ui('Level',language)} {level.level}: {level.minXp} XP</li>)}</ol><h3>{ui('Companion stages',language)}</h3><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{([1,3,5]).map(level=><div key={level}><CompanionArt choice={companionChoice} level={level}/><p>{ui('Level',language)} {level}</p></div>)}</div><div className="profile-options">{(['pip','mochi','nova','bubbles'] as const).map(choice=><button type="button" key={choice} aria-pressed={choice===companionChoice} onClick={()=>onSelectCompanion?.(choice)} className="btn-secondary"><CompanionArt choice={choice} level={stats.level}/><span>{choice[0].toUpperCase()+choice.slice(1)}</span></button>)}</div><button className="btn-primary" onClick={onClose}>{ui('Close',language)}</button></section></div>,document.body);
}
