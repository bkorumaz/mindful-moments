
import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Calendar as CalendarIcon, Clock, Link as LinkIcon, ListTodo, Pause, Pencil, Play, Plus, Trash2, Tv, X, Pin,
  Film, BookOpen, MountainSnow, Sun, Moon, Search, ArrowUpDown, Thermometer, Wind, MapPin, Cloud, CloudRain, Snowflake,
} from "lucide-react";

// Utilities
const STORAGE = {
  get: (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
};
function useLocalState(key, initial){ const [s, setS] = useState(()=> STORAGE.get(key, initial)); useEffect(()=> STORAGE.set(key, s), [key, s]); return [s, setS]; }
function useClock(){ const [now,setNow]=useState(new Date()); useEffect(()=>{ const id=setInterval(()=> setNow(new Date()),1000); return ()=> clearInterval(id); },[]); return now }

// Ambient
const AMBIENTS=[ {id:'auto',name:'Auto'},{id:'forest',name:'Forest'},{id:'ocean',name:'Ocean'},{id:'sunset',name:'Sunset'},{id:'city',name:'City'} ];
const AmbientContext = createContext({ ambient:'auto', effective:'forest', setAmbient:()=>{} });
function useAmbientAuto(selected){
  const [autoAmbient, setAutoAmbient] = useState('forest');
  useEffect(()=>{
    if(selected!=='auto') return;
    const hour = new Date().getHours();
    const fallback = hour>=19 || hour<=5 ? 'city' : hour>=17 ? 'sunset' : 'forest';
    if(!navigator.geolocation){ setAutoAmbient(fallback); return; }
    const controller = new AbortController();
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const { latitude:lat, longitude:lon } = pos.coords;
      try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`;
        const r = await fetch(url, { signal: controller.signal });
        const j = await r.json();
        const code = j?.current?.weather_code;
        let amb = fallback;
        const rainy = [51,53,55,61,63,65,80,81,82,95,96,99];
        const cloudy = [2,3,45,48];
        if(rainy.includes(code)) amb='ocean';
        else if(cloudy.includes(code)) amb = hour>=18 ? 'sunset' : 'forest';
        else if(hour>=19 || hour<=5) amb='city';
        else if(hour>=17 && hour<=20) amb='sunset';
        else amb='forest';
        setAutoAmbient(amb);
      } catch { setAutoAmbient(fallback); }
    }, ()=> setAutoAmbient(fallback), { maximumAge: 60_000, timeout: 5_000 });
    return ()=> controller.abort();
  },[selected]);
  return selected==='auto' ? autoAmbient : selected;
}
function AmbientProvider({children}){
  const [ambient, setAmbient] = useLocalState('dd_ambient_global','auto');
  const effective = useAmbientAuto(ambient);
  return <AmbientContext.Provider value={{ ambient, effective, setAmbient }}>{children}</AmbientContext.Provider>;
}
function useAmbient(){ return useContext(AmbientContext); }
function GlobalAmbientBackdrop(){
  const { effective } = useAmbient();
  const p={ forest:['from-emerald-400/10 via-teal-400/10 to-lime-400/10','radial-gradient(40% 40% at 20% 30%, rgba(16,185,129,.22), transparent), radial-gradient(30% 30% at 80% 70%, rgba(34,197,94,.18), transparent)'], ocean:['from-sky-500/10 via-cyan-500/10 to-indigo-500/10','radial-gradient(40% 40% at 20% 30%, rgba(14,165,233,.20), transparent), radial-gradient(30% 30% at 80% 70%, rgba(6,182,212,.18), transparent)'], sunset:['from-rose-500/10 via-amber-500/10 to-fuchsia-500/10','radial-gradient(40% 40% at 20% 30%, rgba(244,63,94,.20), transparent), radial-gradient(30% 30% at 80% 70%, rgba(245,158,11,.18), transparent)'], city:['from-slate-500/10 via-indigo-500/10 to-fuchsia-500/10','radial-gradient(40% 40% at 20% 30%, rgba(100,116,139,.20), transparent), radial-gradient(30% 30% at 80% 70%, rgba(79,70,229,.16), transparent)'], }[effective] || [];
  return (<><motion.div aria-hidden className={`fixed inset-0 -z-10 bg-gradient-to-br ${p[0]||''}`} animate={{opacity:[0.96,1,0.98,1]}} transition={{duration:12,repeat:Infinity,ease:'easeInOut'}}/><motion.div aria-hidden className="fixed -inset-20 -z-10 blur-3xl opacity-60" style={{background:p[1]||''}} animate={{x:[0,12,-10,0],y:[0,-6,10,0]}} transition={{duration:18,repeat:Infinity,ease:'easeInOut'}}/></>);
}

// Greeting Bar
function GreetingBar({ dark, setDark, glass, setGlass, onGreetingChange }){
  const now = useClock();
  const hours = now.getHours();
  const greet = hours < 5 ? "Night owl" : hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";
  const { ambient, setAmbient, effective } = useAmbient();
  useEffect(()=>{ onGreetingChange?.(`${greet}, Bahadır`); },[greet,onGreetingChange]);
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20">
          <MountainSnow className="w-6 h-6" />
        </motion.div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{greet}, Bahadır</h1>
          <p className="text-xs text-muted-foreground">Welcome back — let’s make today count.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="hidden sm:flex">v0.5.1 · Concept</Badge>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="opacity-70">Ambient</span>
          <select value={ambient} onChange={(e)=>setAmbient(e.target.value)} className="border rounded-xl px-2 py-1 bg-background capitalize">
            {AMBIENTS.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <Badge variant="secondary" className="capitalize">{effective}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="opacity-70">Glass</span>
          <Switch checked={glass} onCheckedChange={setGlass} />
          <Sun className="w-4 h-4" />
          <Switch checked={dark} onCheckedChange={setDark} />
          <Moon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// Mindful Moment
const QUOTES=[ "What gets scheduled gets done.","Small steps, big results.","Focus is the art of saying no.","Win the morning, win the day.","Clarity breeds consistency.","Done is better than perfect." ];
const BREATH_CYCLE=[ {name:'Inhale',dur:4}, {name:'Hold',dur:4}, {name:'Exhale',dur:6} ];
const TOTAL_BREATH=14;
function BreathCoach({ onClose }){
  const [phase,setPhase]=useState('Inhale'); const [progress,setProgress]=useState(0);
  useEffect(()=>{ let raf; const start=performance.now(); const loop=(t)=>{ const elapsed=((t-start)/1000)%TOTAL_BREATH; let acc=0; let cur=BREATH_CYCLE[0]; for(const step of BREATH_CYCLE){ if(elapsed>=acc && elapsed<acc+step.dur){ cur=step; setPhase(step.name); setProgress((elapsed-acc)/step.dur); break } acc+=step.dur } raf=requestAnimationFrame(loop) }; raf=requestAnimationFrame(loop); return ()=> cancelAnimationFrame(raf) },[]);
  const keyTimes=[0,4/14,8/14,1];
  return (
    <div className="mt-3 rounded-2xl border p-4 relative overflow-hidden supports-[backdrop-filter]:backdrop-blur-sm bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10">
      <div className="flex items-center justify-between"><p className="text-sm font-medium">Guided breathing (4–4–6)</p><Button size="sm" variant="ghost" onClick={onClose}>Close</Button></div>
      <div className="h-48 flex items-center justify-center relative">
        <motion.div className="w-32 h-32 rounded-full bg-indigo-500/30" animate={{scale:[1,1.15,1.15,1],opacity:[.7,.9,.9,.7]}} transition={{duration:TOTAL_BREATH,times:keyTimes,repeat:Infinity,ease:'easeInOut'}}/>
        <div className="absolute"><svg width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="68" stroke="rgba(99,102,241,.25)" strokeWidth="6" fill="none"/><motion.circle cx="80" cy="80" r="68" stroke="rgba(99,102,241,.8)" strokeWidth="6" fill="none" strokeDasharray={2*Math.PI*68} strokeDashoffset={(1-progress)*2*Math.PI*68} /></svg></div>
      </div>
      <p className="text-center text-sm">{phase}…</p>
      <p className="text-center text-xs text-muted-foreground">Breathe with the circle • 14s cycle</p>
    </div>
  );
}
function MindfulMoment(){ const idx=(new Date().getDate()+new Date().getMonth())%QUOTES.length; const [showBreath,setShowBreath]=useState(false); return (<Card className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10"><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between gap-2"><div><p className="text-xs text-muted-foreground">Mindful Moment</p><p className="text-base sm:text-lg mt-1">“{QUOTES[idx]}”</p></div><Button size="sm" onClick={()=> setShowBreath(v=>!v)}>Take a Breath</Button></div>{showBreath && <BreathCoach onClose={()=> setShowBreath(false)} />}</CardContent></Card>); }

// Weather + Clock
const WMAP={ 0:{t:'Clear',icon:<Sun className="w-5 h-5"/>},1:{t:'Mainly clear',icon:<Sun className="w-5 h-5"/>},2:{t:'Clouds',icon:<Cloud className="w-5 h-5"/>},3:{t:'Overcast',icon:<Cloud className="w-5 h-5"/>},45:{t:'Fog',icon:<Cloud className="w-5 h-5"/>},48:{t:'Rime fog',icon:<Cloud className="w-5 h-5"/>},51:{t:'Drizzle',icon:<CloudRain className="w-5 h-5"/>},53:{t:'Drizzle',icon:<CloudRain className="w-5 h-5"/>},55:{t:'Drizzle',icon:<CloudRain className="w-5 h-5"/>},61:{t:'Rain',icon:<CloudRain className="w-5 h-5"/>},63:{t:'Rain',icon:<CloudRain className="w-5 h-5"/>},65:{t:'Rain',icon:<CloudRain className="w-5 h-5"/>},71:{t:'Snow',icon:<Snowflake className="w-5 h-5"/>},73:{t:'Snow',icon:<Snowflake className="w-5 h-5"/>},75:{t:'Snow',icon:<Snowflake className="w-5 h-5"/>},77:{t:'Snow grains',icon:<Snowflake className="w-5 h-5"/>},80:{t:'Showers',icon:<CloudRain className="w-5 h-5"/>},81:{t:'Showers',icon:<CloudRain className="w-5 h-5"/>},82:{t:'Heavy showers',icon:<CloudRain className="w-5 h-5"/>},95:{t:'Thunderstorm',icon:<CloudRain className="w-5 h-5"/>},96:{t:'Thunderstorm',icon:<CloudRain className="w-5 h-5"/>},99:{t:'Thunderstorm',icon:<CloudRain className="w-5 h-5"/>} };
function useWeather(){ const [state,setState]=useState({loading:true,city:'',temp:null,hi:null,lo:null,wind:null,code:2}); useEffect(()=>{ if(!navigator.geolocation){ setState(s=>({...s,loading:false})); return } let cancel=false; const controller=new AbortController(); navigator.geolocation.getCurrentPosition(async (pos)=>{ const {latitude:lat,longitude:lon}=pos.coords; try{ const resp1=await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`,{signal:controller.signal}); const geo=await resp1.json(); const city=geo?.results?.[0]?.city||geo?.results?.[0]?.name||'Your location'; const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`; const r=await fetch(url,{signal:controller.signal}); const j=await r.json(); if(cancel) return; const code=j?.current?.weather_code??2; setState({loading:false,city,temp:Math.round(j?.current?.temperature_2m??0),hi:Math.round(j?.daily?.temperature_2m_max?.[0]??0),lo:Math.round(j?.daily?.temperature_2m_min?.[0]??0),wind:Math.round(j?.current?.wind_speed_10m??0),code}) }catch{ if(!cancel) setState(s=>({...s,loading:false})) } },()=> setState(s=>({...s,loading:false})),{maximumAge:60000,timeout:5000}); return ()=>{ cancel=true; controller.abort() } },[]); return state }
function paletteFor(code){ const hour=new Date().getHours(); const night=hour>=19||hour<6; const rain=[51,53,55,61,63,65,80,81,82,95,96,99]; const snow=[71,73,75,77]; const cloudy=[2,3,45,48]; if(snow.includes(code)) return { base:'from-sky-200/40 via-slate-200/30 to-indigo-200/30', blobs:['radial-gradient(40% 40% at 20% 30%, rgba(191,219,254,.55), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(203,213,225,.45), transparent)'] }; if(rain.includes(code)) return { base:'from-sky-600/30 via-cyan-600/25 to-indigo-600/25', blobs:['radial-gradient(40% 40% at 20% 30%, rgba(14,165,233,.45), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(6,182,212,.35), transparent)'] }; if(cloudy.includes(code)) return { base:'from-slate-500/30 via-sky-500/20 to-indigo-500/20', blobs:['radial-gradient(40% 40% at 20% 30%, rgba(100,116,139,.40), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(59,130,246,.25), transparent)'] }; if(night) return { base:'from-indigo-800/35 via-purple-800/25 to-fuchsia-700/20', blobs:['radial-gradient(40% 40% at 20% 30%, rgba(67,56,202,.50), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(168,85,247,.35), transparent)'] }; return { base:'from-amber-400/30 via-orange-400/20 to-sky-400/20', blobs:['radial-gradient(40% 40% at 20% 30%, rgba(251,191,36,.45), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(59,130,246,.30), transparent)'] } }
function HereAndNow({ glass, title }){ const now=useClock(); const weather=useWeather(); const hours=now.getHours(); const mins=now.getMinutes(); const secs=now.getSeconds(); const time=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}); const date=now.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'}); const pctDay=Math.round(((hours*60+mins+secs/60)/(24*60))*100); const pal=paletteFor(weather.code||2); return (<Card className={`rounded-2xl overflow-hidden relative ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/30 dark:bg-slate-900/20 border-white/40 dark:border-white/10':''}`}><motion.div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${pal.base}`} animate={{opacity:[.9,1,.95,1]}} transition={{duration:10,repeat:Infinity,ease:'easeInOut'}}/><motion.div aria-hidden className="absolute -inset-20 blur-3xl opacity-60" style={{background:pal.blobs.join(',')}} animate={{x:[0,15,-10,0],y:[0,-8,10,0]}} transition={{duration:16,repeat:Infinity,ease:'easeInOut'}}/><CardHeader className="relative pb-2"><CardTitle className="flex items-center gap-2"><Thermometer className="w-5 h-5"/> {title||'Here & Now'}</CardTitle><CardDescription>Time, date and local weather in one glance.</CardDescription></CardHeader><CardContent className="relative">{weather.loading? (<div className="text-sm text-muted-foreground">Fetching weather…</div>):(<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"><div><div className="text-4xl sm:text-5xl font-semibold tabular-nums">{time}</div><div className="text-sm text-muted-foreground">{date}</div><div className="text-right text-xs text-muted-foreground mt-2"><div>Day progress</div><div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500" style={{width:`${pctDay}%`}}/></div><div className="tabular-nums mt-1">{pctDay}%</div></div></div><div className="sm:text-right"><div className="flex sm:justify-end items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4"/>{weather.city}</div><div className="text-4xl font-semibold mt-1 tabular-nums">{weather.temp}°</div><div className="text-sm text-muted-foreground flex sm:justify-end items-center gap-2">{(WMAP[weather.code]||{}).icon}<span>{(WMAP[weather.code]||{t:'—'}).t}</span><span className="h-1 w-1 rounded-full bg-slate-400/50 inline-block mx-1"/> H {weather.hi}° • L {weather.lo}°</div><div className="text-xs text-muted-foreground mt-1 inline-flex sm:justify-end items-center gap-1"><Wind className="w-4 h-4"/> {weather.wind} km/h</div></div></div>)}</CardContent></Card>) }

// Pomodoro
function AmbientLayers({mode,active}){ const p={ forest:['from-emerald-400/15 via-teal-400/15 to-lime-400/15',['radial-gradient(40% 40% at 20% 30%, rgba(16,185,129,.35), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(34,197,94,.30), transparent)','radial-gradient(25% 25% at 50% 90%, rgba(132,204,22,.25), transparent)'],], ocean:['from-sky-500/15 via-cyan-500/15 to-indigo-500/15',['radial-gradient(40% 40% at 20% 30%, rgba(14,165,233,.35), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(6,182,212,.30), transparent)','radial-gradient(25% 25% at 50% 90%, rgba(99,102,241,.25), transparent)'],], sunset:['from-rose-500/15 via-amber-500/15 to-fuchsia-500/15',['radial-gradient(40% 40% at 20% 30%, rgba(244,63,94,.35), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(245,158,11,.30), transparent)','radial-gradient(25% 25% at 50% 90%, rgba(217,70,239,.25), transparent)'],], city:['from-slate-500/15 via-indigo-500/15 to-fuchsia-500/15',['radial-gradient(40% 40% at 20% 30%, rgba(100,116,139,.35), transparent)','radial-gradient(30% 30% at 80% 70%, rgba(79,70,229,.30), transparent)','radial-gradient(25% 25% at 50% 90%, rgba(236,72,153,.25), transparent)'],], }[mode] || [] ; const base=p[0]||''; const blobs=(p[1]||[]).join(','); return (<><motion.div aria-hidden initial={{opacity:0}} animate={{opacity:active?1:.4}} transition={{duration:.6}} className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${base}`} /><motion.div aria-hidden className="absolute -inset-20 blur-3xl opacity-60" animate={{x:active?[0,18,-18,0]:0,y:active?[0,-12,12,0]:0,scale:active?[1,1.04,.98,1]:1}} transition={{duration:10,repeat:active?Infinity:0,ease:'easeInOut'}} style={{background:blobs}}/></>) }
function Pomodoro({glass}){ const [phase,setPhase]=useLocalState('dd_pomo_phase','idle'); const [secondsLeft,setSecondsLeft]=useLocalState('dd_pomo_seconds',25*60); const [auto,setAuto]=useLocalState('dd_pomo_auto',true); const timerRef=useRef(null); const { effective } = useAmbient(); useEffect(()=>{ if(phase==='running'){ timerRef.current=setInterval(()=> setSecondsLeft(s=> s<=1?0:s-1),1000); return ()=> clearInterval(timerRef.current) } },[phase]); useEffect(()=>{ if(secondsLeft===0){ if(auto){ const next=phase==='break'?'running':'break'; setPhase(next); setSecondsLeft(next==='running'?25*60:5*60) } else { setPhase('idle') } } },[secondsLeft]); const mm=String(Math.floor(secondsLeft/60)).padStart(2,'0'); const ss=String(secondsLeft%60).padStart(2,'0'); const running=phase==='running'; const isBreak=phase==='break'; return (<Card className={`rounded-2xl overflow-hidden relative ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><AmbientLayers mode={effective} active={running||isBreak} /><CardHeader className="relative pb-3"><div className="flex items-center justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5"/> Pomodoro</CardTitle><CardDescription>Animated ambience • 25/5 with auto-break</CardDescription></div><Badge variant="secondary" className="capitalize">{effective}</Badge></div></CardHeader><CardContent className="relative flex flex-col items-center gap-4"><div className="text-5xl font-semibold tabular-nums tracking-tight">{mm}:{ss}</div><div className="flex items-center gap-2">{phase!=='running'? (<Button onClick={()=> setPhase('running')}><Play className="w-4 h-4 mr-1"/> {phase==='paused'? 'Resume':'Start'}</Button>):(<Button onClick={()=> setPhase('paused')} variant="secondary"><Pause className="w-4 h-4 mr-1"/> Pause</Button>)}<Button variant="outline" onClick={()=> { setPhase('break'); setSecondsLeft(5*60) }}>Break</Button><Button variant="ghost" onClick={()=> { setPhase('idle'); setSecondsLeft(25*60) }}>Reset</Button></div><div className="flex items-center gap-2 text-sm"><span>Auto switch</span><Switch checked={auto} onCheckedChange={setAuto} /></div></CardContent></Card>) }

// Tasks & Notes
function TaskBoard({glass}){ const [tasks,setTasks]=useLocalState('dd_tasks',[]); const [text,setText]=useState(''); const [category,setCategory]=useState('sky'); const [filter,setFilter]=useState('all'); const cats=[{id:'sky',name:'Sky',dot:'bg-sky-500',classes:'bg-sky-100 text-sky-900 border-sky-200'},{id:'rose',name:'Rose',dot:'bg-rose-500',classes:'bg-rose-100 text-rose-900 border-rose-200'},{id:'amber',name:'Amber',dot:'bg-amber-500',classes:'bg-amber-100 text-amber-900 border-amber-200'},{id:'emerald',name:'Emerald',dot:'bg-emerald-500',classes:'bg-emerald-100 text-emerald-900 border-emerald-200'},{id:'violet',name:'Violet',dot:'bg-violet-500',classes:'bg-violet-100 text-violet-900 border-violet-200'},{id:'slate',name:'Slate',dot:'bg-slate-500',classes:'bg-slate-100 text-slate-900 border-slate-200'}]; const filtered=useMemo(()=> tasks.filter(t=> filter==='all'? true : t.category===filter),[tasks,filter]); function addTask(){ if(!text.trim()) return; const t={id:crypto.randomUUID(),text:text.trim(),done:false,doneAt:null,createdAt:Date.now(),category,pinned:false}; setTasks([t,...tasks]); setText('') } function toggleDone(id){ setTasks(ts=> ts.map(t=> t.id===id? {...t,done:!t.done,doneAt:!t.done?Date.now():null}:t)) } function del(id){ setTasks(ts=> ts.filter(t=> t.id!==id)) } function pin(id){ setTasks(ts=> ts.map(t=> t.id===id? {...t,pinned:!t.pinned}:t)) } return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><ListTodo className="w-5 h-5"/> Tasks</CardTitle><CardDescription>Quick capture and color-coded lists.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex flex-col sm:flex-row gap-2"><Input placeholder="Add a task…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && addTask()} /><select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded-xl px-2 py-2 text-sm">{cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select><Button onClick={addTask}><Plus className="w-4 h-4 mr-1"/>Add</Button></div><div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Filter:</span><div className="flex flex-wrap gap-1"><Button size="sm" variant={filter==='all'? 'default':'outline'} onClick={()=>setFilter('all')}>All</Button>{cats.map(c=> (<Button key={c.id} size="sm" variant={filter===c.id? 'default':'outline'} onClick={()=>setFilter(c.id)}><span className={`w-2 h-2 rounded-full ${c.dot} inline-block mr-2`}/> {c.name}</Button>))}</div></div><div className="space-y-2"><AnimatePresence>{filtered.sort((a,b)=> (a.pinned===b.pinned? b.createdAt-a.createdAt : a.pinned? -1:1)).map(t=> (<motion.div key={t.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}><div className={`border rounded-2xl p-3 flex items-center gap-3 justify-between ${cats.find(c=>c.id===t.category)?.classes}`}><div className="flex items-center gap-3"><Checkbox checked={t.done} onCheckedChange={()=>toggleDone(t.id)} /><div><p className={`text-sm ${t.done? 'line-through opacity-70':''}`}>{t.text}</p><div className="text-xs opacity-70 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${cats.find(c=>c.id===t.category)?.dot}`}/>{t.done? `Done • ${new Date(t.doneAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:'Inbox'}</div></div></div><div className="flex items-center gap-1"><Button size="icon" variant={t.pinned? 'default':'ghost'} onClick={()=>pin(t.id)} title="Pin"><Pin className="w-4 h-4"/></Button><Button size="icon" variant="ghost" onClick={()=>del(t.id)} title="Delete"><Trash2 className="w-4 h-4"/></Button></div></div></motion.div>))}</AnimatePresence></div></CardContent></Card>) }
function NotesWall({glass}){ const [notes,setNotes]=useLocalState('dd_notes',[]); const [text,setText]=useState(''); const [category,setCategory]=useState('violet'); function addNote(){ if(!text.trim()) return; const n={id:crypto.randomUUID(),text:text.trim(),category,createdAt:Date.now()}; setNotes([n,...notes]); setText('') } function del(id){ setNotes(ns=> ns.filter(n=> n.id!==id)) } return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Pencil className="w-5 h-5"/> Notes</CardTitle><CardDescription>Color-coded sticky notes for quick thoughts.</CardDescription></CardHeader><CardContent><div className="flex flex-col sm:flex-row gap-2"><Textarea placeholder="Write a note…" value={text} onChange={e=>setText(e.target.value)} /><div className="flex sm:flex-col gap-2"><select value={category} onChange={(e)=>setCategory(e.target.value)} className="border rounded-xl px-2 py-2 text-sm"><option value="violet">Violet</option><option value="emerald">Emerald</option><option value="rose">Rose</option><option value="amber">Amber</option><option value="slate">Slate</option></select><Button onClick={addNote}><Plus className="w-4 h-4 mr-1"/>Add</Button></div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">{notes.map(n=>{ const map={violet:'bg-violet-100 text-violet-900 border-violet-200', emerald:'bg-emerald-100 text-emerald-900 border-emerald-200', rose:'bg-rose-100 text-rose-900 border-rose-200', amber:'bg-amber-100 text-amber-900 border-amber-200', slate:'bg-slate-100 text-slate-900 border-slate-200'}; const c=map[n.category]||'bg-slate-100 text-slate-900 border-slate-200'; return (<div key={n.id} className={`rounded-2xl border p-3 ${c}`}><div className="text-xs opacity-70 mb-1">{new Date(n.createdAt).toLocaleString()}</div><p className="whitespace-pre-wrap text-sm leading-relaxed">{n.text}</p><div className="flex justify-end mt-2"><Button size="icon" variant="ghost" onClick={()=>del(n.id)} title="Delete"><Trash2 className="w-4 h-4"/></Button></div></div>) })}</div></CardContent></Card>) }

// Reading
function StatPill({label,frac,pct,tone='indigo'}){ const toneBg=tone==='teal'?'bg-teal-500/15':'bg-indigo-500/15'; const fill=tone==='teal'?'bg-teal-500/40':'bg-indigo-500/40'; return (<div className={`relative overflow-hidden rounded-full border px-3 py-1.5 text-xs ${toneBg}`}><div className={`absolute inset-y-0 left-0 ${fill}`} style={{width:`${Math.min(100,Math.max(0,pct))}%`}}/><div className="relative z-10 font-medium tabular-nums">{label}: {frac} ({pct}%)</div></div>) }
function ReadingTracker({glass}){ const [days,setDays]=useLocalState('dd_reading',{}); const [selectedKey,setSelectedKey]=useState(null); const today=new Date(); const todayKey=today.toISOString().slice(0,10); function toggle(key){ setDays(d=>({...d,[key]:!d[key]})); setSelectedKey(key) } const last30=Array.from({length:30}).map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(29-i)); return {key:d.toISOString().slice(0,10), d} }); const readCount30=last30.filter(x=>days[x.key]).length; const pct30=Math.round((readCount30/30)*100); let streak=0; for(let i=last30.length-1;i>=0;i--){ if(days[last30[i].key]) streak++; else break } const week=last30.slice(-7); const weekCount=week.filter(x=>days[x.key]).length; const pct7=Math.round((weekCount/7)*100); const dd=(d)=> String(d.getDate()).padStart(2,'0'); return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5"/> Reading</CardTitle><CardDescription>Mark whether you read today. Streaks & 30-day consistency.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center gap-2 flex-wrap"><Button className="whitespace-nowrap min-w-[12.5rem]" variant={days[todayKey]?'default':'outline'} onClick={()=>toggle(todayKey)}>{days[todayKey]? 'Read today ✓':'Mark read today'}</Button><Badge variant="secondary">Streak: {streak}d</Badge><StatPill label="7d" frac={`${weekCount}/7`} pct={pct7} tone="indigo"/><StatPill label="30d" frac={`${readCount30}/30`} pct={pct30} tone="teal"/>{selectedKey && (<span className="text-xs text-muted-foreground">Selected: {new Date(selectedKey).toLocaleDateString()} — {days[selectedKey]? 'Read':'No'}</span>)}</div><div className="grid grid-cols-10 gap-1 sm:gap-1.5">{last30.map(x=>{ const isTodayCell=x.key===todayKey; const isOn=!!days[x.key]; return (<button key={x.key} onClick={()=>toggle(x.key)} title={`${x.d.toLocaleDateString()} — ${isOn?'Read':'No'}`} className={`relative h-8 rounded-md border transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isOn? 'bg-emerald-500/80 border-emerald-600 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'} ${isTodayCell? 'ring-2 ring-indigo-500 ring-offset-0':''}`}><span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[10px] opacity-80">{String(x.d.getDate()).padStart(2,'0')}</span></button>) })}</div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"/> Read</span><span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm border inline-block"/> No</span><span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm ring-2 ring-indigo-500 inline-block"/> Today</span></div></CardContent></Card>) }

// Music
function MusicPlayer({glass}){ const [url,setUrl]=useLocalState('dd_music_url',''); const listId=useMemo(()=>{ if(!url) return ''; try{ const u=new URL(url); return u.searchParams.get('list')||'' }catch{ return '' } },[url]); const [temp,setTemp]=useState(url); function save(){ setUrl(temp.trim()) } return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Tv className="w-5 h-5"/> Music</CardTitle><CardDescription>Play your YouTube/YouTube Music playlist.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-4 gap-2"><Input className="sm:col-span-3" placeholder="https://www.youtube.com/playlist?list=..." value={temp} onChange={e=>setTemp(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && save()} /><Button onClick={save}>Save</Button></div>{listId? (<div className="aspect-video w-full rounded-xl overflow-hidden border"><iframe className="w-full h-full" src={`https://www.youtube.com/embed/videoseries?rel=0&iv_load_policy=3&modestbranding=1&list=${listId}`} title="YouTube playlist" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>) : (<div className="text-sm text-muted-foreground">Paste a playlist URL above to start listening.</div>)}</CardContent></Card>) }

// Watchlist single-line
function Watchlist({glass}){ const [items,setItems]=useLocalState('dd_watch',[]); const [title,setTitle]=useState(''); const [type,setType]=useState('movie'); const [platform,setPlatform]=useState(''); const [priority,setPriority]=useState('2'); const [statusFilter,setStatusFilter]=useState('all'); const [searchQ,setSearchQ]=useState(''); const [sort,setSort]=useState('added'); useEffect(()=>{ setItems((xs)=> xs.map((x)=>({ id:x.id, title:x.title, type:x.type||'movie', platform:x.platform??'', priority: typeof x.priority==='number'? x.priority:2, status:x.status||'queue', season:x.season??(x.type==='series'?1:1), episode:x.episode??(x.type==='series'?1:1), addedAt:x.addedAt||Date.now(), startedAt:x.startedAt??null, finishedAt:x.finishedAt??null, notes:x.notes??'' }))) },[]); function add(){ if(!title.trim()) return; const it={id:crypto.randomUUID(),title:title.trim(),type,platform:platform.trim(),priority:Number(priority),status:'queue',season:1,episode:1,addedAt:Date.now(),startedAt:null,finishedAt:null,notes:''}; setItems([it,...items]); setTitle('') } function advance(id){ setItems(xs=> xs.map(x=> x.id===id? {...x,status:x.status==='queue'? 'watching' : x.status==='watching'? 'done':'queue',startedAt:x.status==='queue'? Date.now():x.startedAt, finishedAt:x.status==='watching'? Date.now():x.finishedAt}:x)) } function del(id){ setItems(xs=> xs.filter(x=> x.id!==id)) } function bumpEp(id,d){ setItems(xs=> xs.map(x=> x.id===id? {...x,episode:Math.max(1,x.episode+d)}:x)) } function bumpSeason(id,d){ setItems(xs=> xs.map(x=> x.id===id? {...x,season:Math.max(1,x.season+d)}:x)) } const filtered=items.filter(i=> (statusFilter==='all'||i.status===statusFilter) && (searchQ? i.title.toLowerCase().includes(searchQ.toLowerCase()):true)); const sorted=[...filtered].sort((a,b)=> sort==='title'? a.title.localeCompare(b.title): b.addedAt-a.addedAt); const counts={queue:items.filter(i=>i.status==='queue').length, watching:items.filter(i=>i.status==='watching').length, done:items.filter(i=>i.status==='done').length}; const badgeFor=s=> s==='queue'? 'outline' : s==='watching'? 'secondary' : 'default'; const priorityCard=p=> p===1? 'border-rose-300 bg-rose-50 dark:bg-rose-900/20' : p===2? 'border-amber-300 bg-amber-50 dark:bg-amber-900/10' : 'border-slate-200 bg-white dark:bg-slate-900/40'; const priorityPill=p=> p===1? 'bg-rose-100 text-rose-900 border-rose-200' : p===2? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-slate-100 text-slate-900 border-slate-200'; return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Tv className="w-5 h-5"/> Watchlist</CardTitle><CardDescription>Track movies/series with filters, sorting & progress.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2 items-center"><div className="inline-flex rounded-xl border overflow-hidden"><Button variant={type==='movie'? 'default':'ghost'} className="rounded-none" onClick={()=>setType('movie')}><Film className="w-4 h-4 mr-1"/>Movie</Button><Button variant={type==='series'? 'default':'ghost'} className="rounded-none" onClick={()=>setType('series')}><BookOpen className="w-4 h-4 mr-1"/>Series</Button></div><Input className="min-w-[12rem] flex-1" placeholder="Title…" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && add()} /><Input className="w-48" placeholder="Platform (e.g., Netflix)" value={platform} onChange={e=>setPlatform(e.target.value)} /><select value={priority} onChange={e=>setPriority(e.target.value)} className="border rounded-xl px-2 py-2 text-sm"><option value="1">High</option><option value="2">Medium</option><option value="3">Low</option></select><Button onClick={add}><Plus className="w-4 h-4 mr-1"/>Add</Button></div><div className="flex flex-wrap items-center gap-2 text-sm"><div className="inline-flex gap-2"><Button size="sm" variant={statusFilter==='all'? 'default':'outline'} onClick={()=>setStatusFilter('all')}>All</Button><Button size="sm" variant={statusFilter==='queue'? 'default':'outline'} onClick={()=>setStatusFilter('queue')}>Queue</Button><Button size="sm" variant={statusFilter==='watching'? 'default':'outline'} onClick={()=>setStatusFilter('watching')}>Watching</Button><Button size="sm" variant={statusFilter==='done'? 'default':'outline'} onClick={()=>setStatusFilter('done')}>Done</Button></div><div className="flex items-center gap-1 ml-auto"><Search className="w-4 h-4 opacity-60"/><Input className="h-8 w-40" placeholder="Search…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} /><Button size="sm" variant="outline" onClick={()=> setSort(sort==='added'? 'title' : 'added')}><ArrowUpDown className="w-4 h-4 mr-1"/>{sort==='added'? 'Sort: Added' : 'Sort: Title'}</Button></div></div><div className="space-y-2">{sorted.map(i=> (<div key={i.id} className={`border rounded-2xl p-3 grid sm:grid-cols-12 gap-2 items-center ${priorityCard(i.priority)}`}><div className="sm:col-span-4"><div className="text-sm font-medium flex items-center gap-2"><Badge variant="outline" className="capitalize">{i.type}</Badge>{i.title}</div><div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5"><Badge variant="secondary">{i.platform||'—'}</Badge><Badge className={`border ${priorityPill(i.priority)}`}>P{(i.priority ?? 2)}</Badge><Badge variant={badgeFor(i.status)} className="capitalize">{i.status}</Badge></div></div>{i.type==='series'? (<div className="sm:col-span-4 flex items-center gap-2 justify-start"><div className="text-xs text-muted-foreground">S</div><Button size="icon" variant="outline" onClick={()=>bumpSeason(i.id,-1)}>-</Button><div className="w-10 text-center text-sm font-medium">{i.season}</div><Button size="icon" variant="outline" onClick={()=>bumpSeason(i.id,1)}>+</Button><div className="text-xs text-muted-foreground ml-3">E</div><Button size="icon" variant="outline" onClick={()=>bumpEp(i.id,-1)}>-</Button><div className="w-10 text-center text-sm font-medium">{i.episode}</div><Button size="icon" variant="outline" onClick={()=>bumpEp(i.id,1)}>+</Button></div>) : (<div className="sm:col-span-4 text-xs text-muted-foreground">—</div>)}<div className="sm:col-span-4 flex items-center justify-end gap-2"><Button size="sm" variant="secondary" onClick={()=>advance(i.id)}>{i.status==='queue'? 'Start' : i.status==='watching'? 'Finish' : 'Requeue'}</Button><Button size="icon" variant="ghost" onClick={()=>del(i.id)} title="Delete"><Trash2 className="w-4 h-4"/></Button></div></div>))}{sorted.length===0 && (<div className="text-sm text-muted-foreground">No items match your filters.</div>)}</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>Queue: {counts.queue}</span>•<span>Watching: {counts.watching}</span>•<span>Done: {counts.done}</span></div></CardContent></Card>) }

// Habits (fixed: history guard + migration)
function Habits({glass}){
  const [habits,setHabits]=useLocalState('dd_habits',[{id:'water',name:'Drink water',history:{}},{id:'move',name:'Move 20 min',history:{}}]);
  const [name,setName]=useState('');
  const todayKey=new Date().toISOString().slice(0,10);

  // Migrate existing items to ensure history is always an object
  useEffect(()=>{
    setHabits(hs => Array.isArray(hs) ? hs.map(h => ({ ...h, history: h && typeof h.history === 'object' ? h.history : {} })) : []);
  },[]);

  function add(){
    if(!name.trim()) return;
    setHabits([{id:crypto.randomUUID(),name:name.trim(),history:{}},...habits]);
    setName('');
  }
  function toggle(hid,key){
    setHabits(hs=> hs.map(h=> h.id===hid? {...h,history:{ ...(h.history||{}), [key]: !(h.history||{})[key] }}:h));
  }
  function del(id){ setHabits(hs=> hs.filter(h=> h.id!==id)) }
  function streakFor(h){
    const history = (h && h.history) ? h.history : {};
    const days=Array.from({length:60}).map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10) });
    let s=0;
    for(const k of days){ if(history[k]) s++; else break }
    return s
  }
  const last7=Array.from({length:7}).map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return {key:d.toISOString().slice(0,10), d} });
  const dd=(d)=> String(d.getDate()).padStart(2,'0');

  return (
    <Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}>
      <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><ListTodo className="w-5 h-5"/> Habits</CardTitle><CardDescription>Simple daily habit ticks. Reading is tracked separately.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="New habit…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && add()} />
          <Button onClick={add}><Plus className="w-4 h-4 mr-1"/>Add</Button>
        </div>
        <div className="space-y-2">
          {habits.map(h=> (
            <div key={h.id} className="border rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{h.name}</div>
                <div className="text-xs text-muted-foreground">Streak: {streakFor(h)}d</div>
              </div>
              <div className="grid grid-cols-7 gap-1 mt-2">
                {last7.map(x=>{
                  const on=!!((h.history||{})[x.key]);
                  const isToday=x.key===todayKey;
                  return (
                    <button key={x.key} onClick={()=>toggle(h.id,x.key)} title={`${x.d.toLocaleDateString()} — ${on?'Done':'No'}`}
                      className={`h-8 rounded-md border text-[10px] relative ${on? 'bg-emerald-500/80 border-emerald-600 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'} ${isToday?'ring-2 ring-indigo-500':''}`}>
                      <span className="absolute left-1/2 -translate-x-1/2 top-0.5 opacity-80">{dd(x.d)}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-end mt-2"><Button size="icon" variant="ghost" onClick={()=>del(h.id)} title="Delete"><Trash2 className="w-4 h-4"/></Button></div>
            </div>
          ))}
          {habits.length===0 && <div className="text-sm text-muted-foreground">No habits yet. Add one above.</div>}
        </div>
      </CardContent>
    </Card>
  )
}

// Day Planner & Links
function DayPlanner({glass}){ const [items,setItems]=useLocalState('dd_dayplan',[]); const [time,setTime]=useState(''); const [text,setText]=useState(''); function add(){ if(!time||!text.trim()) return; const it={id:crypto.randomUUID(),time,text:text.trim()}; setItems([...items,it].sort((a,b)=> a.time.localeCompare(b.time))); setTime(''); setText('') } function del(id){ setItems(xs=> xs.filter(x=> x.id!==id)) } return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> Day Planner</CardTitle><CardDescription>Block out your day with quick slots.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-4 gap-2"><Input type="time" value={time} onChange={e=>setTime(e.target.value)} /><Input className="sm:col-span-2" placeholder="What will you do?" value={text} onChange={e=>setText(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && add()} /><Button onClick={add}><Plus className="w-4 h-4 mr-1"/>Add</Button></div><div className="space-y-2">{items.map(i=> (<div key={i.id} className="border rounded-2xl p-3 flex items-center justify-between"><div className="font-mono text-sm w-20">{i.time}</div><div className="flex-1 px-2">{i.text}</div><Button size="icon" variant="ghost" onClick={()=>del(i.id)}><Trash2 className="w-4 h-4"/></Button></div>))}</div></CardContent></Card>) }
function LinksPinboard({glass}){ const [links,setLinks]=useLocalState('dd_links',[]); const [title,setTitle]=useState(''); const [url,setUrl]=useState(''); function add(){ if(!url.trim()) return; const l={id:crypto.randomUUID(),title:title.trim()||url,url:url.trim(),createdAt:Date.now()}; setLinks([l,...links]); setTitle(''); setUrl('') } function del(id){ setLinks(ls=> ls.filter(l=> l.id!==id)) } return (<Card className={`rounded-2xl ${glass? 'supports-[backdrop-filter]:backdrop-blur bg-white/40 dark:bg-slate-900/30 border-white/40 dark:border-white/10':''}`}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5"/> Pinned Links</CardTitle><CardDescription>Keep frequently used URLs at hand.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-3 gap-2"><Input placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} /><Input placeholder="https://…" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && add()} /><Button onClick={add}><Plus className="w-4 h-4 mr-1"/>Pin</Button></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{links.map(l=> (<a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="group border rounded-2xl p-3 hover:shadow-md transition flex items-center justify-between"><div className="truncate pr-3"><div className="text-sm font-medium truncate">{l.title}</div><div className="text-xs text-muted-foreground truncate">{l.url}</div></div><Button size="icon" variant="ghost" onClick={(e)=>{e.preventDefault(); del(l.id)}} title="Remove"><X className="w-4 h-4 opacity-60 group-hover:opacity-100"/></Button></a>))}</div></CardContent></Card>) }

// Root
export default function App(){
  const [dark,setDark]=useLocalState('dd_theme_dark',false);
  const [glass,setGlass]=useLocalState('dd_theme_glass',false);
  const [greetTitle,setGreetTitle]=useState('Here & Now');
  useEffect(()=>{ const root=document.documentElement; if(dark){ root.classList.add('dark'); } else { root.classList.remove('dark'); } },[dark]);
  return (
    <AmbientProvider>
      <GlobalAmbientBackdrop />
      <div className="min-h-[100dvh] bg-gradient-to-b from-background to-background/80">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <GreetingBar dark={dark} setDark={setDark} glass={glass} setGlass={setGlass} onGreetingChange={setGreetTitle} />
          <div className="mt-4"><HereAndNow glass={glass} title={greetTitle} /></div>
          <div className="mt-4"><MindfulMoment /></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2 space-y-4">
              <TaskBoard glass={glass} />
              <DayPlanner glass={glass} />
              <Watchlist glass={glass} />
            </div>
            <div className="space-y-4">
              <Pomodoro glass={glass} />
              <ReadingTracker glass={glass} />
              <Habits glass={glass} />
              <MusicPlayer glass={glass} />
              <LinksPinboard glass={glass} />
              <NotesWall glass={glass} />
            </div>
          </div>
          <footer className="mt-10 text-center text-xs text-muted-foreground">Built as a concept. All data is stored in localStorage. Glass & global ambient are optional.</footer>
        </div>
      </div>
    </AmbientProvider>
  );
}
