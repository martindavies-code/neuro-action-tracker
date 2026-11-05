import {ui} from '../services/uiCopy';
import {getTodayDateString} from '../services/storageService';
import {StepHelper} from './StepHelper';
import React, { useState, useEffect, useRef } from 'react';
import type { SubTask, SupportedLanguage, TaskItem } from '../types';
import { IconRenderer } from './IconRenderer';
import { VisualTimeTimer } from './VisualTimeTimer';
import { sound } from '../services/soundService';
import { getTranslation } from '../services/i18nService';

interface FocusModeProps {
  task: TaskItem;
  language?: SupportedLanguage;
  onComplete: (task: TaskItem, e?: React.MouseEvent) => void;
  onNextTask: () => void;
  onExit: () => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onAddSubTask?: (taskId: string, title: string) => void;
  onSetSubTasks?: (taskId: string, subTasks: SubTask[]) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  language = 'auto',
  onComplete,
  onNextTask,
  onExit,
  onToggleSubTask,
  onAddSubTask,
  onSetSubTasks,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const sessionKey='nat_focus_'+task.id;
  const initial=React.useMemo(()=>{try {const r=JSON.parse(localStorage.getItem(sessionKey)||'null');if(r&&Number.isFinite(r.total)&&Number.isFinite(r.left)&&r.total>0&&r.total<=86400)return r;}catch{} return {total:(task.estimatedMinutes||5)*60,left:(task.estimatedMinutes||5)*60,deadline:0,running:false}},[sessionKey,task.estimatedMinutes]);
  const [totalSeconds,setTotalSeconds]=useState(initial.total);
  const [timeLeft,setTimeLeft]=useState(()=>initial.running?Math.max(0,Math.ceil((initial.deadline-Date.now())/1000)):initial.left);
  const [isRunning,setIsRunning]=useState(()=>Boolean(initial.running&&initial.deadline>Date.now()));
  const deadline=useRef(initial.deadline||0);
  const [newSubTaskTitle,setNewSubTaskTitle]=useState('');
  const today=getTodayDateString();
  const subTasks=(task.subTasks||[]).map(st=>({...st,completed:(st.completedDates||[]).includes(today)}));
  useEffect(()=>{try{localStorage.setItem(sessionKey,JSON.stringify({total:totalSeconds,left:timeLeft,deadline:deadline.current,running:isRunning}))}catch{window.dispatchEvent(new CustomEvent('rhythm-storage-error'))}},[sessionKey,totalSeconds,timeLeft,isRunning]);
  useEffect(()=>{if(!isRunning)return;const tick=()=>{const left=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setTimeLeft(left);if(left===0){setIsRunning(false);sound.playPop()}};tick();const id=setInterval(tick,250);document.addEventListener('visibilitychange',tick);return()=>{clearInterval(id);document.removeEventListener('visibilitychange',tick)}},[isRunning]);
  const toggle=()=>{if(isRunning){setTimeLeft(Math.max(0,Math.ceil((deadline.current-Date.now())/1000)));setIsRunning(false)}else{deadline.current=Date.now()+(timeLeft||totalSeconds)*1000;setIsRunning(true)}};
  const handleSetPreset=(mins:number)=>{setTotalSeconds(mins*60);setTimeLeft(mins*60);deadline.current=0;setIsRunning(false)};

  const handleAddSubTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;
    if (onAddSubTask) {
      onAddSubTask(task.id, newSubTaskTitle.trim());
      setNewSubTaskTitle('');
    }
  };

  const handleToggleStep = (subTaskId: string) => {
    if (onToggleSubTask) {
      onToggleSubTask(task.id, subTaskId);
    }
  };

  const handleDeleteStep = (subTaskId: string) => {
    if (onSetSubTasks) {
      const filtered = subTasks.filter((st) => st.id !== subTaskId);
      onSetSubTasks(task.id, filtered);
    }
  };


  return (
    <div className="focus-view">
      <div className="focus-card">
        <div className="focus-badge">
          <IconRenderer name="Target" size={14} />
          <span>{t('focus_title')}</span>
        </div>

        <h2 className="focus-task-title" style={{ fontSize: '1.45rem' }}>{task.title}</h2>
        {task.description && <p className="focus-task-desc">{task.description}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span className={`tag-badge tag-priority-${task.priority}`}>
            {task.priority === 'high' ? ` ${t('priority_high')}` : task.priority === 'medium' ? ` ${t('priority_medium')}` : ` ${t('priority_low')}`}
          </span>
          <span className="tag-badge tag-category">
            {task.category === 'morning' ? ` ${t('filter_morning')}` : task.category === 'afternoon' ? ` ${t('filter_afternoon')}` : task.category === 'evening' ? ` ${t('filter_evening')}` : ` ${t('filter_all')}`}
          </span>
          <span className="task-xp-badge">
            +{task.xpValue} XP
          </span>
        </div>

        {/* Visual Arc Time Timer */}
        <VisualTimeTimer
          timeLeft={timeLeft}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          language={language}
          onTogglePlay={toggle}
          onReset={() => {
            setIsRunning(false);
            setTimeLeft(totalSeconds);
          }}
          onSetPresetMinutes={handleSetPreset}
        />

        {/* Bite-sized Sub-tasks (Micro-steps) */}
        <div style={{ marginTop: '28px', textAlign: 'left', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
               {t('micro_steps_title')}:
            </span>

            <StepHelper title={task.title} description={task.description} language={language} existing={subTasks.length} onApply={steps=>onSetSubTasks?.(task.id,steps)}/>
          </div>

          {subTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {subTasks.map((st) => (
                <div
                  key={st.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    fontSize: '0.88rem',
                    padding: '4px 0',
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, textDecoration: st.completed ? 'line-through' : 'none' }}>
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleStep(st.id)}
                      style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>{st.title}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteStep(st.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 6px' }}
                    title={ui('Remove step',language)}
                    aria-label={ui('Remove step',language)}
                  >

                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {t('type_micro_step')}
            </p>
          )}

          <form onSubmit={handleAddSubTaskSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder={t('type_micro_step')}
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.82rem', flex: 1 }}
              id="focus-add-step-input"
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              disabled={!newSubTaskTitle.trim()}
              id="focus-add-step-btn"
            >
              {t('add_step_btn')}
            </button>
          </form>
        </div>
      </div>

      {/* Complete Button */}
      <button
        className="focus-complete-btn"
        onClick={(e) => {localStorage.removeItem(sessionKey);onComplete(task, e)}}
        id="focus-complete-btn"
      >
        <IconRenderer name="Check" size={24} />
        <span><span className="reward-xp">{t('complete_claim_xp')} (+{task.xpValue} XP)</span><span className="quiet-complete">{ui('Complete this action',language)}</span></span>
      </button>

      {/* Bottom Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px' }}>
        <button className="btn-secondary" onClick={onExit}>
          ← {t('back_to_checklist')}
        </button>
        <button className="btn-secondary" onClick={onNextTask}>
          {t('skip_next_task')} →
        </button>
      </div>
    </div>
  );
};
