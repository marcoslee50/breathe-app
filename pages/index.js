import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

// ─── DATA ──────────────────────────────────────────────────────────────────

const QUIZ = [
  { q: "Do you often feel short of breath even at rest or during light activity?",       symptom: "Resting breathlessness" },
  { q: "Do you tend to breathe mainly through your mouth rather than your nose?",        symptom: "Mouth breathing" },
  { q: "When you breathe in, do your shoulders or chest rise instead of your belly?",    symptom: "Chest breathing" },
  { q: "Do you experience anxiety, panic attacks, or a racing heart?",                   symptom: "Anxiety / panic" },
  { q: "Do you feel exhausted even after a full night's sleep?",                         symptom: "Chronic fatigue" },
  { q: "Do you experience unexplained dizziness or lightheadedness?",                    symptom: "Dizziness" },
  { q: "Do you carry persistent tension in your neck, shoulders, or upper chest?",       symptom: "Muscle tension" },
  { q: "Do you feel an unsatisfying 'air hunger' — like you can't complete a full breath?", symptom: "Air hunger" },
  { q: "Have you ever woken at night feeling breathless or with a sense of panic?",      symptom: "Sleep disruption" },
  { q: "Do you sigh or yawn frequently, or feel the need to top up your breath?",        symptom: "Over-breathing pattern" },
];

const SYMPTOMS = [
  { icon: "🌙", title: "Sleep problems",       desc: "Night-time breathlessness and disrupted patterns lead to exhaustion and fatigue." },
  { icon: "🧠", title: "Anxiety & depression", desc: "The breathless-anxiety loop is self-reinforcing: anxiety causes hyperventilation, which worsens anxiety." },
  { icon: "🪨", title: "Neck & shoulder tension", desc: "Over-recruiting chest and neck muscles for breathing strains the upper body chronically." },
  { icon: "💫", title: "Dizziness & air hunger", desc: "Altered CO₂/O₂ balance causes lightheadedness and that unsatisfying 'can't get enough air' feeling." },
  { icon: "🫁", title: "Worsened asthma / COPD", desc: "Up to 30% of asthma patients also have dysfunctional breathing, which aggravates their condition significantly." },
  { icon: "🌀", title: "IBS & gut issues",      desc: "Breathing affects abdominal pressure; poor patterns can worsen irritable bowel symptoms." },
  { icon: "❤️", title: "Cardiovascular stress", desc: "Chronic over-breathing raises heart rate and puts sustained extra load on the cardiovascular system." },
];

const CYCLE = [
  { label: "You feel\nout of breath",       icon: "😮‍💨", color: "#e07b6c",
    detail: "It may start with a moment of exertion, stress, or simply noticing your breath. The sensation of breathlessness is real — even without a medical cause. Your body perceives it as a threat." },
  { label: "You breathe\nharder & faster",  icon: "💨",   color: "#e8a456",
    detail: "The natural response is to breathe more — but this over-compensates. You may be breathing enough to sustain a brisk jog while sitting quietly in a chair." },
  { label: "CO₂ shifts,\nsensors reset",    icon: "⚗️",   color: "#c4a8f0",
    detail: "Hyperventilation lowers CO₂ in the blood. Over time, the brain's CO₂ sensors reset and become more sensitive — meaning normal CO₂ levels now trigger the urge to breathe even faster." },
  { label: "Anxiety &\ndizziness increase", icon: "🌀",   color: "#7ab8e8",
    detail: "Altered blood chemistry causes tingling, dizziness, palpitations, and anxiety. These symptoms feel indistinguishable from the original breathlessness — looping you back to the start." },
];

const TREATMENT = [
  { icon: "🔄", title: "Breathing retraining",     desc: "Physiotherapists and respiratory therapists can retrain diaphragmatic breathing, nasal patterns, and breathing rate." },
  { icon: "🧠", title: "Psychological support",    desc: "Addressing anxiety and the over-perception of breathlessness. The breathing-anxiety cycle is bidirectional and needs dual treatment." },
  { icon: "🌬️", title: "Mindful slowing",          desc: "Consciously slowing your breath regulates the nervous system and lowers heart rate. The key: don't count seconds. Just slow down." },
  { icon: "🧘", title: "Lifestyle & posture",      desc: "Posture directly affects breathing mechanics. Exercise, sleep quality, and stress management are all significant factors." },
  { icon: "📟", title: "Biofeedback devices",      desc: "Devices that measure CO₂ output or retrain mouth and tongue position can help correct patterns in some patients." },
];

