import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {calculateDailyStreak,calculateStreakFromTasks} from '../src/services/gamificationService';
import {DEFAULT_STATS,DEFAULT_TASKS,getPast7DaysCompletion,getTodayDateString,previewBackup,sanitizeImportedSettings,sanitizeImportedTask,isTaskScheduledForToday,matchesEnergy,preserveTaskHistory,importBackupJSON,exportBackupJSON,restoreSafetyBackup,saveTasks,loadTasks} from '../src/services/storageService';
import {generateMagicSubTasks} from '../src/services/aiBreakdownService';
import {UI_COPY_KEYS,UI_COPY_TRANSLATIONS} from '../src/services/uiCopy';
describe('Approved review regressions',()=>{
 it('freezes older schedules and rewards once, not only the past week',()=>{
 const task={...DEFAULT_TASKS[0],createdAt:'2026-01-01T00:00:00Z',xpValue:20,completedDates:['2026-01-05']};
 const history=preserveTaskHistory(task,'2026-11-05');assert.equal(history.find(r=>r.date==='2026-01-05')?.xpEarned,20);
 const changed={...task,xpValue:5,recurrenceType:'one-off' as const,history};const next=preserveTaskHistory(changed,'2026-11-05');
 assert.equal(next.length,history.length);assert.equal(next.find(r=>r.date==='2026-01-05')?.xpEarned,20);
 });
 it('rolls back a failed import and restores the previous recovery copy',()=>{
 const data=new Map<string,string>();let fail=false;const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{if(fail&&k==='nat_user_stats_v2'){fail=false;throw new Error('quota')}data.set(k,v)},removeItem:(k:string)=>{data.delete(k)}};
 (globalThis as any).window={localStorage:storage,dispatchEvent:()=>{}};
 try{saveTasks([{...DEFAULT_TASKS[0],title:'Before import'}]);const backup=JSON.parse(exportBackupJSON());backup.tasks[0].title='After import';fail=true;
 assert.equal(importBackupJSON(JSON.stringify(backup)),false);assert.equal(loadTasks()[0].title,'Before import');
 assert.equal(importBackupJSON(JSON.stringify(backup)),true);assert.equal(loadTasks()[0].title,'After import');assert.equal(restoreSafetyBackup(),true);assert.equal(loadTasks()[0].title,'Before import');
 }finally{delete (globalThis as any).window}
 });

 it('consumes each protected day once across reopenings',()=>{const stats={...DEFAULT_STATS,currentStreak:5,longestStreak:5,streakShields:2,lastActiveDate:'2026-11-02'};const a=calculateDailyStreak(stats,'2026-11-04');const b=calculateDailyStreak(a.updatedStats,'2026-11-04');assert.equal(a.updatedStats.streakShields,1);assert.equal(b.updatedStats.streakShields,1);assert.deepEqual(a.updatedStats.protectedDates,['2026-11-03']);assert.equal(calculateStreakFromTasks([{...DEFAULT_TASKS[0],completedDates:['2026-11-02','2026-11-01']}],'2026-11-04',a.updatedStats.protectedDates),3)});
 it('protects two missed days with two shields, never spends today',()=>{const a=calculateDailyStreak({...DEFAULT_STATS,currentStreak:4,streakShields:2,lastActiveDate:'2026-11-01'},'2026-11-04');assert.equal(a.updatedStats.streakShields,0);assert.deepEqual(a.updatedStats.protectedDates,['2026-11-02','2026-11-03'])});
 it('does not invent pre-creation opportunities',()=>{const today=getTodayDateString();const list=getPast7DaysCompletion([{...DEFAULT_TASKS[0],createdAt:today+'T00:00:00',completedDates:[]}]);assert.equal(list.reduce((n,d)=>n+d.totalAvailable,0),1)});
 it('honours historical snapshot after schedule changes and archive',()=>{const records=getPast7DaysCompletion([{...DEFAULT_TASKS[0],archived:true,archivedAt:getTodayDateString(),history:[{date:getPast7DaysCompletion([])[0].date,totalAvailable:1,completedCount:1,xpEarned:20}]}]);assert.equal(records[0].xpEarned,20);assert.equal(records[0].totalAvailable,1)});
 it('allows explicit zero XP while clamping invalid negative rewards',()=>{assert.equal(sanitizeImportedTask({xpValue:0}).xpValue,0);assert.equal(sanitizeImportedTask({xpValue:-4}).xpValue,5)});
 it('preserves implemented energy, language and intensity choices',()=>{const s=sanitizeImportedSettings({energyBattery:'low',language:'ko',celebrationIntensity:'vibrant',showXp:false,compactView:true});assert.equal(s.energyBattery,'low');assert.equal(s.language,'ko');assert.equal(s.celebrationIntensity,'vibrant');assert.equal(s.showXp,false);assert.equal(s.compactView,true)});
 it('rejects empty and malformed backup before writes',()=>{assert.throws(()=>previewBackup('{}'));assert.throws(()=>previewBackup('{"tasks":[null]}'));assert.equal(previewBackup('{"tasks":[]}').tasks,0)});
 it('limits low-energy focus options consistently',()=>{assert.equal(matchesEnergy({...DEFAULT_TASKS[0],priority:'high',estimatedMinutes:2},'low'),false);assert.equal(matchesEnergy({...DEFAULT_TASKS[0],priority:'medium',estimatedMinutes:2},'low'),true)});
 it('separates health administration from taking medication',async()=>{const steps=await generateMagicSubTasks('Prescription call');assert(steps.some(s=>s.title.includes('contact')));assert(!steps.some(s=>/swallow|dose|take your/i.test(s.title)))});
 it('does not schedule before createdAt',()=>{assert.equal(isTaskScheduledForToday({...DEFAULT_TASKS[0],createdAt:'2026-11-04T14:00:00Z'},'2026-11-03'),false)});
 it('returns localised, safe editable generic steps in non-English journeys',async()=>{for(const lang of ['es','fr','de','pt','it','ja','zh','ko'] as const){const steps=await generateMagicSubTasks('Prescription call',undefined,lang);assert.equal(steps.length,4);assert(!steps.some(s=>s.title.includes('Gather')||s.title.includes('dose')))}});
 it('uses local dates across BST midnight and DST date arithmetic',()=>{assert.equal(isTaskScheduledForToday({...DEFAULT_TASKS[0],createdAt:'2026-07-01T23:30:00Z'},'2026-07-01'),process.env.TZ==='Europe/London'?false:true);assert.equal(isTaskScheduledForToday({...DEFAULT_TASKS[0],recurrenceType:'custom_days',daysOfWeek:[],createdAt:'2026-01-01T00:00:00Z'},'2026-11-05'),false)});
 it('has complete added UI dictionaries for all eight translated languages',()=>{for(const [lang,row] of Object.entries(UI_COPY_TRANSLATIONS)){assert.equal(row.length,UI_COPY_KEYS.length,lang);assert(row.every(x=>typeof x==='string'&&x.length>0))}});
});
