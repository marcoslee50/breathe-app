import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const QUIZ=[{q:"Do you often feel short of breath even at rest?",symptom:"Resting breathlessness"},{q:"Do you tend to breathe mainly through your mouth?",symptom:"Mouth breathing"},{q:"When you breathe in, do your shoulders or chest rise instead of your belly?",symptom:"Chest breathing"},{q:"Do you experience anxiety, panic attacks, or a racing heart?",symptom:"Anxiety / panic"},{q:"Do you feel exhausted even after a full night's sleep?",symptom:"Chronic fatigue"},{q:"Do you experience unexplained dizziness or lightheadedness?",symptom:"Dizziness"},{q:"Do you carry tension in your neck, shoulders, or upper chest?",symptom:"Muscle tension"},{q:"Do you feel an unsatisfying 'air hunger'?",symptom:"Air hunger"},{q:"Have you ever woken at night feeling breathless or with panic?",symptom:"Sleep disruption"},{q:"Do you sigh or yawn frequently?",symptom:"Over-breathing pattern"}];
const SYMPTOMS=[{icon:"🌙",title:"Sleep problems",desc:"Night-time breathlessness and disrupted patterns lead to exhaustion."},{icon:"🧠",title:"Anxiety & depression",desc:"The breathless-anxiety loop is self-reinforcing."},{icon:"🪨",title:"Neck & shoulder tension",desc:"Over-recruiting chest muscles strains the upper body chronically."},{icon:"💫",title:"Dizziness & air hunger",desc:"Altered CO₂/O₂ balance causes lightheadedness."},{icon:"🫁",title:"Worsened asthma / COPD",desc:"Up to 30% of asthma patients also have dysfunctional breathing."},{icon:"🌀",title:"IBS & gut issues",desc:"Poor breathing patterns can worsen irritable bowel symptoms."},{icon:"❤️",title:"Cardiovascular stress",desc:"Chronic over-breathing raises heart rate sustainedly."}];
const CYCLE=[{label:"You feel\nout of breath",icon:"😮‍💨",color:"#e07b6c",detail:"The sensation is real — even without a medical cause. Your body treats it as a threat."},{label:"You breathe\nharder & faster",icon:"💨",color:"#e8a456",detail:"The natural response is to breathe more — but this over-compensates. You may be breathing enough to sustain a brisk jog while sitting quietly."},{label:"CO₂ shifts,\nsensors reset",icon:"⚗️",color:"#c4a8f0",detail:"Hyperventilation lowers CO₂. Over time the brain's CO₂ sensors reset — normal CO₂ now triggers the urge to breathe faster."},{label:"Anxiety &\ndizziness increase",icon:"🌀",color:"#7ab8e8",detail:"Altered blood chemistry causes tingling, dizziness, palpitations — indistinguishable from the original breathlessness."}];
function getResult(s){if(s<=2)return{color:"#5ecfca",label:"Low likelihood",title:"Your breathing seems fairly balanced",desc:"You show few signs of dysfunctional breathing. Revisit if symptoms develop."};if(s<=5)return{color:"#f0bc4e",label:"Moderate signs",title:"Some patterns worth paying attention to",desc:"Try the guided breathing here and consider raising symptoms with your GP or a physiotherapist."};return{color:"#e07b6c",label:"Strong indicators",title:"Your breathing may be significantly disordered",desc:"This affects up to 12% of adults and is treatable. Speak with your GP and ask for referral to a respiratory physiotherapist."};}
const isIframe=()=>{try{return window.self!==window.top;}catch{return true;}};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{background:#07101f}button{cursor:pointer;border:none;background:none;font-family:inherit}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.65}50%{transform:scale(1.07);opacity:1}}
@keyframes orbIn{0%{transform:scale(.82);opacity:.4;box-shadow:0 0 30px rgba(94,207,202,.15)}100%{transform:scale(1.32);opacity:1;box-shadow:0 0 110px rgba(94,207,202,.55)}}
@keyframes orbHold{0%,100%{transform:scale(1.32)}50%{transform:scale(1.34)}}
@keyframes orbOut{0%{transform:scale(1.32);opacity:1}100%{transform:scale(.82);opacity:.4}}
@keyframes orbIn2{0%{transform:scale(.78);opacity:.35}100%{transform:scale(1.38);opacity:1}}
@keyframes orbOut2{0%{transform:scale(1.38);opacity:1}100%{transform:scale(.78);opacity:.35}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes lf{0%{opacity:0;transform:translateY(6px)}12%{opacity:1;transform:translateY(0)}88%{opacity:1}100%{opacity:0}}
@keyframes sp{0%,100%{opacity:.25}50%{opacity:.9}}
@keyframes bpm{0%{transform:scale(1)}10%{transform:scale(1.08)}20%{transform:scale(1)}to{transform:scale(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 30px rgba(94,207,202,.2)}50%{box-shadow:0 0 70px rgba(94,207,202,.5)}}
.te{animation:fadeUp .32s cubic-bezier(.22,1,.36,1) both}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(94,207,202,.1);border-radius:14px;padding:22px;transition:border-color .2s}
.card:hover{border-color:rgba(94,207,202,.2)}
.np{padding:7px 14px;border-radius:20px;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;letter-spacing:.015em;transition:all .18s;color:#567a90;white-space:nowrap;cursor:pointer}
.np:hover{color:#dde6f0;background:rgba(94,207,202,.07)}.np.a{color:#5ecfca;background:rgba(94,207,202,.13)}
.bp{padding:12px 32px;border-radius:50px;background:#5ecfca;color:#07101f;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;transition:all .2s;cursor:pointer;border:none}
.bp:hover{background:#7addd8;transform:translateY(-2px);box-shadow:0 10px 28px rgba(94,207,202,.3)}
.bg{padding:12px 32px;border-radius:50px;background:transparent;color:#5ecfca;border:1px solid rgba(94,207,202,.28);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;transition:all .2s;cursor:pointer}
.bg:hover{background:rgba(94,207,202,.08);border-color:rgba(94,207,202,.5)}
.qo{display:block;width:100%;padding:16px 20px;border-radius:12px;border:1px solid rgba(94,207,202,.14);background:rgba(255,255,255,.03);color:#c8dde8;font-family:'DM Sans',sans-serif;font-size:14px;text-align:center;transition:all .15s;cursor:pointer}
.qo:hover{background:rgba(94,207,202,.08);border-color:rgba(94,207,202,.35)}
.nd{transition:all .22s}.nd:hover{transform:translate(-50%,-50%) scale(1.1) !important}
.wb{border-radius:8px;overflow:hidden;background:rgba(94,207,202,.04);border:1px solid rgba(94,207,202,.1);padding:4px}
.sbb{height:6px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden}
.sbf{height:100%;border-radius:6px;transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.dur-btn{padding:10px 22px;border-radius:10px;border:1px solid rgba(94,207,202,.2);background:rgba(94,207,202,.04);color:#5a8a9a;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .15s}
.dur-btn:hover{border-color:rgba(94,207,202,.4);color:#dde6f0;background:rgba(94,207,202,.08)}
.dur-btn.sel{border-color:#5ecfca;background:rgba(94,207,202,.14);color:#5ecfca}
`;
const T={root:{minHeight:"100vh",background:"linear-gradient(155deg,#07101f 0%,#0b1828 55%,#07101a 100%)",fontFamily:"'DM Sans',sans-serif",color:"#dde6f0"},nav:{position:"sticky",top:0,zIndex:200,borderBottom:"1px solid rgba(94,207,202,.08)",background:"rgba(7,16,31,.92)",backdropFilter:"blur(18px)",padding:"9px 18px"},navIn:{maxWidth:1060,margin:"0 auto",display:"flex",alignItems:"center",gap:4,overflowX:"auto",scrollbarWidth:"none"},logo:{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"#5ecfca",marginRight:14,whiteSpace:"nowrap",flexShrink:0},main:{maxWidth:920,margin:"0 auto",padding:"40px 18px 90px",position:"relative",zIndex:1},h2:{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,color:"#c8dde8"},h3:{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:"#c8dde8"},mu:{color:"#5a7a8e",lineHeight:1.85,fontSize:15},tc:{color:"#5ecfca"}};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Waveform({samples,height=70,color="#5ecfca"}){
  if(!samples||samples.length<2)return(<div style={{height,borderRadius:8,background:"rgba(94,207,202,.04)",border:"1px solid rgba(94,207,202,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,color:"rgba(94,207,202,.25)"}}>Waiting for signal…</span></div>);
  const W=400,pad=4,vals=samples.map(s=>typeof s==="number"?s:s.z),mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||0.01;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1))*W},${pad+(height-pad*2)-((v-mn)/rng)*(height-pad*2)}`).join(" ");
  return(<div className="wb"><svg viewBox={`0 0 ${W} ${height}`} style={{width:"100%",height,display:"block"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg></div>);
}
function ScoreRing({value,color,size=114}){
  const r=44,cx=size/2,cy=size/2,circ=2*Math.PI*r,dash=(value/100)*circ;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7"/><circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)"}}/><text x={cx} y={cy-4} textAnchor="middle" fill={color} fontSize="24" fontFamily="'Cormorant Garamond',serif" fontWeight="300">{value}</text><text x={cx} y={cy+14} textAnchor="middle" fill={color} fontSize="9" fontFamily="'DM Sans',sans-serif" opacity=".55" letterSpacing="0.1em">SCORE</text></svg>);
}
function Countdown({t,total,size=80}){
  const r=32,cx=size/2,cy=size/2,circ=2*Math.PI*r,dash=(t/total)*circ,col=t>10?"#5ecfca":"#f0bc4e";
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5"/><circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="5" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray .95s linear,stroke .3s"}}/><text x={cx} y={cy+7} textAnchor="middle" fill={col} fontSize="22" fontFamily="'Cormorant Garamond',serif" fontWeight="300">{t}</text></svg>);
}

// ─── MOTION ENGINE (shared hook) ─────────────────────────────────────────────
function useMotion(){
  const buf=useRef([]);const hRef=useRef(null);const active=useRef(false);
  const start=useCallback((onSample)=>{
    buf.current=[];active.current=true;
    const t0=Date.now();
    const h=e=>{
      if(!active.current)return;
      const a=e.accelerationIncludingGravity||e.acceleration;
      if(!a)return;
      const s={t:Date.now()-t0,z:a.z??0,x:a.x??0,y:a.y??0};
      buf.current.push(s);
      onSample&&onSample(s,buf.current);
    };
    hRef.current=h;
    window.addEventListener("devicemotion",h);
  },[]);
  const stop=useCallback(()=>{active.current=false;if(hRef.current)window.removeEventListener("devicemotion",hRef.current);},[]);
  const requestPermission=useCallback(async()=>{
    if(typeof DeviceMotionEvent==="undefined")return"unsupported";
    if(isIframe())return"iframe";
    if(typeof DeviceMotionEvent.requestPermission==="function"){
      try{const p=await DeviceMotionEvent.requestPermission();return p==="granted"?"granted":"denied";}
      catch{return"denied";}
    }
    return"granted";
  },[]);
  return{start,stop,requestPermission,buf};
}

// ─── MOTION GATE (handles all permission states) ──────────────────────────────
function MotionGate({children,onGranted}){
  const[status,setStatus]=useState("idle");
  const{requestPermission}=useMotion();
  const request=async()=>{
    setStatus("requesting");
    const r=await requestPermission();
    if(r==="granted"){setStatus("granted");onGranted&&onGranted();}
    else setStatus(r);
  };
  if(status==="granted")return children;
  return(
    <div className="card" style={{textAlign:"center",padding:"40px 28px",animation:"fadeIn .3s ease"}}>
      {status==="idle"&&<><div style={{fontSize:44,marginBottom:18}}>📱</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#5ecfca",marginBottom:12}}>Motion access needed</h3><p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:14,marginBottom:24}}>This feature reads your phone's accelerometer to detect chest movement while you breathe. No data leaves your device.</p><button className="bp" onClick={request}>Grant access & begin</button></>}
      {status==="requesting"&&<><div style={{fontSize:44,marginBottom:18}}>📲</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#5ecfca",marginBottom:12}}>Tap Allow when prompted</h3><p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:14}}>iOS will show a permission dialog. Tap <strong style={{color:"#dde6f0"}}>Allow</strong> to continue.</p></>}
      {status==="denied"&&<><div style={{fontSize:44,marginBottom:18}}>🔒</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#f0bc4e",marginBottom:12}}>Motion access denied</h3><p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:14,marginBottom:16}}>To fix this on iPhone: go to <strong style={{color:"#dde6f0"}}>Settings → Safari → Motion & Orientation Access</strong> and toggle it on, then return here and try again.</p><button className="bp" onClick={()=>setStatus("idle")}>Try again</button></>}
      {status==="iframe"&&<><div style={{fontSize:44,marginBottom:18}}>🖥️</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#f0bc4e",marginBottom:12}}>Open in your browser</h3><p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:14,marginBottom:16}}>iOS blocks sensor access inside previews and embedded viewers. To use motion features, open this app directly in <strong style={{color:"#dde6f0"}}>Safari</strong> on your iPhone after deploying to Vercel — the chest scan, meditation, and sleep tools will all work there.</p><div style={{padding:"12px 16px",border:"1px solid rgba(94,207,202,.15)",borderRadius:10,background:"rgba(94,207,202,.04)",marginTop:8}}><p style={{fontSize:12,color:"#3a6a7a",lineHeight:1.7}}>All other tabs (Self-assess, Breathing check, Guided exercise, The cycle, Get help) work fully here in the preview.</p></div></>}
      {status==="unsupported"&&<><div style={{fontSize:44,marginBottom:18}}>🖥️</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#e07b6c",marginBottom:12}}>Accelerometer not found</h3><p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:14}}>This feature requires a smartphone with a built-in accelerometer. Open this app on your iPhone or Android device.</p></>}
    </div>
  );
}

// Shared motion analysis
function analyzeBreathing(data){
  if(data.length<15)return null;
  const raw=data.map(d=>d.z),mean=raw.reduce((a,b)=>a+b,0)/raw.length,cen=raw.map(v=>v-mean);
  const sm=cen.map((_,i)=>{const w=cen.slice(Math.max(0,i-6),i+1);return w.reduce((a,b)=>a+b,0)/w.length;});
  const std=Math.sqrt(sm.reduce((a,b)=>a+b*b,0)/sm.length);
  const thr=std*0.38,ms=data[data.length-1].t-data[0].t,hz=data.length/(ms/1000),mg=Math.max(4,Math.floor(hz*1.5));
  const peaks=[];
  for(let i=1;i<sm.length-1;i++){if(sm[i]>sm[i-1]&&sm[i]>sm[i+1]&&sm[i]>thr&&(!peaks.length||i-peaks[peaks.length-1]>mg))peaks.push(i);}
  const bpm=peaks.length?Math.round((peaks.length/(ms/60000))*10)/10:0;
  let rhythm=50;
  if(peaks.length>2){const iv=peaks.slice(1).map((p,i)=>p-peaks[i]),ai=iv.reduce((a,b)=>a+b,0)/iv.length,cv=Math.sqrt(iv.reduce((a,b)=>a+(b-ai)**2,0)/iv.length)/ai;rhythm=Math.round(Math.max(0,Math.min(100,(1-cv*1.4)*100)));}
  const depth=Math.min(100,Math.round((std/0.25)*85));
  const bpmS=bpm===0?30:bpm>=12&&bpm<=20?100:bpm<12?Math.max(20,(bpm/12)*100):Math.max(20,100-((bpm-20)/22)*100);
  const overall=std<0.04?0:Math.min(100,Math.max(0,Math.round(rhythm*.35+depth*.30+bpmS*.35)));
  return{bpm,rhythm,depth,bpmScore:Math.round(bpmS),overall,peaks:peaks.length,noMovement:std<0.04,smooth:sm};
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("home");
  const TABS=[{id:"home",l:"Overview"},{id:"scan",l:"📱 Chest scan"},{id:"meditate",l:"🧘 Meditate"},{id:"anxiety",l:"😰 Anxiety"},{id:"sleep",l:"🌙 Sleep"},{id:"assess",l:"Self-assess"},{id:"check",l:"Breathing check"},{id:"breathe",l:"Guided exercise"},{id:"cycle",l:"The cycle"},{id:"help",l:"Get help"}];
  return(
    <div style={T.root}>
      <style>{css}</style>
      <div aria-hidden style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-15%",right:"-8%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(94,207,202,.04) 0%,transparent 65%)",animation:"pulse 9s ease-in-out infinite"}}/>
        <div style={{position:"absolute",bottom:"-10%",left:"-8%",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(156,143,232,.025) 0%,transparent 65%)"}}/>
      </div>
      <nav style={T.nav}><div style={T.navIn}><span style={T.logo}>breathe well</span>{TABS.map(t=><button key={t.id} className={`np${tab===t.id?" a":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>)}</div></nav>
      <main style={T.main}>
        {tab==="home"&&<HomeTab setTab={setTab}/>}
        {tab==="scan"&&<ChestScanTab/>}
        {tab==="meditate"&&<MeditateTab/>}
        {tab==="anxiety"&&<AnxietyTab/>}
        {tab==="sleep"&&<SleepTab/>}
        {tab==="assess"&&<AssessTab/>}
        {tab==="check"&&<CheckTab/>}
        {tab==="breathe"&&<BreatheTab/>}
        {tab==="cycle"&&<CycleTab/>}
        {tab==="help"&&<HelpTab/>}
      </main>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeTab({setTab}){
  const features=[{id:"scan",icon:"📱",title:"Chest scan",desc:"30-second accelerometer measurement of breathing rate, rhythm, and depth",color:"#5ecfca"},{id:"meditate",icon:"🧘",title:"Guided meditation",desc:"Motion-tracked stillness & breathing quality during timed sessions",color:"#c4a8f0"},{id:"anxiety",icon:"😰",title:"Anxiety intervention",desc:"Real-time BPM coaching and rescue breathing when panic strikes",color:"#e07b6c"},{id:"sleep",icon:"🌙",title:"Sleep preparation",desc:"4-7-8 breathing protocol and pre-sleep readiness scoring",color:"#7ab8e8"}];
  return(<div className="te">
    <div style={{textAlign:"center",paddingBottom:56}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:44}}>
        <div style={{width:148,height:148,borderRadius:"50%",background:"radial-gradient(circle at 38% 34%,rgba(94,207,202,.88) 0%,rgba(65,170,166,.42) 48%,transparent 100%)",boxShadow:"0 0 75px rgba(94,207,202,.28)",animation:"pulse 4.5s ease-in-out infinite"}}/>
      </div>
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,52px)",fontWeight:300,lineHeight:1.1,color:"#dde6f0",marginBottom:18}}>Your phone is a<br/><em style={T.tc}>breathing clinic</em></h1>
      <p style={{fontSize:15,color:"#6a8ea8",maxWidth:500,margin:"0 auto 36px",lineHeight:1.85,fontWeight:300}}>Up to 12% of adults have dysfunctional breathing and don't know it. This app uses your phone's accelerometer to measure, coach, and retrain your breath — no wearable required.</p>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button className="bp" onClick={()=>setTab("scan")}>📱 Start scan</button>
        <button className="bg" onClick={()=>setTab("assess")}>Self-assess →</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:13,marginBottom:40}}>
      {features.map(f=>(
        <button key={f.id} onClick={()=>setTab(f.id)} className="card" style={{textAlign:"left",cursor:"pointer",width:"100%",display:"block",borderColor:`${f.color}22`}}>
          <div style={{fontSize:28,marginBottom:10}}>{f.icon}</div>
          <div style={{fontWeight:500,color:f.color,fontSize:14,marginBottom:6}}>{f.title}</div>
          <p style={{fontSize:12,color:"#4a6a7e",lineHeight:1.65}}>{f.desc}</p>
        </button>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12,marginBottom:40}}>
      {[{s:"12%",l:"of adults affected"},{s:"30%",l:"of asthma patients"},{s:"Often",l:"underdiagnosed"},{s:"7+",l:"symptom types"}].map(x=>(<div key={x.s} className="card" style={{textAlign:"center",padding:"18px 12px"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:"#5ecfca",lineHeight:1}}>{x.s}</div><div style={{fontSize:10,color:"#4a6a7e",marginTop:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{x.l}</div></div>))}
    </div>
    <div className="card" style={{borderColor:"rgba(196,168,240,.22)",background:"rgba(196,168,240,.04)"}}>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#c4a8f0",marginBottom:9}}>How the phone sensor works</h3>
      <p style={{...T.mu,fontSize:14}}>When you lie flat with the phone resting on your chest, the accelerometer detects the micro-movements of your ribcage with each breath. This is the same sensor used in fitness trackers — but no app install is required. Works in Safari (iOS) and Chrome (Android) using the Web DeviceMotion API.</p>
    </div>
  </div>);
}

// ─── CHEST SCAN ───────────────────────────────────────────────────────────────
const SCAN_S=30;
function ChestScanTab(){
  const[phase,setPhase]=useState("idle");
  const[live,setLive]=useState([]);const[tLeft,setTLeft]=useState(SCAN_S);const[res,setRes]=useState(null);
  const{start,stop,requestPermission}=useMotion();const tRef=useRef(null);
  const cleanup=useCallback(()=>{stop();if(tRef.current)clearInterval(tRef.current);},[stop]);
  useEffect(()=>()=>cleanup(),[cleanup]);
  const doStart=useCallback(()=>{
    setPhase("measuring");setTLeft(SCAN_S);setLive([]);
    start((s,buf)=>setLive(d=>[...d.slice(-190),s]));
    tRef.current=setInterval(()=>setTLeft(t=>{if(t<=1){clearInterval(tRef.current);stop();const r=analyzeBreathing(start.buf?.current||[]);if(r)setRes(r);setPhase("done");return 0;}return t-1;}),1000);
  },[start,stop]);
  const retry=()=>{cleanup();setRes(null);setPhase("idle");setLive([]);};
  const sc=res?res.overall>=76?"#5ecfca":res.overall>=50?"#f0bc4e":"#e07b6c":"#5ecfca";

  // Need to capture buf separately
  const bufRef=useRef([]);
  const realStart=useCallback(async()=>{
    const perm=await requestPermission();
    if(perm!=="granted"){setPhase(perm);return;}
    setPhase("measuring");setTLeft(SCAN_S);setLive([]);bufRef.current=[];
    const t0=Date.now();
    const h=e=>{const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const s={t:Date.now()-t0,z:a.z??0};bufRef.current.push(s);setLive(d=>[...d.slice(-190),s]);};
    window._bwH=h;window.addEventListener("devicemotion",h);
    tRef.current=setInterval(()=>setTLeft(t=>{
      if(t<=1){clearInterval(tRef.current);window.removeEventListener("devicemotion",window._bwH);const r=analyzeBreathing(bufRef.current);setRes(r||{bpm:0,rhythm:50,depth:30,bpmScore:30,overall:0,peaks:0,noMovement:true,smooth:[]});setPhase("done");return 0;}
      return t-1;
    }),1000);
  },[requestPermission]);
  const cancel=()=>{clearInterval(tRef.current);if(window._bwH)window.removeEventListener("devicemotion",window._bwH);setPhase("idle");setLive([]);};

  return(<div className="te"><div style={{maxWidth:600,margin:"0 auto"}}>
    <h2 style={{...T.h2,textAlign:"center",marginBottom:8}}>Chest Breathing Scan</h2>
    <p style={{textAlign:"center",color:"#4a6a7e",marginBottom:36,fontSize:14,lineHeight:1.85}}>Lie down. Phone face-up on your chest. 30 seconds of natural breathing.</p>

    {phase==="idle"&&(<div style={{animation:"fadeIn .3s ease"}}>
      <div className="card" style={{textAlign:"center",marginBottom:16,padding:"32px 24px"}}>
        <svg width="160" height="136" viewBox="0 0 160 136" style={{display:"block",margin:"0 auto 22px"}}>
          <ellipse cx="80" cy="94" rx="38" ry="46" fill="rgba(94,207,202,.07)" stroke="rgba(94,207,202,.18)" strokeWidth="1.5"/>
          <circle cx="80" cy="30" r="20" fill="rgba(94,207,202,.07)" stroke="rgba(94,207,202,.18)" strokeWidth="1.5"/>
          <rect x="62" y="72" width="36" height="22" rx="4" fill="rgba(94,207,202,.25)" stroke="#5ecfca" strokeWidth="1.5"/>
          <rect x="66" y="76" width="28" height="14" rx="2" fill="rgba(94,207,202,.1)"/>
          <circle cx="80" cy="83" r="2" fill="rgba(94,207,202,.5)"/>
          <path d="M50 94 Q44 87 44 82 Q44 77 50 70" fill="none" stroke="rgba(94,207,202,.4)" strokeWidth="1.3" strokeLinecap="round" style={{animation:"sp 2s ease-in-out infinite"}}/>
          <path d="M110 94 Q116 87 116 82 Q116 77 110 70" fill="none" stroke="rgba(94,207,202,.4)" strokeWidth="1.3" strokeLinecap="round" style={{animation:"sp 2s ease-in-out infinite",animationDelay:".2s"}}/>
          <path d="M40 100 Q32 90 32 80 Q32 70 40 62" fill="none" stroke="rgba(94,207,202,.18)" strokeWidth="1.3" strokeLinecap="round" style={{animation:"sp 2s ease-in-out infinite",animationDelay:".4s"}}/>
          <path d="M120 100 Q128 90 128 80 Q128 70 120 62" fill="none" stroke="rgba(94,207,202,.18)" strokeWidth="1.3" strokeLinecap="round" style={{animation:"sp 2s ease-in-out infinite",animationDelay:".6s"}}/>
        </svg>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"left",marginBottom:24}}>
          {[{n:"1",t:"Lie down flat"},{n:"2",t:"Phone face-up on chest"},{n:"3",t:"Breathe normally"},{n:"4",t:"Stay still for 30 s"}].map(s=>(
            <div key={s.n} style={{padding:"10px 12px",background:"rgba(94,207,202,.04)",borderRadius:9,borderLeft:"2px solid rgba(94,207,202,.2)"}}>
              <div style={{fontSize:9,color:"#5ecfca",letterSpacing:"0.1em",marginBottom:3}}>STEP {s.n}</div>
              <div style={{fontWeight:500,color:"#c8dde8",fontSize:13}}>{s.t}</div>
            </div>
          ))}
        </div>
        <button className="bp" onClick={realStart}>Begin 30-second scan</button>
      </div>
      {isIframe()&&<div style={{padding:"12px 16px",border:"1px solid rgba(240,188,78,.15)",borderRadius:10,background:"rgba(240,188,78,.04)"}}><p style={{fontSize:12,color:"#7a6030",lineHeight:1.7}}>⚠️ <strong style={{color:"#b09040"}}>Preview note:</strong> Motion sensors are blocked inside this viewer. Deploy the app to Vercel and open it in Safari on your iPhone for the scan to work.</p></div>}
    </div>)}

    {["denied","iframe","unsupported"].includes(phase)&&(
      <div className="card" style={{textAlign:"center",padding:"40px 28px",animation:"fadeIn .3s ease"}}>
        <div style={{fontSize:44,marginBottom:18}}>{phase==="denied"?"🔒":"🖥️"}</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#f0bc4e",marginBottom:12}}>
          {phase==="denied"?"Motion access denied":phase==="iframe"?"Open in your browser":"Accelerometer not found"}
        </h3>
        <p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:14,marginBottom:20}}>
          {phase==="denied"&&"On iPhone: Settings → Safari → Motion & Orientation Access (toggle on), then return here."}
          {phase==="iframe"&&"iOS blocks sensor access inside previews and embedded viewers. Deploy this app to Vercel and open it directly in Safari — all motion features will work there."}
          {phase==="unsupported"&&"This feature requires a smartphone accelerometer. Open this page on your iPhone or Android."}
        </p>
        <button className="bg" onClick={()=>setPhase("idle")}>Try again</button>
      </div>
    )}

    {phase==="measuring"&&(<div style={{animation:"fadeIn .3s ease"}}>
      <div className="card" style={{marginBottom:14,padding:"22px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div><div style={{fontSize:10,color:"#5ecfca",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>● Recording</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#dde6f0",fontWeight:300}}>Keep still. Breathe naturally.</div></div>
          <Countdown t={tLeft} total={SCAN_S}/>
        </div>
        <Waveform samples={live} height={74}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"#3a5a6e"}}><span>Samples: {live.length}</span><span style={{color:live.length>8?"#5ecfca":"#4a6a7e"}}>{live.length>8?"Signal active":"Waiting…"}</span></div>
      </div>
      <div style={{textAlign:"center"}}><button className="bg" onClick={cancel}>Cancel</button></div>
    </div>)}

    {phase==="done"&&res&&(()=>{
      const metrics=[{label:"Breaths / min",val:res.bpm===0?"N/A":`${res.bpm}`,score:res.bpmScore,note:"Normal: 12–20",col:res.bpmScore>=75?"#5ecfca":res.bpmScore>=50?"#f0bc4e":"#e07b6c"},{label:"Rhythm",val:`${res.rhythm}%`,score:res.rhythm,note:"Interval consistency",col:res.rhythm>=70?"#5ecfca":res.rhythm>=45?"#f0bc4e":"#e07b6c"},{label:"Depth",val:`${res.depth}%`,score:res.depth,note:"Chest movement amplitude",col:res.depth>=60?"#5ecfca":res.depth>=35?"#f0bc4e":"#e07b6c"}];
      const hl=res.overall>=76?"Breathing pattern looks healthy":res.overall>=50?"Some patterns worth monitoring":"Signs of dysfunctional breathing detected";
      return(<div style={{animation:"fadeIn .4s ease"}}>
        <div className="card" style={{textAlign:"center",borderColor:sc+"33",marginBottom:14,padding:"28px 22px"}}><ScoreRing value={res.overall} color={sc}/><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:sc,margin:"14px 0 8px"}}>{hl}</h3><p style={{color:"#5a7a8e",fontSize:13,lineHeight:1.8}}>{res.noMovement?"Very little chest movement was detected — try repositioning the phone directly on your sternum.":res.bpm>20?`At ${res.bpm} BPM you are over-breathing. Normal resting rate is 12–20.`:res.bpm>0&&res.bpm<12?`At ${res.bpm} BPM your rate is low — this may indicate under-breathing or breath-holding.`:`Your rate of ${res.bpm} BPM is within the healthy range.`}</p></div>
        <div className="card" style={{marginBottom:14}}><p style={{fontSize:10,color:"#3a5a6e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>Detailed metrics</p><div style={{display:"grid",gap:18}}>{metrics.map(m=>(<div key={m.label}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:7}}><div><span style={{fontWeight:500,color:"#c8dde8",fontSize:13}}>{m.label}</span><span style={{color:"#3a5a6e",fontSize:11,marginLeft:7}}>{m.note}</span></div><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:m.col,fontWeight:300}}>{m.val}</span></div><div className="sbb"><div className="sbf" style={{width:`${m.score}%`,background:`linear-gradient(90deg,${m.col}77,${m.col})`}}/></div></div>))}</div></div>
        {res.smooth&&res.smooth.length>2&&<div className="card" style={{marginBottom:14}}><p style={{fontSize:10,color:"#3a5a6e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Recorded signal · {res.peaks} breath{res.peaks!==1?"s":""} detected</p><Waveform samples={res.smooth} height={70} color={sc}/></div>}
        <div style={{textAlign:"center"}}><button className="bp" onClick={retry}>Scan again</button></div>
      </div>);
    })()}
  </div></div>);
}

// ─── MEDITATE ─────────────────────────────────────────────────────────────────
const MED_PROMPTS=["Find a comfortable position. Let your body settle into stillness.","Notice the natural rhythm of your breath. Don't try to change it yet.","With each exhale, let your muscles soften a little more.","Your only task is to stay with the breath. Nothing else matters right now.","If your mind wanders, that's normal. Gently return to the sensation of breathing.","Notice the space between breaths — that moment of stillness.","You are doing exactly the right thing simply by being here and breathing.","Let each exhale carry away any tension you don't need."];

function MeditateTab(){
  const[phase,setPhase]=useState("idle");
  const[dur,setDur]=useState(10);
  const[tLeft,setTLeft]=useState(0);
  const[live,setLive]=useState([]);
  const[promptIdx,setPromptIdx]=useState(0);
  const[stats,setStats]=useState({avgBpm:0,stillness:0,calmTime:0});
  const[summary,setSummary]=useState(null);
  const bufRef=useRef([]);const tRef=useRef(null);const promptRef=useRef(null);const calmRef=useRef(0);const{requestPermission}=useMotion();

  const startSession=async()=>{
    const perm=await requestPermission();
    if(perm!=="granted"){setPhase(perm==="iframe"?"iframe_msg":perm==="denied"?"denied_msg":"unsupported_msg");return;}
    const secs=dur*60;
    setTLeft(secs);setLive([]);bufRef.current=[];calmRef.current=0;setPromptIdx(0);setPhase("active");
    const t0=Date.now();
    const h=e=>{const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const s={t:Date.now()-t0,z:a.z??0,x:a.x??0,y:a.y??0};bufRef.current.push(s);setLive(d=>[...d.slice(-150),s]);};
    window._mH=h;window.addEventListener("devicemotion",h);
    promptRef.current=setInterval(()=>setPromptIdx(i=>(i+1)%MED_PROMPTS.length),22000);
    tRef.current=setInterval(()=>setTLeft(t=>{
      if(t<=1){
        clearInterval(tRef.current);clearInterval(promptRef.current);
        window.removeEventListener("devicemotion",window._mH);
        finishSession(bufRef.current,secs);return 0;
      }
      return t-1;
    }),1000);
  };

  const finishSession=(data,total)=>{
    const r=analyzeBreathing(data);
    // Stillness: measure total acceleration variance
    const totalVar=data.length>0?data.reduce((a,s)=>a+Math.abs(s.x||0)+Math.abs(s.y||0),0)/data.length:0;
    const stillness=Math.min(100,Math.max(0,Math.round((1-totalVar/0.5)*100)));
    setSummary({bpm:r?.bpm||0,rhythm:r?.rhythm||0,depth:r?.depth||0,overall:r?.overall||0,stillness,duration:total/60,smooth:r?.smooth||[]});
    setPhase("done");
  };

  const cancel=()=>{clearInterval(tRef.current);clearInterval(promptRef.current);if(window._mH)window.removeEventListener("devicemotion",window._mH);setPhase("idle");};
  const restart=()=>{setSummary(null);setPhase("idle");};
  const mins=Math.floor(tLeft/60),secs_r=tLeft%60;
  const bpmLive=live.length>30?analyzeBreathing(live.slice(-60))?.bpm||0:0;
  const bpmColor=bpmLive===0?"#4a6a7e":bpmLive<=15?"#5ecfca":bpmLive<=20?"#f0bc4e":"#e07b6c";

  return(<div className="te"><div style={{maxWidth:580,margin:"0 auto"}}>
    <h2 style={{...T.h2,textAlign:"center",marginBottom:8}}>Guided Meditation</h2>
    <p style={{textAlign:"center",color:"#4a6a7e",marginBottom:36,fontSize:14,lineHeight:1.85}}>Phone on chest. Breathe naturally. The accelerometer tracks your stillness and breathing quality throughout your session.</p>

    {phase==="idle"&&(<div style={{animation:"fadeIn .3s ease"}}>
      <div className="card" style={{marginBottom:14,padding:"28px 24px"}}>
        <p style={{fontSize:11,color:"#3a5a6e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>Session length</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:28}}>
          {[5,10,15,20].map(m=><button key={m} className={`dur-btn${dur===m?" sel":""}`} onClick={()=>setDur(m)}>{m} min</button>)}
        </div>
        <div style={{display:"grid",gap:10,marginBottom:24}}>
          {[{i:"🧠",t:"Breathing quality tracking",d:"Live measurement of your rate, rhythm, and depth throughout."},{i:"🪨",t:"Stillness monitoring",d:"Motion sensor detects fidgeting and restlessness vs deep calm."},{i:"💬",t:"Gentle prompts",d:"Rotating mindfulness cues keep you grounded without intrusion."}].map((f,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"rgba(196,168,240,.04)",borderRadius:10,borderLeft:"2px solid rgba(196,168,240,.18)"}}>
              <span style={{fontSize:18,flexShrink:0}}>{f.i}</span>
              <div><div style={{fontWeight:500,color:"#c4a8f0",fontSize:13,marginBottom:3}}>{f.t}</div><div style={{fontSize:12,color:"#4a6a7e",lineHeight:1.6}}>{f.d}</div></div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}><button className="bp" style={{background:"#c4a8f0"}} onClick={startSession}>Begin {dur}-minute session</button></div>
      </div>
      {isIframe()&&<div style={{padding:"12px 16px",border:"1px solid rgba(240,188,78,.15)",borderRadius:10,background:"rgba(240,188,78,.04)"}}><p style={{fontSize:12,color:"#7a6030",lineHeight:1.7}}>⚠️ Motion tracking requires a real browser tab. Deploy to Vercel and open in Safari on your iPhone.</p></div>}
    </div>)}

    {["iframe_msg","denied_msg","unsupported_msg"].includes(phase)&&(
      <div className="card" style={{textAlign:"center",padding:"40px 28px"}}>
        <div style={{fontSize:44,marginBottom:16}}>{phase==="denied_msg"?"🔒":"🖥️"}</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#c4a8f0",marginBottom:12}}>{phase==="iframe_msg"?"Open in Safari to track motion":"Motion access needed"}</h3>
        <p style={{color:"#5a7a8e",fontSize:14,lineHeight:1.85,marginBottom:20}}>{phase==="denied_msg"?"Go to Settings → Safari → Motion & Orientation Access, then return here.":"Deploy this app to Vercel and open it in Safari on your iPhone for full motion tracking."}</p>
        <button className="bg" onClick={()=>setPhase("idle")}>Back</button>
      </div>
    )}

    {phase==="active"&&(<div style={{animation:"fadeIn .3s ease"}}>
      {/* Timer */}
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:56,fontWeight:300,color:"#c4a8f0",lineHeight:1}}>{String(mins).padStart(2,"0")}:{String(secs_r).padStart(2,"0")}</div>
        <div style={{fontSize:11,color:"#4a6a7e",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>remaining</div>
      </div>
      {/* Prompt */}
      <div className="card" style={{textAlign:"center",borderColor:"rgba(196,168,240,.2)",background:"rgba(196,168,240,.04)",padding:"24px 28px",marginBottom:14,minHeight:90,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p key={promptIdx} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontStyle:"italic",color:"#c4a8f0",lineHeight:1.65,animation:"fadeIn .8s ease"}}>{MED_PROMPTS[promptIdx]}</p>
      </div>
      {/* Live metrics */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div className="card" style={{textAlign:"center",padding:"16px 12px",borderColor:"rgba(94,207,202,.15)"}}>
          <div style={{fontSize:9,color:"#3a5a6e",letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>Breath rate</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:bpmColor,fontWeight:300,lineHeight:1}}>{bpmLive||"–"}</div>
          <div style={{fontSize:10,color:"#3a5a6e",marginTop:3}}>BPM</div>
        </div>
        <div className="card" style={{textAlign:"center",padding:"16px 12px",borderColor:"rgba(196,168,240,.15)"}}>
          <div style={{fontSize:9,color:"#3a5a6e",letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>Signal</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:live.length>10?"#5ecfca":"#3a5a6e",fontWeight:300,lineHeight:1}}>{live.length>10?"Active":"–"}</div>
          <div style={{fontSize:10,color:"#3a5a6e",marginTop:3}}>samples: {live.length}</div>
        </div>
      </div>
      <Waveform samples={live} height={58} color="#c4a8f0"/>
      <div style={{textAlign:"center",marginTop:20}}><button className="bg" style={{color:"#c4a8f0",borderColor:"rgba(196,168,240,.3)"}} onClick={cancel}>End session</button></div>
    </div>)}

    {phase==="done"&&summary&&(<div style={{animation:"fadeIn .4s ease"}}>
      <div className="card" style={{textAlign:"center",borderColor:"rgba(196,168,240,.3)",background:"rgba(196,168,240,.05)",marginBottom:14,padding:"28px 22px"}}>
        <div style={{fontSize:10,color:"#c4a8f0",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Session complete · {summary.duration} min</div>
        <ScoreRing value={summary.overall} color="#c4a8f0" size={110}/>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:"#c4a8f0",margin:"14px 0 8px"}}>{summary.overall>=70?"Deep, calm session":"You showed up — that's what matters"}</h3>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Breath rate",v:`${summary.bpm}`,u:"BPM"},{l:"Stillness",v:`${summary.stillness}`,u:"%"},{l:"Rhythm",v:`${summary.rhythm}`,u:"%"}].map(m=>(
          <div key={m.l} className="card" style={{textAlign:"center",padding:"14px 10px"}}>
            <div style={{fontSize:9,color:"#3a5a6e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{m.l}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#c4a8f0",fontWeight:300,lineHeight:1}}>{m.v}</div>
            <div style={{fontSize:10,color:"#3a5a6e",marginTop:3}}>{m.u}</div>
          </div>
        ))}
      </div>
      {summary.smooth.length>2&&<div className="card" style={{marginBottom:14}}><p style={{fontSize:10,color:"#3a5a6e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Breathing signal throughout session</p><Waveform samples={summary.smooth} height={65} color="#c4a8f0"/></div>}
      <div style={{textAlign:"center"}}><button className="bp" style={{background:"#c4a8f0"}} onClick={restart}>New session</button></div>
    </div>)}
  </div></div>);
}

// ─── ANXIETY ──────────────────────────────────────────────────────────────────
const CALM_TARGET=90;// seconds in healthy zone to declare calm

function AnxietyTab(){
  const[phase,setPhase]=useState("idle");
  const[live,setLive]=useState([]);
  const[liveBpm,setLiveBpm]=useState(0);
  const[calmSecs,setCalmSecs]=useState(0);
  const[breathPhase,setBreathPhase]=useState("in");
  const[breathLabel,setBreathLabel]=useState("Breathe in…");
  const bufRef=useRef([]);const tRef=useRef(null);const bRef=useRef(null);const cRef=useRef(0);
  const{requestPermission}=useMotion();

  // Slow 4-6 breathing for anxiety (no hold — simpler)
  const APHASES=[{name:"in",label:"Breathe in slowly…",ms:4500,next:"out"},{name:"out",label:"Let it all go…",ms:6500,next:"in"}];
  const runBreath=useCallback(n=>{const p=APHASES.find(x=>x.name===n);setBreathPhase(p.name);setBreathLabel(p.label);bRef.current=setTimeout(()=>runBreath(p.next),p.ms);},[]);

  const begin=async()=>{
    const perm=await requestPermission();
    if(perm!=="granted"){setPhase(perm==="iframe"?"iframe_msg":"denied_msg");return;}
    setPhase("active");setLive([]);cRef.current=0;setCalmSecs(0);bufRef.current=[];
    const t0=Date.now();
    const h=e=>{const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const s={t:Date.now()-t0,z:a.z??0};bufRef.current.push(s);setLive(d=>[...d.slice(-120),s]);};
    window._aH=h;window.addEventListener("devicemotion",h);
    runBreath("in");
    tRef.current=setInterval(()=>{
      const recent=bufRef.current.slice(-40);
      if(recent.length>10){const r=analyzeBreathing(recent);if(r&&r.bpm>0){setLiveBpm(r.bpm);if(r.bpm<=18){cRef.current++;setCalmSecs(cRef.current);}else{cRef.current=Math.max(0,cRef.current-2);}}}
      if(cRef.current>=CALM_TARGET){clearInterval(tRef.current);clearTimeout(bRef.current);window.removeEventListener("devicemotion",window._aH);setPhase("calm");}
    },1000);
  };

  const stop=()=>{clearInterval(tRef.current);clearTimeout(bRef.current);if(window._aH)window.removeEventListener("devicemotion",window._aH);setPhase("idle");setLive([]);setLiveBpm(0);setCalmSecs(0);};
  const bpmColor=liveBpm===0?"#4a6a7e":liveBpm<=15?"#5ecfca":liveBpm<=20?"#f0bc4e":"#e07b6c";
  const bpmMsg=liveBpm===0?"Place phone on chest":liveBpm<=15?"Breathing is calm ✓":liveBpm<=20?"Getting there — keep slowing down":"Over-breathing detected — breathe slower";
  const orbAnim=breathPhase==="in"?"orbIn2 4.5s ease-in-out forwards":"orbOut2 6.5s ease-in-out forwards";
  const calmPct=Math.min(100,Math.round((calmSecs/CALM_TARGET)*100));

  return(<div className="te"><div style={{maxWidth:560,margin:"0 auto"}}>
    <h2 style={{...T.h2,textAlign:"center",marginBottom:8}}>Anxiety Intervention</h2>
    <p style={{textAlign:"center",color:"#4a6a7e",marginBottom:36,fontSize:14,lineHeight:1.85}}>Lie down. Phone on chest. Follow the orb while we track your breathing rate in real time and coach you to calm.</p>

    {phase==="idle"&&(<div style={{animation:"fadeIn .3s ease"}}>
      <div className="card" style={{marginBottom:14,borderColor:"rgba(224,123,108,.2)",background:"rgba(224,123,108,.03)"}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#e07b6c",marginBottom:14}}>How this works</h3>
        <div style={{display:"grid",gap:10}}>
          {[{i:"📊",t:"Live BPM display",d:"Your actual breathing rate updates every second — large and colour-coded so you can see it at a glance."},{i:"🎯",t:"Adaptive coaching",d:"Red (over-breathing >20 BPM) fades to amber to teal as you slow down. No counting required."},{i:"✅",t:"Calm confirmation",d:"Stay in the healthy zone for 90 seconds and the app confirms you've broken the acute cycle."}].map((f,i)=>(
            <div key={i} style={{display:"flex",gap:11,alignItems:"flex-start",padding:"11px 13px",background:"rgba(224,123,108,.04)",borderRadius:9}}>
              <span style={{fontSize:18,flexShrink:0}}>{f.i}</span>
              <div><div style={{fontWeight:500,color:"#e07b6c",fontSize:13,marginBottom:2}}>{f.t}</div><div style={{fontSize:12,color:"#4a6a7e",lineHeight:1.6}}>{f.d}</div></div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20}}>
          <button className="bp" style={{background:"#e07b6c",boxShadow:"0 8px 24px rgba(224,123,108,.35)"}} onClick={begin}>I need help right now</button>
        </div>
      </div>
      {isIframe()&&<div style={{padding:"12px 16px",border:"1px solid rgba(240,188,78,.15)",borderRadius:10,background:"rgba(240,188,78,.04)"}}><p style={{fontSize:12,color:"#7a6030",lineHeight:1.7}}>⚠️ Motion tracking requires Safari on iPhone — deploy to Vercel first. The orb breathing guide below works here without the sensor.</p></div>}
    </div>)}

    {["iframe_msg","denied_msg"].includes(phase)&&(
      <div className="card" style={{textAlign:"center",padding:"40px 28px"}}>
        <div style={{fontSize:44,marginBottom:16}}>{phase==="denied_msg"?"🔒":"🖥️"}</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#e07b6c",marginBottom:12}}>{phase==="iframe_msg"?"Open in Safari":"Motion access denied"}</h3>
        <p style={{color:"#5a7a8e",fontSize:14,lineHeight:1.85,marginBottom:20}}>{phase==="denied_msg"?"Settings → Safari → Motion & Orientation Access (toggle on), then return here.":"Deploy to Vercel and open in Safari on your iPhone for live breathing tracking."}</p>
        <button className="bg" onClick={()=>setPhase("idle")}>Back</button>
      </div>
    )}

    {phase==="active"&&(<div style={{animation:"fadeIn .3s ease"}}>
      {/* Big BPM */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div key={liveBpm} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:80,fontWeight:300,color:bpmColor,lineHeight:1,animation:liveBpm>0?"bpm 1s ease":undefined,transition:"color .6s ease"}}>{liveBpm||"–"}</div>
        <div style={{fontSize:11,color:bpmColor,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4,transition:"color .6s ease"}}>BPM</div>
        <p style={{fontSize:13,color:"#6a8ea8",lineHeight:1.6}}>{bpmMsg}</p>
      </div>
      {/* Calm progress */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#3a5a6e",marginBottom:6}}>
          <span>Calm zone</span><span>{calmSecs}s / {CALM_TARGET}s</span>
        </div>
        <div className="sbb" style={{height:8}}><div className="sbf" style={{width:`${calmPct}%`,background:"linear-gradient(90deg,#5ecfca77,#5ecfca)"}}/></div>
      </div>
      {/* Orb */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:12,height:180,alignItems:"center"}}>
        <div style={{width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle at 38% 34%,${bpmColor} 0%,${bpmColor}55 46%,transparent 100%)`,boxShadow:`0 0 60px ${bpmColor}44`,animation:orbAnim,transition:"background 1s ease,box-shadow 1s ease"}}/>
      </div>
      <div style={{height:36,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
        <p key={breathLabel} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:bpmColor,animation:"lf 8s ease forwards",transition:"color .6s"}}>{breathLabel}</p>
      </div>
      <Waveform samples={live} height={58} color={bpmColor}/>
      <div style={{textAlign:"center",marginTop:18}}><button className="bg" style={{color:"#e07b6c",borderColor:"rgba(224,123,108,.3)"}} onClick={stop}>Stop</button></div>
    </div>)}

    {phase==="calm"&&(<div style={{animation:"fadeIn .5s ease",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>✅</div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,color:"#5ecfca",marginBottom:14}}>You've broken the cycle</h3>
      <p style={{color:"#5a7a8e",lineHeight:1.85,fontSize:15,maxWidth:440,margin:"0 auto 24px"}}>Your breathing rate has been in the healthy range for 90 seconds. The acute anxiety loop has been interrupted. Your CO₂ levels are normalising.</p>
      <div className="card" style={{textAlign:"left",borderColor:"rgba(94,207,202,.2)",background:"rgba(94,207,202,.04)",marginBottom:24}}>
        <p style={{color:"#5a7a8e",fontSize:14,lineHeight:1.85}}>💡 <strong style={{color:"#dde6f0"}}>What just happened:</strong> By slowing your breathing consciously, you've reset the physiological feedback loop. Your CO₂ sensors needed time to recalibrate. You gave them that time.</p>
      </div>
      <button className="bg" onClick={()=>setPhase("idle")}>Done</button>
    </div>)}
  </div></div>);
}

// ─── SLEEP ────────────────────────────────────────────────────────────────────
const SLEEP_PHASES=[{name:"in",label:"Breathe in…",ms:4000,next:"hold"},{name:"hold",label:"Hold…",ms:7000,next:"out"},{name:"out",label:"Breathe out slowly…",ms:8000,next:"in"}];
const BODY_SCAN=["Start with your feet. Let them be heavy. You don't need to move them.","Your calves and shins are softening. Feel the weight of your lower legs.","Your thighs and hips are heavy and warm. Let the bed take their full weight.","Your abdomen rises and falls. Notice it, but don't control it.","Your chest and ribs are softening. Every exhale carries tension away.","Your shoulders are dropping. Your neck is long and relaxed.","Your jaw is unclenched. Your eyes are soft. Your face is still.","Your whole body is heavy and warm. You are ready for sleep."];

function SleepTab(){
  const[phase,setPhase]=useState("idle");
  const[breathPh,setBreathPh]=useState("in");
  const[breathLbl,setBreathLbl]=useState("Breathe in…");
  const[scanT,setScanT]=useState(60);
  const[scanLive,setScanLive]=useState([]);
  const[bodyScanIdx,setBodyScanIdx]=useState(0);
  const[cycles,setCycles]=useState(0);
  const[result,setResult]=useState(null);
  const bufRef=useRef([]);const bRef=useRef(null);const tRef=useRef(null);const scanRef=useRef(null);const bodyRef=useRef(null);
  const{requestPermission}=useMotion();

  const runSleepBreath=useCallback(n=>{const p=SLEEP_PHASES.find(x=>x.name===n);setBreathPh(p.name);setBreathLbl(p.label);if(p.name==="in")setCycles(c=>c+1);bRef.current=setTimeout(()=>runSleepBreath(p.next),p.ms);},[]);

  const startBreathing=()=>{setPhase("breathing");setCycles(0);setBodyScanIdx(0);runSleepBreath("in");bodyRef.current=setInterval(()=>setBodyScanIdx(i=>(i+1)%BODY_SCAN.length),14000);};

  const startReadiness=async()=>{
    const perm=await requestPermission();
    if(perm!=="granted"){setPhase(perm==="iframe"?"iframe_msg":"denied_msg");return;}
    clearTimeout(bRef.current);clearInterval(bodyRef.current);
    setPhase("scan");setScanT(60);setScanLive([]);bufRef.current=[];
    const t0=Date.now();
    const h=e=>{const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const s={t:Date.now()-t0,z:a.z??0};bufRef.current.push(s);setScanLive(d=>[...d.slice(-120),s]);};
    window._sH=h;window.addEventListener("devicemotion",h);
    scanRef.current=setInterval(()=>setScanT(t=>{if(t<=1){clearInterval(scanRef.current);window.removeEventListener("devicemotion",window._sH);const r=analyzeBreathing(bufRef.current);finishScan(r);return 0;}return t-1;}),1000);
  };

  const finishScan=(r)=>{
    const bpm=r?.bpm||0;
    const score=bpm===0?0:bpm>=8&&bpm<=14?100:bpm<8?Math.max(0,(bpm/8)*80):Math.max(0,100-((bpm-14)/14)*100);
    const readiness=Math.min(100,Math.round(score*.6+(r?.rhythm||50)*.25+(r?.depth||50)*.15));
    setResult({bpm,rhythm:r?.rhythm||0,depth:r?.depth||0,readiness,smooth:r?.smooth||[]});
    setPhase("result");
  };

  const reset=()=>{clearTimeout(bRef.current);clearInterval(bodyRef.current);clearInterval(scanRef.current);if(window._sH)window.removeEventListener("devicemotion",window._sH);setPhase("idle");setResult(null);setCycles(0);};

  const oAnim={in:"orbIn2 4s ease-in-out forwards",hold:"orbHold 7s ease-in-out infinite",out:"orbOut2 8s ease-in-out forwards"}[breathPh]||"pulse 5s ease-in-out infinite";
  const readColor=result?result.readiness>=75?"#5ecfca":result.readiness>=50?"#f0bc4e":"#e07b6c":"#5ecfca";

  return(<div className="te"><div style={{maxWidth:560,margin:"0 auto"}}>
    <h2 style={{...T.h2,textAlign:"center",marginBottom:8}}>Sleep Preparation</h2>
    <p style={{textAlign:"center",color:"#4a6a7e",marginBottom:36,fontSize:14,lineHeight:1.85}}>A guided wind-down using the 4-7-8 breathing method with a body scan and optional sleep-readiness measurement.</p>

    {phase==="idle"&&(<div style={{animation:"fadeIn .3s ease"}}>
      <div className="card" style={{marginBottom:14,borderColor:"rgba(122,184,232,.2)",background:"rgba(122,184,232,.03)"}}>
        <div style={{fontSize:40,textAlign:"center",marginBottom:16}}>🌙</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#7ab8e8",marginBottom:14,textAlign:"center"}}>How tonight's wind-down works</h3>
        <div style={{display:"grid",gap:10,marginBottom:24}}>
          {[{n:"1",t:"4-7-8 breathing",d:"Breathe in for 4, hold for 7, out for 8. Longer exhale activates the parasympathetic nervous system."},{n:"2",t:"Body scan",d:"Progressive relaxation cues guide your attention from feet to face, releasing held tension."},{n:"3",t:"Sleep readiness check",d:"Optional 60-second sensor measurement rates how much your breathing has slowed toward sleep-range."}].map(s=>(
            <div key={s.n} style={{padding:"12px 14px",background:"rgba(122,184,232,.05)",borderRadius:9,borderLeft:"2px solid rgba(122,184,232,.2)"}}>
              <div style={{fontSize:9,color:"#7ab8e8",letterSpacing:"0.1em",marginBottom:3}}>STEP {s.n}</div>
              <div style={{fontWeight:500,color:"#c8dde8",fontSize:13,marginBottom:3}}>{s.t}</div>
              <div style={{fontSize:12,color:"#4a6a7e",lineHeight:1.6}}>{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}><button className="bp" style={{background:"#7ab8e8"}} onClick={startBreathing}>Begin wind-down</button></div>
      </div>
    </div>)}

    {phase==="breathing"&&(<div style={{animation:"fadeIn .3s ease"}}>
      {/* Orb */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:16,height:200,alignItems:"center"}}>
        <div style={{width:130,height:130,borderRadius:"50%",background:"radial-gradient(circle at 38% 34%,rgba(122,184,232,.9) 0%,rgba(90,140,180,.5) 46%,transparent 100%)",boxShadow:"0 0 80px rgba(122,184,232,.4)",animation:oAnim}}/>
      </div>
      <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
        <p key={breathLbl} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontStyle:"italic",color:"#7ab8e8",animation:"lf 8s ease forwards"}}>{breathLbl}</p>
      </div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <span style={{fontSize:11,color:"#3a5a6e",letterSpacing:"0.08em"}}>{cycles} breath{cycles!==1?"s":""} completed</span>
      </div>
      {/* Body scan */}
      <div className="card" style={{borderColor:"rgba(122,184,232,.2)",background:"rgba(122,184,232,.04)",padding:"20px 22px",marginBottom:14,minHeight:76,display:"flex",alignItems:"center"}}>
        <p key={bodyScanIdx} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:"#7ab8e8",lineHeight:1.7,animation:"fadeIn .8s ease"}}>{BODY_SCAN[bodyScanIdx]}</p>
      </div>
      {cycles>=3&&<div style={{textAlign:"center",marginBottom:14}}><button className="bp" style={{background:"#7ab8e8",marginRight:12}} onClick={startReadiness}>Check sleep readiness</button><button className="bg" style={{color:"#7ab8e8",borderColor:"rgba(122,184,232,.3)"}} onClick={reset}>Finish</button></div>}
      {cycles<3&&<div style={{textAlign:"center",marginBottom:14}}><p style={{fontSize:11,color:"#3a5a6e"}}>Complete 3 breath cycles to unlock sleep readiness check</p></div>}
    </div>)}

    {["iframe_msg","denied_msg"].includes(phase)&&(
      <div className="card" style={{textAlign:"center",padding:"40px 28px"}}>
        <div style={{fontSize:44,marginBottom:16}}>{phase==="denied_msg"?"🔒":"🖥️"}</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#7ab8e8",marginBottom:12}}>{phase==="iframe_msg"?"Open in Safari to measure":"Motion access denied"}</h3>
        <p style={{color:"#5a7a8e",fontSize:14,lineHeight:1.85,marginBottom:20}}>{phase==="denied_msg"?"Settings → Safari → Motion & Orientation Access, then return here.":"Deploy to Vercel and open in Safari to use the sleep readiness measurement."}</p>
        <button className="bg" onClick={()=>setPhase("breathing")}>Back to breathing</button>
      </div>
    )}

    {phase==="scan"&&(<div style={{animation:"fadeIn .3s ease"}}>
      <div className="card" style={{marginBottom:14,padding:"24px 22px",borderColor:"rgba(122,184,232,.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div><div style={{fontSize:10,color:"#7ab8e8",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Measuring</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#dde6f0",fontWeight:300}}>Stay relaxed. Keep breathing.</div></div>
          <Countdown t={scanT} total={60}/>
        </div>
        <Waveform samples={scanLive} height={68} color="#7ab8e8"/>
      </div>
    </div>)}

    {phase==="result"&&result&&(<div style={{animation:"fadeIn .4s ease"}}>
      <div className="card" style={{textAlign:"center",borderColor:`${readColor}33`,background:`${readColor}08`,marginBottom:14,padding:"28px 22px"}}>
        <ScoreRing value={result.readiness} color={readColor} size={110}/>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:readColor,margin:"14px 0 10px"}}>
          {result.readiness>=75?"You are ready for sleep":result.readiness>=50?"You're approaching sleep readiness":"Keep breathing — you're not quite there"}
        </h3>
        <p style={{color:"#5a7a8e",fontSize:14,lineHeight:1.85}}>
          {result.bpm===0?"Signal was too weak — try repositioning the phone on your chest.":result.bpm>=8&&result.bpm<=14?`Your rate of ${result.bpm} BPM is in the ideal pre-sleep range (8–14 BPM). Your nervous system has shifted toward rest.`:result.bpm>14?`Your rate of ${result.bpm} BPM is still a little elevated. Continue the 4-7-8 breathing for another few minutes.`:`Your rate of ${result.bpm} BPM is very low — this is a deep rest state.`}
        </p>
      </div>
      {result.smooth.length>2&&<div className="card" style={{marginBottom:14}}><p style={{fontSize:10,color:"#3a5a6e",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Breathing signal</p><Waveform samples={result.smooth} height={65} color={readColor}/></div>}
      <div style={{textAlign:"center",display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
        {result.readiness<75&&<button className="bp" style={{background:"#7ab8e8"}} onClick={()=>{setPhase("breathing");setCycles(0);}}>Keep breathing</button>}
        <button className="bg" style={{color:"#7ab8e8",borderColor:"rgba(122,184,232,.3)"}} onClick={reset}>Finish</button>
      </div>
    </div>)}
  </div></div>);
}

// ─── REMAINING TABS (compacted) ───────────────────────────────────────────────
function AssessTab(){const[step,setStep]=useState(0);const[ans,setAns]=useState([]);const[res,setRes]=useState(null);const answer=yes=>{const n=[...ans,yes];if(step<QUIZ.length-1){setAns(n);setStep(s=>s+1);}else{setAns(n);setRes(getResult(n.filter(Boolean).length));}};const reset=()=>{setStep(0);setAns([]);setRes(null);};if(res){const fl=QUIZ.filter((_,i)=>ans[i]).map(q=>q.symptom);return(<div className="te"><div style={{maxWidth:560,margin:"0 auto"}}><h2 style={{...T.h2,textAlign:"center",marginBottom:28}}>Your assessment</h2><div className="card" style={{textAlign:"center",borderColor:res.color+"44",marginBottom:16,padding:"32px 24px"}}><div style={{width:76,height:76,borderRadius:"50%",background:res.color+"18",border:`2px solid ${res.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:res.color,fontWeight:300}}>{ans.filter(Boolean).length}</div><div style={{fontSize:10,color:res.color,opacity:.7}}>/ 10</div></div><div style={{fontSize:10,color:res.color,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{res.label}</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:res.color,marginBottom:10}}>{res.title}</h3><p style={T.mu}>{res.desc}</p></div>{fl.length>0&&<div className="card" style={{marginBottom:16}}><p style={{fontSize:10,color:"#4a6a7e",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Flagged symptoms</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{fl.map(s=><span key={s} style={{padding:"5px 13px",borderRadius:20,background:"rgba(94,207,202,.1)",border:"1px solid rgba(94,207,202,.22)",fontSize:12,color:"#5ecfca"}}>{s}</span>)}</div></div>}<div style={{textAlign:"center"}}><button className="bg" onClick={reset}>Retake</button></div></div></div>);}const q=QUIZ[step];return(<div className="te"><div style={{maxWidth:560,margin:"0 auto"}}><h2 style={{...T.h2,textAlign:"center",marginBottom:6}}>Self-Assessment</h2><p style={{textAlign:"center",color:"#3e5e72",marginBottom:24,fontSize:13}}>Question {step+1} of {QUIZ.length}</p><div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:3,marginBottom:36,overflow:"hidden"}}><div style={{height:"100%",width:`${(step/QUIZ.length)*100}%`,background:"linear-gradient(90deg,#5ecfca,#7ce0dc)",borderRadius:3,transition:"width .4s cubic-bezier(.22,1,.36,1)"}}/></div><div className="card" style={{marginBottom:18,padding:"26px 22px"}}><p style={{fontSize:10,color:"#5ecfca",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>{q.symptom}</p><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#dde6f0",lineHeight:1.65}}>{q.q}</p></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><button className="qo" onClick={()=>answer(true)}><div style={{fontSize:20,marginBottom:5}}>✓</div><div style={{fontWeight:500}}>Yes, often</div></button><button className="qo" onClick={()=>answer(false)}><div style={{fontSize:20,marginBottom:5,opacity:.4}}>✗</div><div style={{fontWeight:500}}>No / rarely</div></button></div></div></div>);}
function CheckTab(){const[step,setStep]=useState(0);const ST=[{t:"Get comfortable",e:"🛋️",m:"Lie down or sit back. Let your shoulders drop. Don't change your breathing yet.",n:null,c:false},{t:"Place your hands",e:"🙌",m:"One hand flat on your chest. The other gently on your belly, just below your ribcage.",n:"The hand position is everything — you're about to find out which part of your body is actually doing the breathing work.",c:false},{t:"Take a natural breath",e:"🫁",m:"Breathe in exactly as you normally would. Don't force it.",n:null,c:false},{t:"Watch what moves",e:"👀",m:"Which hand moved first? Your belly hand should rise on the inhale. If your chest hand rose — that's chest breathing.",n:null,c:true},{t:"What this tells you",e:"💡",m:"Correct breathing is slow, quiet, nasal — belly rising before chest. Chest breathing strains the upper body and raises stress response.",n:"The good news: it can be retrained.",c:false}];const s=ST[step];return(<div className="te"><div style={{maxWidth:520,margin:"0 auto"}}><h2 style={{...T.h2,textAlign:"center",marginBottom:6}}>The Breathing Check</h2><p style={{textAlign:"center",color:"#3e5e72",marginBottom:24,fontSize:13}}>Step {step+1} of {ST.length}</p><div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:3,marginBottom:36,overflow:"hidden"}}><div style={{height:"100%",width:`${((step+1)/ST.length)*100}%`,background:"linear-gradient(90deg,#5ecfca,#7ce0dc)",borderRadius:3,transition:"width .4s cubic-bezier(.22,1,.36,1)"}}/></div><div className="card" style={{textAlign:"center",marginBottom:16,padding:"34px 26px"}}><div style={{fontSize:58,marginBottom:18}}>{s.e}</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:"#5ecfca",marginBottom:12}}>{s.t}</h3><p style={{fontSize:16,color:"#dde6f0",lineHeight:1.75,marginBottom:s.n?14:0}}>{s.m}</p>{s.n&&<p style={{fontSize:13,color:"#4a6a7e",lineHeight:1.75,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:14}}>{s.n}</p>}</div>{s.c&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}><div className="card" style={{textAlign:"center",borderColor:"rgba(94,207,202,.3)"}}><div style={{fontSize:28,marginBottom:8}}>👍</div><div style={{fontWeight:500,color:"#5ecfca",marginBottom:5}}>Belly rises first</div><div style={{fontSize:12,color:"#4a6a7e",lineHeight:1.6}}>Diaphragm working. Correct.</div></div><div className="card" style={{textAlign:"center",borderColor:"rgba(224,123,108,.3)"}}><div style={{fontSize:28,marginBottom:8}}>⚠️</div><div style={{fontWeight:500,color:"#e07b6c",marginBottom:5}}>Chest rises first</div><div style={{fontSize:12,color:"#4a6a7e",lineHeight:1.6}}>Chest breathing. Retrainable.</div></div></div>}<div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>{step>0&&<button className="bg" onClick={()=>setStep(s=>s-1)}>← Back</button>}{step<ST.length-1?<button className="bp" onClick={()=>setStep(s=>s+1)}>Next →</button>:<button className="bp" onClick={()=>setStep(0)}>Start again</button>}</div></div></div>);}
const PHS=[{name:"in",label:"Breathe in…",ms:4000,next:"hold"},{name:"hold",label:"Hold gently",ms:2000,next:"out"},{name:"out",label:"Breathe out slowly…",ms:6000,next:"rest"},{name:"rest",label:"",ms:1200,next:"in"}];
function BreatheTab(){const[phase,setPhase]=useState("idle");const[label,setLabel]=useState("");const[run,setRun]=useState(false);const[rounds,setRounds]=useState(0);const tmr=useRef(null);const rp=useCallback(n=>{const p=PHS.find(x=>x.name===n);setPhase(p.name);setLabel(p.label);tmr.current=setTimeout(()=>{if(p.next==="in")setRounds(r=>r+1);rp(p.next);},p.ms);},[]);const start=()=>{setRun(true);setRounds(0);rp("in");};const stop=()=>{setRun(false);setPhase("idle");setLabel("");clearTimeout(tmr.current);};useEffect(()=>()=>clearTimeout(tmr.current),[]);const oa={idle:"pulse 5s ease-in-out infinite",in:"orbIn 4s ease-in-out forwards",hold:"orbHold 2s ease-in-out infinite",out:"orbOut 6s ease-in-out forwards",rest:"none"}[phase]||"none";return(<div className="te"><div style={{maxWidth:520,margin:"0 auto",textAlign:"center"}}><h2 style={{...T.h2,textAlign:"center",marginBottom:10}}>Guided Breathing</h2><p style={{color:"#4a6a7e",marginBottom:44,lineHeight:1.85,fontSize:14,maxWidth:400,margin:"0 auto 44px"}}>Follow the orb. Don't count — just breathe with it. Think of something joyful. That's the technique.</p><div style={{height:260,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><div style={{width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle at 38% 34%,rgba(94,207,202,.9) 0%,rgba(65,170,166,.5) 46%,rgba(40,120,120,.15) 100%)",boxShadow:run?"0 0 90px rgba(94,207,202,.45)":"0 0 50px rgba(94,207,202,.2)",animation:oa}}/></div><div style={{height:44,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>{label&&<p key={label} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontStyle:"italic",color:"#5ecfca",animation:"lf 6s ease forwards"}}>{label}</p>}</div><div style={{height:20,marginBottom:22}}>{run&&rounds>0&&<p style={{color:"#344e5e",fontSize:12}}>{rounds} breath{rounds!==1?"s":""} completed</p>}</div><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:44}}>{!run?<button className="bp" onClick={start}>Begin</button>:<button className="bg" onClick={stop}>Stop</button>}</div><div style={{textAlign:"left",display:"grid",gap:10}}>{[{i:"🛑",t:"Don't breathe harder when breathless — gently slow down instead."},{i:"👃",t:"Breathe through your nose. Nasal breathing slows, filters, and humidifies naturally."},{i:"🌅",t:"Think of something unrelated and joyful. Distraction plus slow breathing is the technique."}].map((tip,i)=>(<div key={i} className="card" style={{display:"flex",gap:12,alignItems:"flex-start",padding:"13px 16px"}}><span style={{fontSize:16,flexShrink:0}}>{tip.i}</span><p style={{color:"#6a8ea8",fontSize:13,lineHeight:1.8}}>{tip.t}</p></div>))}</div></div></div>);}
function CycleTab(){const[act,setAct]=useState(null);return(<div className="te"><div style={{maxWidth:640,margin:"0 auto"}}><h2 style={{...T.h2,textAlign:"center",marginBottom:10}}>The Vicious Cycle</h2><p style={{textAlign:"center",color:"#4a6a7e",marginBottom:40,lineHeight:1.8}}>Understanding the cycle is the first step to breaking it. Tap each stage.</p><div style={{position:"relative",width:270,height:270,margin:"0 auto 28px"}}><svg style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"spin 24s linear infinite"}} viewBox="0 0 270 270"><circle cx="135" cy="135" r="96" fill="none" stroke="rgba(94,207,202,.1)" strokeWidth="1.5" strokeDasharray="7 6"/></svg><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:9,color:"rgba(94,207,202,.4)",letterSpacing:"0.12em",lineHeight:1.5}}>THE<br/>CYCLE</div></div>{CYCLE.map((c,i)=>{const a=(i/CYCLE.length)*Math.PI*2-Math.PI/2,x=135+96*Math.cos(a),y=135+96*Math.sin(a),on=act===i;return(<button key={i} className="nd" onClick={()=>setAct(on?null:i)} style={{position:"absolute",left:x,top:y,transform:"translate(-50%,-50%)",width:62,height:62,borderRadius:"50%",background:on?c.color+"22":"rgba(7,16,31,.96)",border:`2px solid ${on?c.color:c.color+"55"}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:on?`0 0 20px ${c.color}44`:"none",cursor:"pointer"}}><span style={{fontSize:18}}>{c.icon}</span></button>);})}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>{CYCLE.map((c,i)=><button key={i} onClick={()=>setAct(act===i?null:i)} style={{padding:"13px 14px",borderRadius:12,textAlign:"left",cursor:"pointer",background:act===i?c.color+"0f":"rgba(255,255,255,.02)",border:`1px solid ${act===i?c.color+"44":"rgba(255,255,255,.06)"}`,transition:"all .2s"}}><div style={{fontSize:18,marginBottom:6}}>{c.icon}</div><div style={{fontSize:12,fontWeight:500,color:c.color,lineHeight:1.4,whiteSpace:"pre-line"}}>{c.label}</div></button>)}{act!==null&&<div className="card" key={act} style={{borderColor:CYCLE[act].color+"33",background:CYCLE[act].color+"09",animation:"fadeIn .25s ease",marginBottom:0,gridColumn:"1/-1"}}><h4 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:400,color:CYCLE[act].color,marginBottom:8}}>{CYCLE[act].label.replace("\n"," ")}</h4><p style={T.mu}>{CYCLE[act].detail}</p></div>}</div><div className="card" style={{borderColor:"rgba(94,207,202,.2)",background:"rgba(94,207,202,.04)"}}><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#5ecfca",marginBottom:8}}>Breaking the cycle</h3><p style={{...T.mu,marginBottom:8}}><strong style={{color:"#dde6f0"}}>You don't need to breathe harder when you feel breathless.</strong></p><p style={T.mu}>Gently slow your breathing, redirect attention to something pleasant, and trust the sensation will pass.</p></div></div></div>);}
function HelpTab(){const[op,setOp]=useState(null);const SY=[{icon:"🌙",title:"Sleep problems",desc:"Night-time breathlessness and disrupted patterns lead to exhaustion and fatigue."},{icon:"🧠",title:"Anxiety & depression",desc:"The breathless-anxiety loop is self-reinforcing: anxiety causes hyperventilation, which worsens anxiety."},{icon:"🪨",title:"Neck & shoulder tension",desc:"Over-recruiting chest muscles for breathing strains the upper body chronically."},{icon:"💫",title:"Dizziness & air hunger",desc:"Altered CO₂/O₂ balance causes lightheadedness and that 'can't get enough air' feeling."},{icon:"🫁",title:"Worsened asthma / COPD",desc:"Up to 30% of asthma patients also have dysfunctional breathing."},{icon:"🌀",title:"IBS & gut issues",desc:"Poor breathing patterns can worsen irritable bowel symptoms."},{icon:"❤️",title:"Cardiovascular stress",desc:"Chronic over-breathing raises heart rate and puts sustained load on the cardiovascular system."}];const TR=[{icon:"🔄",title:"Breathing retraining",desc:"Physiotherapists can retrain diaphragmatic breathing, nasal patterns, and breathing rate."},{icon:"🧠",title:"Psychological support",desc:"The breathing-anxiety cycle is bidirectional and needs dual treatment."},{icon:"🌬️",title:"Mindful slowing",desc:"Consciously slowing your breath regulates the nervous system. Don't count — just slow down."},{icon:"🧘",title:"Lifestyle & posture",desc:"Posture directly affects breathing mechanics."},{icon:"📟",title:"Biofeedback",desc:"Devices that measure CO₂ output or retrain breathing mechanics can help in some patients."}];return(<div className="te"><div style={{maxWidth:640,margin:"0 auto"}}><h2 style={{...T.h2,textAlign:"center",marginBottom:10}}>Consequences & Treatment</h2><p style={{textAlign:"center",color:"#4a6a7e",marginBottom:40,lineHeight:1.8}}>Dysfunctional breathing is common, underdiagnosed, and treatable.</p><h3 style={{...T.h3,marginBottom:14}}>What it can cause</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:11,marginBottom:40}}>{SY.map((s,i)=><button key={i} onClick={()=>setOp(op===i?null:i)} className="card" style={{textAlign:"left",cursor:"pointer",width:"100%",display:"block"}}><div style={{fontSize:26,marginBottom:8}}>{s.icon}</div><div style={{fontWeight:500,color:"#c8dde8",marginBottom:op===i?8:0,fontSize:13}}>{s.title}</div>{op===i&&<p style={{fontSize:12,color:"#4a6a7e",lineHeight:1.7,animation:"fadeIn .2s ease"}}>{s.desc}</p>}</button>)}</div><h3 style={{...T.h3,marginBottom:12}}>How it's treated</h3><div className="card" style={{marginBottom:11}}><p style={{...T.mu,marginBottom:8}}>The best outcomes come from a <strong style={{color:"#c8dde8"}}>multidisciplinary approach</strong> — doctors, physiotherapists, psychologists.</p><p style={T.mu}>Treatment centres on breathing retraining, addressing anxiety, lifestyle adjustments, and CO₂ monitoring.</p></div><div style={{display:"grid",gap:10,marginBottom:32}}>{TR.map((t,i)=><div key={i} className="card" style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:24,flexShrink:0,marginTop:2}}>{t.icon}</span><div><div style={{fontWeight:500,color:"#c8dde8",marginBottom:4,fontSize:13}}>{t.title}</div><p style={{fontSize:12,color:"#4a6a7e",lineHeight:1.7}}>{t.desc}</p></div></div>)}</div><div className="card" style={{borderColor:"rgba(240,188,78,.2)",background:"rgba(240,188,78,.03)",marginBottom:14}}><h4 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f0bc4e",marginBottom:10}}>Who to speak to</h4><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>{["GP / primary care","Respiratory physiotherapist","Pulmonologist","Speech & language therapist","Psychologist / therapist","Respiratory nurse"].map(w=><div key={w} style={{padding:"8px 11px",background:"rgba(240,188,78,.05)",borderRadius:7,fontSize:11,color:"#b09050",lineHeight:1.45}}>{w}</div>)}</div></div><div style={{padding:"14px 18px",border:"1px solid rgba(224,123,108,.18)",borderRadius:12,background:"rgba(224,123,108,.04)"}}><p style={{fontSize:12,color:"#6a4a40",lineHeight:1.85}}><strong style={{color:"#e07b6c"}}>Important:</strong> This is an educational resource, not a medical diagnosis. Significant breathlessness alongside chest pain warrants immediate medical attention.</p></div></div></div>);}