function getResult(score) {
  if (score <= 2) return {
    color: '#5ecfca', label: 'Low likelihood',
    title: 'Your breathing seems fairly balanced',
    desc: 'You show few signs of dysfunctional breathing. Maintain awareness of your breath and revisit this if symptoms develop. The guided exercise here is still beneficial for general wellbeing.',
  };
  if (score <= 5) return {
    color: '#f0bc4e', label: 'Moderate signs',
    title: 'Some patterns worth paying attention to',
    desc: 'You\'re showing several symptoms associated with dysfunctional breathing. Try the guided breathing exercises in this app and consider raising your symptoms with your GP or a physiotherapist.',
  };
  return {
    color: '#e07b6c', label: 'Strong indicators',
    title: 'Your breathing may be significantly disordered',
    desc: 'You\'re showing many signs of dysfunctional breathing. This is common — up to 12% of adults are affected — and it is treatable. Speak with your GP and ask for referral to a respiratory physiotherapist or specialist breathing clinic.',
  };
}

// ─── ROOT ──────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('home');

  const TABS = [
    { id: 'home',    label: 'Overview' },
    { id: 'assess',  label: 'Self-assess' },
    { id: 'check',   label: 'Breathing check' },
    { id: 'breathe', label: 'Guided exercise' },
    { id: 'cycle',   label: 'The cycle' },
    { id: 'help',    label: 'Get help' },
  ];

  return (
    <>
      <Head>
        <title>Breathe Well — Understand & Retrain Your Breathing</title>
        <meta name="description" content="Understand dysfunctional breathing, check your own pattern, and retrain it with guided exercises." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />
      </Head>

      {/* Background atmosphere */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,207,202,0.045) 0%, transparent 65%)', animation: 'orbPulse 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-8%',  width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(156,143,232,0.03) 0%, transparent 65%)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, borderBottom: '1px solid rgba(94,207,202,0.08)', background: 'rgba(7,16,31,0.88)', backdropFilter: 'blur(20px)', padding: '10px 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', fontStyle: 'italic', color: '#5ecfca', marginRight: '14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            breathe well
          </span>
          {TABS.map(t => (
            <button key={t.id} className={`nav-pill${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '44px 22px 100px', position: 'relative', zIndex: 1 }}>
        {tab === 'home'    && <HomeTab    setTab={setTab} />}
        {tab === 'assess'  && <AssessTab  />}
        {tab === 'check'   && <CheckTab   />}
        {tab === 'breathe' && <BreatheTab />}
        {tab === 'cycle'   && <CycleTab   />}
        {tab === 'help'    && <HelpTab    />}
      </main>
    </>
  );
}

// ─── HOME ──────────────────────────────────────────────────────────────────

function HomeTab({ setTab }) {
  return (
    <div className="tab-enter">
      {/* Hero */}
      <div style={{ textAlign: 'center', paddingBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '52px' }}>
          <div style={{
            width: '164px', height: '164px', borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 34%, rgba(94,207,202,0.85) 0%, rgba(65,170,166,0.4) 48%, transparent 100%)',
            boxShadow: '0 0 80px rgba(94,207,202,0.28), inset 0 0 40px rgba(255,255,255,0.04)',
            animation: 'orbPulse 4.5s ease-in-out infinite',
          }} />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 6vw, 62px)', fontWeight: 300, lineHeight: 1.1, color: '#dde6f0', marginBottom: '22px' }}>
          You may not realise<br />
          <em style={{ color: '#5ecfca' }}>your breathing is wrong</em>
        </h1>

        <p style={{ fontSize: '17px', color: '#7a9cb8', maxWidth: '540px', margin: '0 auto 44px', lineHeight: 1.8, fontWeight: 300 }}>
          Up to 12% of adults have dysfunctional breathing — and most don't know it. It silently contributes to anxiety, poor sleep, chronic fatigue, and more. This app helps you understand, identify, and retrain your breath.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setTab('assess')}>Check yourself →</button>
          <button className="btn-ghost"    onClick={() => setTab('breathe')}>Start breathing</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '48px' }}>
        {[
          { stat: '12%',    sub: 'of adults affected' },
          { stat: '30%',    sub: 'of asthma patients' },
          { stat: 'Often',  sub: 'underdiagnosed' },
          { stat: '7+',     sub: 'symptom types' },
        ].map(s => (
          <div key={s.stat} className="card" style={{ textAlign: 'center', padding: '22px 16px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '46px', fontWeight: 300, color: '#5ecfca', lineHeight: 1 }}>{s.stat}</div>
            <div style={{ fontSize: '12px', color: '#5a7a8e', marginTop: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* What is it */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, marginBottom: '14px', color: '#c8dde8' }}>What is dysfunctional breathing?</h2>
        <p style={{ color: '#7a9cb8', lineHeight: 1.85, marginBottom: '12px' }}>
          Dysfunctional breathing — also called breathing pattern disorder — is when breathlessness or difficulty breathing is felt <em>outside the context of any disease</em>, or disproportionately to an existing condition like asthma or COPD.
        </p>
        <p style={{ color: '#7a9cb8', lineHeight: 1.85 }}>
          It includes chronic breathlessness, persistent hyperventilation, mouth breathing, over-breathing, and shallow breathing. Because breathing is automatic, many people carry these patterns for years — even decades — without realising.
        </p>
      </div>

      {/* How breathing works */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, marginBottom: '18px', color: '#c8dde8' }}>How breathing is supposed to work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '14px' }}>
          {[
            { n: '1', title: 'Air enters nasally',    desc: 'Filtered, warmed, and humidified through the nose — not the mouth.' },
            { n: '2', title: 'Diaphragm contracts',   desc: 'The large muscle beneath the lungs pulls downward, creating chest cavity space.' },
            { n: '3', title: 'Lungs expand',          desc: 'The ribcage widens and air fills the lungs, belly rising visibly.' },
            { n: '4', title: 'Gas exchange occurs',   desc: 'Oxygen enters the blood via alveoli; CO₂ is expelled on the exhale.' },
          ].map(s => (
            <div key={s.n} style={{ padding: '16px', background: 'rgba(94,207,202,0.04)', borderRadius: '10px', borderLeft: '3px solid rgba(94,207,202,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#5ecfca', letterSpacing: '0.1em', marginBottom: '6px' }}>STEP {s.n}</div>
              <div style={{ fontWeight: 500, color: '#c8dde8', marginBottom: '6px', fontSize: '15px' }}>{s.title}</div>
              <div style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CO2 insight */}
      <div className="card" style={{ borderColor: 'rgba(196,168,240,0.25)', background: 'rgba(196,168,240,0.04)' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#c4a8f0', marginBottom: '10px' }}>The CO₂ sensitivity factor</h3>
        <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>
          When dysfunctional patterns develop, the brain's CO₂ sensors can reset and become oversensitised — meaning even <em>normal</em> levels of carbon dioxide trigger a signal to breathe faster. This is why the cycle is self-perpetuating and why simply "trying to breathe normally" isn't enough.
        </p>
      </div>
    </div>
  );
}

// ─── ASSESS ────────────────────────────────────────────────────────────────

function AssessTab() {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult]   = useState(null);

  const answer = (yes) => {
    const next = [...answers, yes];
    if (step < QUIZ.length - 1) {
      setAnswers(next);
      setStep(s => s + 1);
    } else {
      setAnswers(next);
      setResult(getResult(next.filter(Boolean).length));
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  if (result) {
    const flagged = QUIZ.filter((_, i) => answers[i]).map(q => q.symptom);
    return (
      <div className="tab-enter">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '36px', color: '#c8dde8' }}>
            Your assessment
          </h2>

          <div className="card" style={{ textAlign: 'center', borderColor: result.color + '44', marginBottom: '20px', padding: '36px 28px' }}>
            <div style={{
              width: '82px', height: '82px', borderRadius: '50%',
              background: result.color + '18', border: `2px solid ${result.color}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', color: result.color, fontWeight: 300, lineHeight: 1 }}>
                {answers.filter(Boolean).length}
              </div>
              <div style={{ fontSize: '10px', color: result.color, letterSpacing: '0.08em', opacity: 0.7 }}>/ 10</div>
            </div>
            <div style={{ fontSize: '11px', color: result.color, letterSpacing: '0.1em', marginBottom: '10px', textTransform: 'uppercase' }}>{result.label}</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: result.color, marginBottom: '14px' }}>{result.title}</h3>
            <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>{result.desc}</p>
          </div>

          {flagged.length > 0 && (
            <div className="card" style={{ marginBottom: '22px' }}>
              <p style={{ fontSize: '13px', color: '#5a7a8e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Symptoms you flagged</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {flagged.map(s => (
                  <span key={s} style={{ padding: '5px 13px', borderRadius: '20px', background: 'rgba(94,207,202,0.1)', border: '1px solid rgba(94,207,202,0.22)', fontSize: '13px', color: '#5ecfca' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button className="btn-ghost" onClick={reset}>Retake assessment</button>
          </div>
        </div>
      </div>
    );
  }

  const pct = (step / QUIZ.length) * 100;
  const q   = QUIZ[step];

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '6px', color: '#c8dde8' }}>Self-Assessment</h2>
        <p style={{ textAlign: 'center', color: '#4e6e82', marginBottom: '32px', fontSize: '14px' }}>Question {step + 1} of {QUIZ.length}</p>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '44px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #5ecfca, #7ce0dc)', borderRadius: '3px', transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)' }} />
        </div>

        <div className="card" style={{ marginBottom: '22px', padding: '32px 28px' }}>
          <p style={{ fontSize: '11px', color: '#5ecfca', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>{q.symptom}</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#dde6f0', lineHeight: 1.65, fontWeight: 400 }}>{q.q}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="quiz-opt" onClick={() => answer(true)}
            style={{ borderColor: 'rgba(94,207,202,0.22)', color: '#c8dde8', textAlign: 'center', padding: '18px' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>✓</div>
            <div style={{ fontWeight: 500 }}>Yes, often</div>
          </button>
          <button className="quiz-opt" onClick={() => answer(false)}
            style={{ textAlign: 'center', padding: '18px' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px', opacity: 0.5 }}>✗</div>
            <div style={{ fontWeight: 500 }}>No / rarely</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECK ─────────────────────────────────────────────────────────────────

function CheckTab() {
  const [step, setStep] = useState(0);

  const STEPS = [
    { title: "Get comfortable",     emoji: "🛋️",
      main: "Lie down or sit back in a chair. Let your shoulders drop. Don't change how you're breathing yet — just settle in for a moment.",
      note: null },
    { title: "Place your hands",    emoji: "🙌",
      main: "Place one hand flat on your chest. Place the other gently on your belly, just below your ribcage.",
      note: "The hand position is everything. You're about to discover which part of your body is actually doing the breathing work." },
    { title: "Take a natural breath", emoji: "🫁",
      main: "Breathe in exactly as you normally would. Don't force a deep breath — just breathe naturally, as if you weren't paying attention.",
      note: null },
    { title: "Watch what moves",    emoji: "👀",
      main: "Which hand moved first and most? Your belly hand should rise on the inhale. If your chest hand rose instead — that's chest breathing.",
      note: null,
      compare: true },
    { title: "What this tells you", emoji: "💡",
      main: "Correct breathing is slow, quiet, and nasal. Your belly should rise before your chest. Improper breathing is shallow, rapid, through the mouth, or causes shoulder and chest movement.",
      note: "Chest breathing over-recruits neck and shoulder muscles, raising your stress response and wasting energy. The good news: it can be retrained." },
  ];

  const s = STEPS[step];

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '6px', color: '#c8dde8' }}>The Breathing Check</h2>
        <p style={{ textAlign: 'center', color: '#4e6e82', marginBottom: '32px', fontSize: '14px' }}>Step {step + 1} of {STEPS.length}</p>

        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '44px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #5ecfca, #7ce0dc)', borderRadius: '3px', transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)' }} />
        </div>

        <div className="card" style={{ textAlign: 'center', marginBottom: '20px', padding: '44px 32px' }}>
          <div style={{ fontSize: '68px', marginBottom: '26px' }}>{s.emoji}</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 400, color: '#5ecfca', marginBottom: '16px' }}>{s.title}</h3>
          <p style={{ fontSize: '18px', color: '#dde6f0', lineHeight: 1.75, marginBottom: s.note ? '18px' : 0 }}>{s.main}</p>
          {s.note && (
            <p style={{ fontSize: '14px', color: '#5a7a8e', lineHeight: 1.75, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '18px' }}>{s.note}</p>
          )}
        </div>

        {s.compare && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(94,207,202,0.3)', background: 'rgba(94,207,202,0.05)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>👍</div>
              <div style={{ fontWeight: 500, color: '#5ecfca', marginBottom: '7px' }}>Belly rises first</div>
              <div style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.65 }}>Diaphragm is working. Correct breathing.</div>
            </div>
            <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(224,123,108,0.3)', background: 'rgba(224,123,108,0.05)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
              <div style={{ fontWeight: 500, color: '#e07b6c', marginBottom: '7px' }}>Chest rises first</div>
              <div style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.65 }}>Chest breathing. Common, and retrainable.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {step > 0 && <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < STEPS.length - 1
            ? <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
            : <button className="btn-primary" onClick={() => setStep(0)}>Start again</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── BREATHE ───────────────────────────────────────────────────────────────

const PHASES = [
  { name: 'in',   label: 'Breathe in…',        ms: 4000, next: 'hold' },
  { name: 'hold', label: 'Hold gently',         ms: 2000, next: 'out'  },
  { name: 'out',  label: 'Breathe out slowly…', ms: 6000, next: 'rest' },
  { name: 'rest', label: '',                    ms: 1200, next: 'in'   },
];

function BreatheTab() {
  const [phase,   setPhase]   = useState('idle');
  const [label,   setLabel]   = useState('');
  const [running, setRunning] = useState(false);
  const [rounds,  setRounds]  = useState(0);
  const timer = useRef(null);

  const runPhase = useCallback((name) => {
    const p = PHASES.find(x => x.name === name);
    setPhase(p.name);
    setLabel(p.label);
    timer.current = setTimeout(() => {
      if (p.next === 'in') setRounds(r => r + 1);
      runPhase(p.next);
    }, p.ms);
  }, []);

  const start = () => { setRunning(true); setRounds(0); runPhase('in'); };
  const stop  = () => { setRunning(false); setPhase('idle'); setLabel(''); clearTimeout(timer.current); };

  useEffect(() => () => clearTimeout(timer.current), []);

  const orbAnim = {
    idle: 'orbPulse 5s ease-in-out infinite',
    in:   'orbIn   4s ease-in-out forwards',
    hold: 'orbHold 2s ease-in-out infinite',
    out:  'orbOut  6s ease-in-out forwards',
    rest: 'none',
  }[phase] || 'none';

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, marginBottom: '10px', color: '#c8dde8' }}>Guided Breathing</h2>
        <p style={{ color: '#5a7a8e', marginBottom: '52px', lineHeight: 1.85, fontSize: '15px', maxWidth: '440px', margin: '0 auto 52px' }}>
          Follow the orb. Don't count seconds — just breathe with it. Let your mind wander to something calm or joyful. That's not a distraction; that's the technique.
        </p>

        {/* Orb */}
        <div style={{ height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 34%, rgba(94,207,202,0.92) 0%, rgba(65,170,166,0.5) 46%, rgba(40,120,120,0.15) 100%)',
            boxShadow: running ? '0 0 100px rgba(94,207,202,0.45)' : '0 0 55px rgba(94,207,202,0.22)',
            animation: orbAnim,
          }} />
        </div>

        {/* Phase label */}
        <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          {label && (
            <p key={label} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontStyle: 'italic', color: '#5ecfca', animation: 'labelFade 6s ease forwards' }}>
              {label}
            </p>
          )}
        </div>

        {/* Round counter */}
        <div style={{ height: '24px', marginBottom: '28px' }}>
          {running && rounds > 0 && (
            <p style={{ color: '#3e5e72', fontSize: '13px', letterSpacing: '0.05em' }}>
              {rounds} breath{rounds !== 1 ? 's' : ''} completed
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '56px' }}>
          {!running
            ? <button className="btn-primary" onClick={start}>Begin</button>
            : <button className="btn-ghost"   onClick={stop}>Stop</button>
          }
        </div>

        {/* Tips from the article */}
        <div style={{ textAlign: 'left', display: 'grid', gap: '12px' }}>
          {[
            { icon: "🛑", text: "Don't breathe harder when you feel breathless. Noticing breathlessness can actually make it worse. Gently slow down instead." },
            { icon: "👃", text: "Breathe through your nose if you can. Nasal breathing slows, filters, and humidifies your breath naturally." },
            { icon: "🔢", text: "Avoid counting seconds or monitoring your inhale-exhale ratio. Too much attention amplifies anxiety and worsens the pattern." },
            { icon: "🌅", text: "Think of something unrelated and joyful. Distraction plus slow breathing is more effective than focused breathwork alone." },
          ].map((tip, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 20px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{tip.icon}</span>
              <p style={{ color: '#7a9cb8', fontSize: '14px', lineHeight: 1.8 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CYCLE ─────────────────────────────────────────────────────────────────

function CycleTab() {
  const [active, setActive] = useState(null);

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '10px', color: '#c8dde8' }}>The Vicious Cycle</h2>
        <p style={{ textAlign: 'center', color: '#5a7a8e', marginBottom: '48px', lineHeight: 1.8 }}>
          Understanding the cycle is the first step to breaking it. Tap each stage.
        </p>

        {/* Diagram */}
        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 36px' }}>
          {/* Rotating dashed ring */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animation: 'rotateSlow 24s linear infinite' }} viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="108" fill="none" stroke="rgba(94,207,202,0.1)" strokeWidth="1.5" strokeDasharray="7 6" />
          </svg>

          {/* Centre label */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', color: 'rgba(94,207,202,0.5)', letterSpacing: '0.12em', lineHeight: 1.5 }}>THE<br/>CYCLE</div>
          </div>

          {/* Nodes */}
          {CYCLE.map((c, i) => {
            const angle = (i / CYCLE.length) * Math.PI * 2 - Math.PI / 2;
            const x = 150 + 108 * Math.cos(angle);
            const y = 150 + 108 * Math.sin(angle);
            const on = active === i;
            return (
              <button key={i} className="cycle-node" onClick={() => setActive(on ? null : i)} style={{
                position: 'absolute', left: `${x}px`, top: `${y}px`,
                transform: 'translate(-50%,-50%)',
                width: '72px', height: '72px', borderRadius: '50%',
                background: on ? c.color + '22' : 'rgba(7,16,31,0.95)',
                border: `2px solid ${on ? c.color : c.color + '55'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: on ? `0 0 22px ${c.color}44` : 'none',
                cursor: 'pointer', padding: '4px',
              }}>
                <span style={{ fontSize: '22px' }}>{c.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {CYCLE.map((c, i) => (
            <button key={i} onClick={() => setActive(active === i ? null : i)} style={{
              padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
              background: active === i ? c.color + '10' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${active === i ? c.color + '44' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.22s ease',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: c.color, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{c.label}</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        {active !== null && (
          <div className="card" key={active} style={{ borderColor: CYCLE[active].color + '33', background: CYCLE[active].color + '09', animation: 'fadeIn 0.3s ease', marginBottom: '20px' }}>
            <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: CYCLE[active].color, marginBottom: '10px' }}>
              {CYCLE[active].label.replace('\n', ' ')}
            </h4>
            <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>{CYCLE[active].detail}</p>
          </div>
        )}

        {/* Breaking it */}
        <div className="card" style={{ borderColor: 'rgba(94,207,202,0.2)', background: 'rgba(94,207,202,0.04)' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#5ecfca', marginBottom: '12px' }}>Breaking the cycle</h3>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px', marginBottom: '12px' }}>
            The key insight: <strong style={{ color: '#dde6f0' }}>you don't need to breathe harder when you feel breathless.</strong> The urge is natural, but it feeds the loop.
          </p>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>
            Instead: gently slow your breathing, redirect attention to something pleasant and unrelated, and trust the sensation will pass. Knowing you can interrupt the loop is itself part of the treatment.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── HELP ──────────────────────────────────────────────────────────────────

function HelpTab() {
  const [open, setOpen] = useState(null);

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '10px', color: '#c8dde8' }}>Consequences & Treatment</h2>
        <p style={{ textAlign: 'center', color: '#5a7a8e', marginBottom: '48px', lineHeight: 1.8 }}>
          Dysfunctional breathing is common, underdiagnosed, and treatable.
        </p>

        {/* Consequences */}
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#c8dde8', marginBottom: '18px' }}>What it can cause</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '14px', marginBottom: '48px' }}>
          {SYMPTOMS.map((s, i) => (
            <button key={i} onClick={() => setOpen(open === i ? null : i)}
              className="card"
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%', display: 'block' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontWeight: 500, color: '#c8dde8', marginBottom: open === i ? '10px' : 0, fontSize: '15px' }}>{s.title}</div>
              {open === i && <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.75, animation: 'fadeIn 0.2s ease' }}>{s.desc}</p>}
            </button>
          ))}
        </div>

        {/* Treatment */}
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#c8dde8', marginBottom: '16px' }}>How it's treated</h3>
        <div className="card" style={{ marginBottom: '14px' }}>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, marginBottom: '12px', fontSize: '15px' }}>
            There is no single gold standard treatment. Research confirms the best outcomes come from a <strong style={{ color: '#c8dde8' }}>multidisciplinary approach</strong> — a team that may include doctors, physiotherapists, speech-language therapists, and psychologists working together.
          </p>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>
            Treatment centres on breathing retraining, addressing anxiety or underlying conditions, lifestyle adjustments, and in some cases CO₂ monitoring devices.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
          {TREATMENT.map((t, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 500, color: '#c8dde8', marginBottom: '6px', fontSize: '15px' }}>{t.title}</div>
                <p style={{ fontSize: '14px', color: '#5a7a8e', lineHeight: 1.75 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Who to see */}
        <div className="card" style={{ borderColor: 'rgba(240,188,78,0.2)', background: 'rgba(240,188,78,0.03)', marginBottom: '20px' }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#f0bc4e', marginBottom: '14px' }}>Who to speak to</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '10px' }}>
            {['GP / primary care', 'Respiratory physiotherapist', 'Pulmonologist', 'Speech & language therapist', 'Psychologist / therapist', 'Respiratory nurse'].map(w => (
              <div key={w} style={{ padding: '10px 14px', background: 'rgba(240,188,78,0.06)', borderRadius: '8px', fontSize: '13px', color: '#b8a060', lineHeight: 1.45 }}>{w}</div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '18px 22px', border: '1px solid rgba(224,123,108,0.18)', borderRadius: '12px', background: 'rgba(224,123,108,0.04)' }}>
          <p style={{ fontSize: '13px', color: '#7a5a50', lineHeight: 1.8 }}>
            <strong style={{ color: '#e07b6c' }}>Important:</strong> This app is an educational resource, not a medical diagnosis. If you're experiencing significant breathlessness — especially alongside chest pain or a racing heart — speak to a doctor promptly to rule out cardiac or respiratory conditions before assuming dysfunctional breathing is the cause.
          </p>
        </div>
      </div>
    </div>
  );
}
