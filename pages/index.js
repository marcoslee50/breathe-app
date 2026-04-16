import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

// ─── DATA ──────────────────────────────────────────────────────────────────

const QUIZ = [
  { q: "Do you often feel short of breath even at rest or during light activity?",          symptom: "Resting breathlessness" },
  { q: "Do you tend to breathe mainly through your mouth rather than your nose?",           symptom: "Mouth breathing" },
  { q: "When you breathe in, do your shoulders or chest rise instead of your belly?",       symptom: "Chest breathing" },
  { q: "Do you experience anxiety, panic attacks, or a racing heart?",                      symptom: "Anxiety / panic" },
  { q: "Do you feel exhausted even after a full night's sleep?",                            symptom: "Chronic fatigue" },
  { q: "Do you experience unexplained dizziness or lightheadedness?",                       symptom: "Dizziness" },
  { q: "Do you carry persistent tension in your neck, shoulders, or upper chest?",          symptom: "Muscle tension" },
  { q: "Do you feel an unsatisfying 'air hunger' — like you can't complete a full breath?", symptom: "Air hunger" },
  { q: "Have you ever woken at night feeling breathless or with a sense of panic?",         symptom: "Sleep disruption" },
  { q: "Do you sigh or yawn frequently, or feel the need to top up your breath?",           symptom: "Over-breathing pattern" },
];

const SYMPTOMS = [
  { icon: "🌙", title: "Sleep problems",         desc: "Night-time breathlessness and disrupted patterns lead to exhaustion and fatigue." },
  { icon: "🧠", title: "Anxiety & depression",   desc: "The breathless-anxiety loop is self-reinforcing: anxiety causes hyperventilation, which worsens anxiety." },
  { icon: "🪨", title: "Neck & shoulder tension", desc: "Over-recruiting chest and neck muscles for breathing strains the upper body chronically." },
  { icon: "💫", title: "Dizziness & air hunger",  desc: "Altered CO₂/O₂ balance causes lightheadedness and that unsatisfying 'can't get enough air' feeling." },
  { icon: "🫁", title: "Worsened asthma / COPD",  desc: "Up to 30% of asthma patients also have dysfunctional breathing, which aggravates their condition significantly." },
  { icon: "🌀", title: "IBS & gut issues",         desc: "Breathing affects abdominal pressure; poor patterns can worsen irritable bowel symptoms." },
  { icon: "❤️", title: "Cardiovascular stress",    desc: "Chronic over-breathing raises heart rate and puts sustained extra load on the cardiovascular system." },
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
  { icon: "🔄", title: "Breathing retraining",   desc: "Physiotherapists and respiratory therapists can retrain diaphragmatic breathing, nasal patterns, and breathing rate." },
  { icon: "🧠", title: "Psychological support",  desc: "Addressing anxiety and the over-perception of breathlessness. The breathing-anxiety cycle is bidirectional and needs dual treatment." },
  { icon: "🌬️", title: "Mindful slowing",        desc: "Consciously slowing your breath regulates the nervous system and lowers heart rate. The key: don't count seconds. Just slow down." },
  { icon: "🧘", title: "Lifestyle & posture",    desc: "Posture directly affects breathing mechanics. Exercise, sleep quality, and stress management are all significant factors." },
  { icon: "📟", title: "Biofeedback devices",    desc: "Devices that measure CO₂ output or retrain mouth and tongue position can help correct patterns in some patients." },
];

// ─── SCIENCE DATA ──────────────────────────────────────────────────────────

const SCIENCE_SYSTEMS = [
  {
    id: 'nervous', icon: '🧠', color: '#c4a8f0', title: 'Nervous System',
    subtitle: 'The Master Switch',
    summary: 'Breathing is the only autonomic function you can consciously control — making it a direct bridge between your mind and your body\'s internal chemistry.',
    points: [
      { head: 'The Vagus Nerve', body: 'Slow, deep diaphragmatic breathing stimulates the vagus nerve — your body\'s primary "brake pedal" for heart rate. This activates the Parasympathetic Nervous System (Rest and Digest), lowering cortisol and reducing inflammation.' },
      { head: 'The Stress Response', body: 'Short, shallow chest breathing triggers the Sympathetic Nervous System (Fight or Flight). When this becomes your default pattern, you maintain chronically elevated cortisol, impaired immunity, and low-grade systemic inflammation.' },
    ],
  },
  {
    id: 'chemistry', icon: '⚗️', color: '#7ab8e8', title: 'Blood Chemistry',
    subtitle: 'O₂, CO₂ & pH Balance',
    summary: 'Most people believe more oxygen is always better. The Bohr Effect shows why that\'s wrong — and why CO₂ is not just a waste gas.',
    points: [
      { head: 'The Bohr Effect', body: 'Your tissues cannot use oxygen effectively without an adequate level of CO₂ in the blood. CO₂ is what signals haemoglobin to release oxygen to cells. Over-breathing paradoxically starves your tissues of oxygen.' },
      { head: 'pH Regulation', body: 'Your breath is the fastest way to modulate blood pH. Hyperventilation exhales too much CO₂, making blood alkaline — triggering lightheadedness, tingling extremities, and constricted blood vessels.' },
    ],
  },
  {
    id: 'cardio', icon: '❤️', color: '#e07b6c', title: 'Cardiovascular',
    subtitle: 'Heart Rate, Pressure & Nitric Oxide',
    summary: 'Breath modulation directly impacts how hard your heart works and the efficiency of your entire circulatory system.',
    table: [
      { mech: 'Heart Rate Variability (HRV)', effect: 'Rhythmic breathing at ~6 BPM increases HRV — a key marker of cardiovascular resilience and the body\'s capacity to recover from stress.' },
      { mech: 'Blood Pressure', effect: 'Deep diaphragmatic breathing promotes vasodilation (widening of blood vessels), which naturally lowers blood pressure without medication.' },
      { mech: 'Nitric Oxide (NO)', effect: 'Breathing through the nose releases Nitric Oxide produced in the sinuses. NO is a powerful vasodilator and has antiviral and antibacterial properties — mouth breathing bypasses this entirely.' },
    ],
  },
  {
    id: 'mechanical', icon: '🫁', color: '#5ecfca', title: 'Mechanical & Lymphatic',
    subtitle: 'Your Body\'s Internal Pump',
    summary: 'The physical movement of the diaphragm acts as a pump for several systems throughout the body that have no dedicated pump of their own.',
    points: [
      { head: 'Lymphatic Drainage', body: 'Unlike the blood, the lymphatic system — your body\'s waste-clearance network — has no heart to pump it. The movement of the diaphragm creates pressure changes that circulate lymph fluid and help the body clear toxins and cellular waste.' },
      { head: 'Core Stability & Back Pain', body: 'Proper diaphragmatic breathing creates intra-abdominal pressure, which stabilises the lumbar spine. Dysfunctional breathing patterns are a frequently missed contributor to chronic lower back pain.' },
    ],
  },
];

const TECHNIQUES = [
  { tabId: 'anxiety', icon: '📦', color: '#c4a8f0', name: 'Box Breathing', ratio: '4–4–4–4', who: 'Navy SEALs & elite athletes', desc: 'Equal inhale, hold, exhale, hold. Rebalances ANS activation and maintains cognitive clarity under extreme stress.' },
  { tabId: 'sleep',   icon: '🌙', color: '#9b8de8', name: '4-7-8 Technique', ratio: '4–7–8', who: 'Dr. Andrew Weil / pranayama', desc: 'Extended hold and long exhale stimulates the vagus nerve and acts as a chemical sedative for the nervous system.' },
  { tabId: 'anxiety', icon: '😮‍💨', color: '#7ab8e8', name: 'Physiological Sigh', ratio: '2+1–0–7', who: 'Stanford 2023 research', desc: 'Double nasal inhale + long exhale. The fastest single-breath technique for reducing acute physiological stress.' },
  { tabId: 'breathe', icon: '🌊', color: '#5ecfca', name: '6 BPM Resonance', ratio: '5–5', who: 'HRV science', desc: 'Breathing at exactly 6 breaths per minute resonates with cardiovascular rhythms, maximising Heart Rate Variability.' },
];

const SYMPTOM_SYSTEM_MAP = {
  'Resting breathlessness': 'chemistry',
  'Mouth breathing':        'cardio',
  'Chest breathing':        'mechanical',
  'Anxiety / panic':        'nervous',
  'Chronic fatigue':        'chemistry',
  'Dizziness':              'chemistry',
  'Muscle tension':         'mechanical',
  'Air hunger':             'chemistry',
  'Sleep disruption':       'nervous',
  'Over-breathing pattern': 'chemistry',
};

function getRecommendation(flagged) {
  const counts = {};
  flagged.forEach(s => {
    const sys = SYMPTOM_SYSTEM_MAP[s];
    if (sys) counts[sys] = (counts[sys] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0];
  if (top === 'nervous')   return { id: 'anxiety', label: 'Anxiety SOS',         color: '#c4a8f0', reason: 'Your pattern shows nervous system dysregulation. The SOS breathing protocols directly stimulate the vagus nerve and produce relief within 2–4 minutes.' };
  if (top === 'chemistry') return { id: 'breathe', label: 'Guided Breathing',    color: '#5ecfca', reason: 'Your symptoms point to a CO₂/O₂ imbalance. Slowing your breathing rate with nasal diaphragmatic breaths is the most direct intervention.' };
  if (top === 'cardio')    return { id: 'breathe', label: 'Guided Breathing',    color: '#5ecfca', reason: '6 BPM resonance breathing maximises Heart Rate Variability and cardiovascular efficiency — with measurable effects within one session.' };
  if (top === 'mechanical')return { id: 'meditate', label: 'Body Scan Meditation', color: '#f0bc4e', reason: 'Body scan meditation retrains diaphragmatic movement, releases chronic tension patterns, and directly addresses mechanical dysfunction.' };
  return { id: 'breathe', label: 'Guided Breathing', color: '#5ecfca', reason: 'The core guided breathing exercise is the best starting point for retraining your pattern.' };
}

// ─── RESULT SCORING ────────────────────────────────────────────────────────

function getResult(score) {
  if (score <= 2) return { color: '#5ecfca', label: 'Low likelihood',   title: 'Your breathing seems fairly balanced',             desc: 'You show few signs of dysfunctional breathing. Maintain awareness of your breath and revisit this if symptoms develop. The guided exercise here is still beneficial for general wellbeing.' };
  if (score <= 5) return { color: '#f0bc4e', label: 'Moderate signs',   title: 'Some patterns worth paying attention to',           desc: "You're showing several symptoms associated with dysfunctional breathing. Try the guided breathing exercises in this app and consider raising your symptoms with your GP or a physiotherapist." };
  return              { color: '#e07b6c', label: 'Strong indicators', title: 'Your breathing may be significantly disordered',    desc: "You're showing many signs of dysfunctional breathing. This is common — up to 12% of adults are affected — and it is treatable. Speak with your GP and ask for referral to a respiratory physiotherapist or specialist breathing clinic." };
}

// ─── MEDITATION SCRIPTS ────────────────────────────────────────────────────

const MEDITATIONS = {
  sunrise: {
    id: 'sunrise', label: 'Morning Calm', emoji: '🌅', duration: 300, color: '#f0bc4e',
    desc: '5 min · Gentle wake-up · Breath awareness',
    science: 'Morning breathing practice lowers cortisol (the stress hormone), which peaks at waking. Even 5 minutes can lower baseline anxiety for the entire day.',
    cues: [
      [0,   "Find a comfortable position. Let your body settle."],
      [20,  "Close your eyes. Don't change your breath — just notice it."],
      [45,  "Feel the weight of your body. Release any holding."],
      [75,  "Breathe in slowly through your nose…"],
      [85,  "And out, letting the exhale be slightly longer."],
      [110, "Shoulders low and soft. Check them now."],
      [140, "With each breath, you become more quietly awake."],
      [170, "Notice the air — cool on the inhale, warm on the exhale."],
      [200, "Your nervous system is settling. You're doing well."],
      [230, "Let any thoughts drift by. You don't need to follow them."],
      [260, "Take three intentional breaths. Feel each one fully."],
      [285, "You're ready. Carry this calm into your day."],
      [298, "Session complete. ✓"],
    ],
  },
  reset: {
    id: 'reset', label: 'Stress Reset', emoji: '⚡', duration: 180, color: '#7ab8e8',
    desc: '3 min · Acute relief · Extended exhale',
    science: "The exhale activates the vagus nerve — your body's parasympathetic 'brake'. Research confirms exhales twice as long as inhales lower heart rate within 60 seconds.",
    cues: [
      [0,   "Stop. Wherever you are — just breathe."],
      [12,  "Inhale slowly through your nose for 4 counts…"],
      [20,  "Exhale through your mouth for 8. Twice as long."],
      [36,  "Again. In for 4…"],
      [44,  "Out for 8. Feel your body start to release."],
      [60,  "The extended exhale is activating your body's brake pedal."],
      [80,  "Your heart rate is already slowing. You don't need to force anything."],
      [105, "Notice how different this feels from when you started."],
      [130, "One more extended exhale. Make it the longest yet."],
      [155, "Your stress response has been interrupted."],
      [172, "Return to your day from here. ✓"],
    ],
  },
  scan: {
    id: 'scan', label: 'Body Scan', emoji: '🌊', duration: 600, color: '#9b8de8',
    desc: '10 min · Deep relaxation · Full body release',
    science: 'Body scan meditation (MBSR) reduces cortisol by up to 28% in a single session. It works by systematically discharging tension held unconsciously in muscle groups.',
    cues: [
      [0,   "Find complete comfort. This time is entirely yours."],
      [25,  "Allow your eyes to close."],
      [50,  "Begin with your feet. Breathe into them — then release."],
      [90,  "Your calves and shins now. Inhale… exhale and soften."],
      [130, "Your thighs and hips. Let them be heavy. Released."],
      [165, "Feel your lower back melt toward what's beneath you."],
      [200, "Your belly rises and falls. Easy. Natural."],
      [240, "Your chest. Your shoulders. Breathe into any tension you find."],
      [280, "Your arms are heavy. Your hands are warm."],
      [320, "Your neck is free. Your jaw is unclenched."],
      [360, "Your face is completely soft. Your brow is smooth."],
      [400, "Your whole body is resting. Nothing is required of you."],
      [450, "Each breath takes you a little deeper."],
      [500, "You are completely safe. Completely still."],
      [550, "Rest here for as long as you wish."],
      [585, "Begin to return. Gently deepen your breath."],
      [598, "Session complete. ✓"],
    ],
  },
};

// ─── ANXIETY PROTOCOLS ─────────────────────────────────────────────────────

const ANXIETY_PROTOCOLS = {
  box: {
    id: 'box', label: 'Box Breathing', emoji: '◻', color: '#7ab8e8',
    science: 'Used by Navy SEALs and emergency responders. The equal 4-count pattern forces cognitive focus and prevents the racing thoughts that fuel anxiety spirals.',
    phases: [
      { name: 'in',    label: 'Breathe in',   ms: 4000, next: 'hold1' },
      { name: 'hold1', label: 'Hold',          ms: 4000, next: 'out'   },
      { name: 'out',   label: 'Breathe out',   ms: 4000, next: 'hold2' },
      { name: 'hold2', label: 'Hold',          ms: 4000, next: 'in'    },
    ],
  },
  exhale: {
    id: 'exhale', label: 'Extended Exhale', emoji: '🌬', color: '#5ecfca',
    science: "The vagus nerve connects your lungs to your heart. A slow, full exhale sends a parasympathetic signal that lowers heart rate within seconds. The fastest physiological calming technique available.",
    phases: [
      { name: 'in',    label: 'Breathe in',   ms: 4000, next: 'out'  },
      { name: 'out',   label: 'Exhale slowly', ms: 8000, next: 'rest' },
      { name: 'rest',  label: '',              ms: 1000, next: 'in'   },
    ],
  },
  sigh: {
    id: 'sigh', label: 'Physiological Sigh', emoji: '💨', color: '#c4a8f0',
    science: "Stanford neuroscience research (2023) found this is the single fastest way to reduce physiological stress — faster than any meditation. One or two sighs is often enough to feel the shift.",
    phases: [
      { name: 'in1',   label: 'Inhale through nose…',   ms: 2000, next: 'in2'  },
      { name: 'in2',   label: 'Quick second sniff ↑',   ms: 900,  next: 'out'  },
      { name: 'out',   label: 'Long exhale through mouth', ms: 7000, next: 'rest' },
      { name: 'rest',  label: '',                        ms: 1500, next: 'in1'  },
    ],
  },
};

// ─── SLEEP PATTERNS ────────────────────────────────────────────────────────

const SLEEP_PATTERNS = {
  p478: {
    id: 'p478', label: '4-7-8 Classic', emoji: '🌙', color: '#9b8de8',
    science: "Developed by Dr. Andrew Weil from pranayama. The 7-count breath-hold gently raises CO₂, creating a natural drowsiness reflex. Clinical studies show sleep onset reduced by up to 40%.",
    phases: [
      { name: 'in',    label: 'Breathe in…',     ms: 4000, next: 'hold' },
      { name: 'hold',  label: 'Hold…',            ms: 7000, next: 'out'  },
      { name: 'out',   label: 'Exhale slowly…',   ms: 8000, next: 'rest' },
      { name: 'rest',  label: '',                 ms: 1500, next: 'in'   },
    ],
  },
  hrv: {
    id: 'hrv', label: '6 BPM Drift', emoji: '〰', color: '#5ecfca',
    science: "Breathing at exactly 0.1 Hz (6 breaths per minute) synchronises your heart's natural rhythm, maximising heart rate variability — the gold standard of nervous system calm.",
    phases: [
      { name: 'in',  label: 'Breathe in…',    ms: 5000, next: 'out' },
      { name: 'out', label: 'Breathe out…',   ms: 5000, next: 'in'  },
    ],
  },
  gentle: {
    id: 'gentle', label: '4-8 Wind-Down', emoji: '🌫', color: '#7ab8e8',
    science: "A 1:2 ratio (inhale:exhale) reliably activates the parasympathetic nervous system. This gentler version suits anxiety-related insomnia where the 4-7-8 hold feels claustrophobic.",
    phases: [
      { name: 'in',   label: 'Breathe in…',    ms: 4000, next: 'out'  },
      { name: 'out',  label: 'Breathe out…',   ms: 8000, next: 'rest' },
      { name: 'rest', label: '',                ms: 1000, next: 'in'   },
    ],
  },
};

// ─── HOOKS ─────────────────────────────────────────────────────────────────

function useMotionPermission() {
  const [status, setStatus] = useState('idle');
  const request = useCallback(async () => {
    setStatus('requesting');
    if (typeof window === 'undefined' || typeof DeviceMotionEvent === 'undefined') {
      setStatus('unavailable'); return false;
    }
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const r = await DeviceMotionEvent.requestPermission();
        const ok = r === 'granted';
        setStatus(ok ? 'granted' : 'denied');
        return ok;
      } catch {
        setStatus('denied'); return false;
      }
    }
    setStatus('granted');
    return true;
  }, []);
  return { status, request };
}

function useBreathDetection(active) {
  const [rate, setRate]           = useState(null);
  const [phase, setPhase]         = useState(null);
  const [amplitude, setAmplitude] = useState(0);
  const [noSensor, setNoSensor]   = useState(false);
  const waveRef = useRef([]);
  const stRef = useRef({ smooth: 0, prev: 0, prevPhase: null, lastT: 0, intervals: [], cal: false, calSamples: [], baseline: 0 });

  useEffect(() => {
    if (!active) {
      waveRef.current = [];
      return;
    }
    const s = stRef.current;
    Object.assign(s, { smooth: 0, prev: 0, prevPhase: null, lastT: 0, intervals: [], cal: false, calSamples: [], baseline: 0 });
    waveRef.current = [];
    let count = 0;
    let gotEvent = false;

    const noSensorTimer = setTimeout(() => { if (!gotEvent) setNoSensor(true); }, 3500);

    const handler = (e) => {
      gotEvent = true;
      clearTimeout(noSensorTimer);
      setNoSensor(false);

      const z = e.accelerationIncludingGravity?.z ?? e.acceleration?.z ?? 0;
      s.smooth = 0.88 * s.smooth + 0.12 * z;
      count++;

      if (!s.cal) {
        s.calSamples.push(s.smooth);
        if (count >= 90) {
          s.baseline = s.calSamples.reduce((a, b) => a + b) / s.calSamples.length;
          s.cal = true;
        }
        return;
      }

      const centered = s.smooth - s.baseline;
      waveRef.current.push(centered);
      if (waveRef.current.length > 150) waveRef.current.shift();

      const slice = waveRef.current.slice(-60);
      const lo = Math.min(...slice), hi = Math.max(...slice);
      setAmplitude(Math.min(1, Math.max(0, (hi - lo) / 1.2)));

      const rising = s.smooth > s.prev;
      const curPhase = rising ? 'in' : 'out';
      setPhase(curPhase);

      if (s.prevPhase && curPhase !== s.prevPhase) {
        const now = Date.now();
        if (s.lastT > 0) {
          const half = now - s.lastT;
          if (half > 750 && half < 7000) {
            s.intervals.push(half);
            if (s.intervals.length > 10) s.intervals.shift();
            if (s.intervals.length >= 4) {
              const avg = s.intervals.reduce((a, b) => a + b) / s.intervals.length;
              setRate(Math.round(60000 / (avg * 2)));
            }
          }
        }
        s.lastT = now;
      }
      s.prev = s.smooth;
      s.prevPhase = curPhase;
    };

    window.addEventListener('devicemotion', handler);
    return () => {
      window.removeEventListener('devicemotion', handler);
      clearTimeout(noSensorTimer);
      setRate(null); setPhase(null); setAmplitude(0);
    };
  }, [active]);

  return { rate, phase, amplitude, noSensor, waveRef };
}

function usePhaseTimer(phases, running) {
  const [phaseName, setPhaseName] = useState('idle');
  const [phaseLabel, setPhaseLabel] = useState('');
  const [rounds, setRounds] = useState(0);
  const timerRef = useRef(null);

  const runPhase = useCallback((name) => {
    const p = phases.find(x => x.name === name);
    if (!p) return;
    setPhaseName(p.name);
    setPhaseLabel(p.label);
    timerRef.current = setTimeout(() => {
      if (p.next === phases[0].name) setRounds(r => r + 1);
      runPhase(p.next);
    }, p.ms);
  }, [phases]);

  useEffect(() => {
    if (running) {
      setRounds(0);
      runPhase(phases[0].name);
    } else {
      clearTimeout(timerRef.current);
      setPhaseName('idle');
      setPhaseLabel('');
    }
    return () => clearTimeout(timerRef.current);
  }, [running, runPhase, phases]);

  return { phaseName, phaseLabel, rounds };
}

// ─── SOUNDSCAPE PRESETS ────────────────────────────────────────────────────
// Each preset defines layers: brownNoise (0-1 gain), drone (hz + harmonics), binaural (hz beat)
// Binaural science: theta 4-8Hz = deep meditation, alpha 8-12Hz = calm focus, delta 1-4Hz = sleep

const SOUNDSCAPES = {
  breathe:  { volume: 0.38, brownNoise: 0.28, drone: { freq: 174, harmonics: [[1,0.13],[2,0.06],[3,0.03]] } },
  sunrise:  { volume: 0.42, brownNoise: 0.18, drone: { freq: 432, harmonics: [[1,0.15],[2,0.07]] }, binaural: { base: 200, beat: 6,  vol: 0.12 } },
  reset:    { volume: 0.40, brownNoise: 0.22, drone: { freq: 396, harmonics: [[1,0.14],[2,0.07]] }, binaural: { base: 210, beat: 10, vol: 0.14 } },
  bodyscan: { volume: 0.42, brownNoise: 0.32, drone: { freq: 174, harmonics: [[1,0.10],[2,0.05]] }, binaural: { base: 196, beat: 4,  vol: 0.10 } },
  anxiety:  { volume: 0.38, brownNoise: 0.20, drone: { freq: 528, harmonics: [[1,0.13],[2,0.06]] }, binaural: { base: 210, beat: 10, vol: 0.13 } },
  sleep:    { volume: 0.32, brownNoise: 0.42, drone: { freq: 136, harmonics: [[1,0.08],[2,0.04]] }, binaural: { base: 190, beat: 2,  vol: 0.09 } },
};

const MED_SOUNDSCAPE = { sunrise: 'sunrise', reset: 'reset', bodyscan: 'bodyscan' };

// ─── SOUND ENGINE HOOK ─────────────────────────────────────────────────────

function useSoundEngine(presetKey, active) {
  const ctxRef   = useRef(null);
  const nodesRef = useRef([]);

  // ⚠️ Call this DIRECTLY in a click handler before any setState call.
  // iOS & Chrome block AudioContext creation/resume unless it happens
  // synchronously inside a user gesture. useEffect fires after re-render — too late.
  const wakeAudio = useCallback(() => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    } catch(_) {}
  }, []);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch(_){} });
    nodesRef.current = [];
  }, []);

  useEffect(() => {
    if (!active || !presetKey) { stopAll(); return; }
    const preset = SOUNDSCAPES[presetKey];
    if (!preset) return;
    let cancelled = false;

    const start = async () => {
      try {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
          ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Await resume — nodes must only be created after the Promise resolves,
        // otherwise gain values are ignored while context clock is at zero.
        await ctxRef.current.resume();
        if (cancelled) return;
        const ctx = ctxRef.current;
        if (ctx.state !== 'running') return;

        const nodes = [];
        const master = ctx.createGain();
        master.gain.value = preset.volume ?? 0.4;
        master.connect(ctx.destination);
        nodes.push(master);

        // ── Brown noise ──────────────────────────────────────────
        if (preset.brownNoise) {
          const sr  = ctx.sampleRate;
          const buf = ctx.createBuffer(1, sr * 3, sr);
          const d   = buf.getChannelData(0);
          let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
          for (let i = 0; i < d.length; i++) {
            const w = Math.random()*2-1;
            b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
            b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
            b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
            d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
          }
          const src  = ctx.createBufferSource();
          const gain = ctx.createGain();
          src.buffer = buf; src.loop = true;
          gain.gain.value = preset.brownNoise;
          src.connect(gain); gain.connect(master); src.start();
          nodes.push(src, gain);
        }

        // ── Binaural beats — StereoPanner (more compatible than ChannelMerger) ──
        if (preset.binaural && ctx.createStereoPanner) {
          const { base, beat, vol } = preset.binaural;
          [[base, -0.9], [base + beat, 0.9]].forEach(([freq, pan]) => {
            const osc    = ctx.createOscillator();
            const gain   = ctx.createGain();
            const panner = ctx.createStereoPanner();
            osc.type = 'sine'; osc.frequency.value = freq;
            gain.gain.value = vol; panner.pan.value = pan;
            osc.connect(gain); gain.connect(panner); panner.connect(master);
            osc.start(); nodes.push(osc, gain, panner);
          });
        }

        // ── Harmonic drone ───────────────────────────────────────
        if (preset.drone) {
          preset.drone.harmonics.forEach(([mult, vol]) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = preset.drone.freq * mult;
            gain.gain.value = vol;
            osc.connect(gain); gain.connect(master); osc.start();
            nodes.push(osc, gain);
          });
        }

        nodesRef.current = nodes;
      } catch(_) {}
    };

    start();
    return () => { cancelled = true; stopAll(); };
  }, [active, presetKey, stopAll]);

  // Bell tone
  const bell = useCallback(() => {
    try {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state !== 'running') return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 528;
      gain.gain.value = 0.25;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 2);
    } catch(_) {}
  }, []);

  return { bell, stopAll, wakeAudio };
}

// ─── VOICE GUIDE HOOK ──────────────────────────────────────────────────────

function useSpeechGuide() {
  const [enabled, setEnabled] = useState(false);
  const available = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback((text) => {
    if (!available || !enabled || !text) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.82; utt.pitch = 1.0; utt.volume = 1.0;
    // Prefer a calm English voice
    const voices = window.speechSynthesis.getVoices();
    const pick = voices.find(v => /samantha|karen|fiona|moira|victoria|serena/i.test(v.name))
      || voices.find(v => v.lang === 'en-GB')
      || voices.find(v => v.lang.startsWith('en'));
    if (pick) utt.voice = pick;
    window.speechSynthesis.speak(utt);
  }, [available, enabled]);

  const cancel = useCallback(() => {
    if (available) window.speechSynthesis.cancel();
  }, [available]);

  return { speak, cancel, enabled, setEnabled, available };
}

// ─── SESSION HISTORY HOOK ──────────────────────────────────────────────────
// Stores scan results and practice sessions in localStorage for progress tracking

function useSessionHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('bw_history') || '[]');
      setHistory(stored);
    } catch(_) {}
  }, []);

  const save = useCallback((entry) => {
    try {
      const stored = JSON.parse(localStorage.getItem('bw_history') || '[]');
      const updated = [{ ...entry, ts: Date.now() }, ...stored].slice(0, 100);
      localStorage.setItem('bw_history', JSON.stringify(updated));
      setHistory(updated);
    } catch(_) {}
  }, []);

  const logScan = useCallback((result) => save({ type: 'scan', ...result }), [save]);
  const logSession = useCallback((mode, seconds) => save({ type: 'session', mode, seconds }), [save]);
  const clearHistory = useCallback(() => {
    try { localStorage.removeItem('bw_history'); setHistory([]); } catch(_) {}
  }, []);

  // Derived stats
  const totalSessions = history.filter(h => h.type === 'session').length;
  const totalMinutes  = Math.round(history.filter(h => h.type === 'session').reduce((a,h) => a + (h.seconds||0), 0) / 60);
  const scans         = history.filter(h => h.type === 'scan');
  const lastScan      = scans[0] || null;
  const streak        = (() => {
    const days = new Set(history.map(h => new Date(h.ts).toDateString()));
    let count = 0;
    const d = new Date();
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate()-1); }
    return count;
  })();

  return { history, logScan, logSession, clearHistory, totalSessions, totalMinutes, lastScan, streak };
}

// ─── AUDIO CONTROLS UI ─────────────────────────────────────────────────────

function AudioBar({ voice, sound, onToggleVoice, onToggleSound, onWakeAudio }) {
  return (
    <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px' }}>
      <button
        onClick={onToggleVoice}
        title={voice ? 'Voice guidance on — tap to mute' : 'Voice guidance off — tap to enable'}
        aria-label={voice ? 'Voice guidance on' : 'Voice guidance off'}
        style={{
          display:'flex', alignItems:'center', gap:'7px', padding:'8px 16px',
          borderRadius:'20px', border:`1px solid ${voice?'rgba(94,207,202,0.4)':'rgba(255,255,255,0.1)'}`,
          background: voice?'rgba(94,207,202,0.1)':'rgba(255,255,255,0.03)',
          color: voice?'#5ecfca':'#4e6e82', fontSize:'13px', cursor:'pointer', transition:'all 0.2s',
        }}>
        <span style={{fontSize:'16px'}}>{voice?'🔊':'🔇'}</span>
        <span>Voice {voice?'on':'off'}</span>
      </button>
      <button
        onClick={() => { onWakeAudio?.(); onToggleSound(); }}
        title={sound ? 'Soundscape on — tap to mute' : 'Soundscape off — tap to enable'}
        aria-label={sound ? 'Soundscape playing' : 'Soundscape muted'}
        style={{
          display:'flex', alignItems:'center', gap:'7px', padding:'8px 16px',
          borderRadius:'20px', border:`1px solid ${sound?'rgba(160,120,240,0.4)':'rgba(255,255,255,0.1)'}`,
          background: sound?'rgba(160,120,240,0.1)':'rgba(255,255,255,0.03)',
          color: sound?'#b07fe0':'#4e6e82', fontSize:'13px', cursor:'pointer', transition:'all 0.2s',
        }}>
        <span style={{fontSize:'16px'}}>🎵</span>
        <span>Sound {sound?'on':'off'}</span>
      </button>
    </div>
  );
}

// ─── SHARED COMPONENTS ─────────────────────────────────────────────────────

function BreathCanvas({ waveRef, height = 90 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const data = waveRef.current;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(94,207,202,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

      if (data.length >= 2) {
        const lo = Math.min(...data), hi = Math.max(...data);
        const range = Math.max(0.02, hi - lo);
        const norm = data.map(v => (v - lo) / range);

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(94,207,202,0)');
        grad.addColorStop(0.08, '#5ecfca');
        grad.addColorStop(0.92, '#5ecfca');
        grad.addColorStop(1, 'rgba(94,207,202,0)');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        norm.forEach((v, i) => {
          const x = (i / (norm.length - 1)) * w;
          const y = h - (v * h * 0.8) - h * 0.1;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [waveRef]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={height}
      style={{ width: '100%', height: `${height}px`, display: 'block', borderRadius: '8px' }}
    />
  );
}

function RateBadge({ rate }) {
  if (!rate) return null;
  const { label, color } = rate < 9
    ? { label: 'Very calm', color: '#5ecfca' }
    : rate < 14
    ? { label: 'Normal', color: '#f0bc4e' }
    : { label: 'Fast — slow down', color: '#e07b6c' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: color + '18', border: `1px solid ${color}44` }}>
      <span style={{ fontSize: '14px', fontWeight: 600, color }}>{rate} BPM</span>
      <span style={{ fontSize: '12px', color: color + 'bb' }}>{label}</span>
    </div>
  );
}

function BreathOrb({ phaseName, color = '#5ecfca', size = 160 }) {
  const anims = {
    idle:  `orbPulse 5s ease-in-out infinite`,
    in:    `orbIn 4s ease-in-out forwards`,
    in1:   `orbIn2s 2s ease-in-out forwards`,
    in2:   `orbSniff 0.9s ease-in-out forwards`,
    hold:  `orbHold 4s ease-in-out infinite`,
    hold1: `orbHold 4s ease-in-out infinite`,
    hold2: `orbHold 4s ease-in-out infinite`,
    out:   `orbOut 6s ease-in-out forwards`,
    rest:  'none',
    pause: 'none',
  };
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: `radial-gradient(circle at 38% 34%, ${color}ee 0%, ${color}70 46%, transparent 100%)`,
      boxShadow: `0 0 70px ${color}40`,
      animation: anims[phaseName] ?? `orbPulse 5s ease-in-out infinite`,
      transition: 'background 1s ease',
    }} />
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('home');
  const hist = useSessionHistory();

  const TABS = [
    { id: 'home',    label: 'Overview' },
    { id: 'assess',  label: 'Self-assess' },
    { id: 'scan',    label: 'Live scan' },
    { id: 'breathe', label: 'Guided breathing' },
    { id: 'meditate',label: 'Meditation' },
    { id: 'anxiety', label: 'Anxiety SOS' },
    { id: 'sleep',   label: 'Sleep mode' },
    { id: 'science', label: 'The science' },
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

      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,207,202,0.045) 0%, transparent 65%)', animation: 'orbPulse 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,141,232,0.03) 0%, transparent 65%)' }} />
      </div>

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

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '44px 22px 100px', position: 'relative', zIndex: 1 }}>
        {tab === 'home'     && <HomeTab    setTab={setTab} hist={hist} />}
        {tab === 'assess'   && <AssessTab  setTab={setTab} />}
        {tab === 'scan'     && <ScanTab    logScan={hist.logScan} />}
        {tab === 'breathe'  && <BreatheTab logSession={hist.logSession} />}
        {tab === 'meditate' && <MeditateTab logSession={hist.logSession} />}
        {tab === 'anxiety'  && <AnxietyTab logSession={hist.logSession} />}
        {tab === 'sleep'    && <SleepTab   logSession={hist.logSession} />}
        {tab === 'science'  && <ScienceTab setTab={setTab} />}
        {tab === 'help'     && <HelpTab    />}
      </main>
    </>
  );
}


// ─── HOME ──────────────────────────────────────────────────────────────────

function HomeTab({ setTab, hist }) {
  const [goal, setGoal] = useState(null);
  const { totalSessions, totalMinutes, lastScan, streak, history } = hist;

  const GOALS = [
    { id: 'anxiety', icon: '🛟', label: 'Manage stress or anxiety',  desc: 'Immediate relief + long-term regulation' },
    { id: 'sleep',   icon: '🌙', label: 'Improve my sleep',          desc: '4-7-8 and HRV wind-down techniques' },
    { id: 'scan',    icon: '📡', label: 'Understand my breathing',   desc: 'Live sensor scan + full health analysis' },
    { id: 'breathe', icon: '🌊', label: 'General health & wellbeing',desc: 'Retrain your pattern from the ground up' },
  ];

  return (
    <div className="tab-enter">
      <div style={{ textAlign: 'center', paddingBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '44px' }}>
          <div style={{ width: '164px', height: '164px', borderRadius: '50%', background: 'radial-gradient(circle at 38% 34%, rgba(94,207,202,0.85) 0%, rgba(65,170,166,0.4) 48%, transparent 100%)', boxShadow: '0 0 80px rgba(94,207,202,0.28), inset 0 0 40px rgba(255,255,255,0.04)', animation: 'orbPulse 4.5s ease-in-out infinite' }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 6vw, 62px)', fontWeight: 300, lineHeight: 1.1, color: '#dde6f0', marginBottom: '22px' }}>
          Breathing is the only<br />
          <em style={{ color: '#5ecfca' }}>autonomic function you control</em>
        </h1>
        <p style={{ fontSize: '17px', color: '#7a9cb8', maxWidth: '560px', margin: '0 auto 18px', lineHeight: 1.85, fontWeight: 300 }}>
          When you change how you breathe, you aren't just moving air. You are shifting blood chemistry, heart rate, cortisol levels, and your entire physiological state.
        </p>
        <p style={{ fontSize: '15px', color: '#5a7a8e', maxWidth: '500px', margin: '0 auto 44px', lineHeight: 1.8 }}>
          Up to 12% of adults have dysfunctional breathing — and most don't know it. It silently drives anxiety, poor sleep, chronic fatigue, and more.
        </p>

        {/* Goal selector */}
        <div style={{ maxWidth: '620px', margin: '0 auto 48px' }}>
          <p style={{ fontSize: '13px', color: '#4e6e82', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '18px' }}>What brings you here?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setTab(g.id)} className="card"
                style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px 20px' }}>
                <span style={{ fontSize: '26px', flexShrink: 0, marginTop: '2px' }}>{g.icon}</span>
                <div>
                  <div style={{ fontWeight: 500, color: '#c8dde8', fontSize: '15px', marginBottom: '4px' }}>{g.label}</div>
                  <div style={{ fontSize: '12px', color: '#5a7a8e', lineHeight: 1.5 }}>{g.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setTab('assess')}>Take the assessment →</button>
          <button className="btn-ghost"   onClick={() => setTab('science')}>The science</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '48px' }}>
        {[
          { stat: '12%',    sub: 'of adults affected' },
          { stat: '4',      sub: 'body systems impacted' },
          { stat: '60s',    sub: 'to measurable effect' },
          { stat: '7+',     sub: 'symptom types linked' },
        ].map(s => (
          <div key={s.stat} className="card" style={{ textAlign: 'center', padding: '22px 16px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '46px', fontWeight: 300, color: '#5ecfca', lineHeight: 1 }}>{s.stat}</div>
            <div style={{ fontSize: '12px', color: '#5a7a8e', marginTop: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, marginBottom: '14px', color: '#c8dde8' }}>Why breathing affects everything</h2>
        <p style={{ color: '#7a9cb8', lineHeight: 1.85, marginBottom: '12px' }}>Because breathing is the only autonomic function under voluntary control, it acts as a direct interface with systems that are normally beyond your reach — your heart rate, blood chemistry, cortisol output, and lymphatic circulation.</p>
        <p style={{ color: '#7a9cb8', lineHeight: 1.85, marginBottom: '16px' }}>Dysfunctional patterns — chronic over-breathing, chest breathing, mouth breathing — silently dysregulate all of these systems. The damage accumulates over years before most people notice it.</p>
        <button onClick={() => setTab('science')} style={{ fontSize: '13px', color: '#5ecfca', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Explore the full science →</button>
      </div>

      <div className="card" style={{ borderColor: 'rgba(196,168,240,0.25)', background: 'rgba(196,168,240,0.04)' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#c4a8f0', marginBottom: '10px' }}>The CO₂ sensitivity factor</h3>
        <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>
          When dysfunctional patterns develop, the brain's CO₂ sensors reset and become oversensitised — meaning even <em>normal</em> levels of carbon dioxide trigger a signal to breathe faster. This is why the cycle is self-perpetuating and why simply "trying to breathe normally" isn't enough.
        </p>
      </div>

      {/* Progress panel — only shown after first session */}
      {history.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#c8dde8', marginBottom: '18px' }}>Your progress</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            {[
              { val: streak,        unit: streak === 1 ? 'day' : 'days',    label: 'Current streak', color: '#f0bc4e' },
              { val: totalSessions, unit: totalSessions === 1 ? 'session':'sessions', label: 'Practice sessions', color: '#5ecfca' },
              { val: totalMinutes,  unit: 'minutes',                         label: 'Total practice time', color: '#c4a8f0' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '18px 12px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: s.color + '99', marginTop: '2px' }}>{s.unit}</div>
                <div style={{ fontSize: '11px', color: '#4e6e82', marginTop: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Last scan result */}
          {lastScan && (
            <div className="card" style={{ borderColor: 'rgba(94,207,202,0.15)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#4e6e82', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Last scan result</p>
                  <p style={{ fontWeight: 500, color: lastScan.patternLabel || '#5ecfca', fontSize: '15px', marginBottom: '4px' }}>
                    {lastScan.pattern || 'Scan complete'}
                  </p>
                  {lastScan.rate && <p style={{ fontSize: '13px', color: '#5a7a8e' }}>{lastScan.rate} breaths/min · {new Date(lastScan.ts).toLocaleDateString()}</p>}
                </div>
                <button className="btn-ghost" onClick={() => setTab('scan')} style={{ fontSize: '12px', padding: '8px 18px' }}>Rescan →</button>
              </div>
            </div>
          )}

          {/* Recent sessions */}
          {history.filter(h => h.type === 'session').length > 0 && (
            <div className="card" style={{ marginTop: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', color: '#4e6e82', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Recent sessions</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {history.filter(h => h.type === 'session').slice(0, 4).map((h, i) => {
                  const modeColors = { breathe: '#5ecfca', meditate: '#f0bc4e', anxiety: '#c4a8f0', sleep: '#9b8de8' };
                  const modeLabels = { breathe: 'Guided Breathing', meditate: 'Meditation', anxiety: 'Anxiety SOS', sleep: 'Sleep Mode' };
                  const col = modeColors[h.mode] || '#5ecfca';
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: col }}>{modeLabels[h.mode] || h.mode}</span>
                      <span style={{ fontSize: '12px', color: '#4e6e82' }}>{Math.round(h.seconds/60)} min · {new Date(h.ts).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ASSESS ────────────────────────────────────────────────────────────────

function AssessTab({ setTab }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult]   = useState(null);

  const answer = (yes) => {
    const next = [...answers, yes];
    if (step < QUIZ.length - 1) { setAnswers(next); setStep(s => s + 1); }
    else { setAnswers(next); setResult(getResult(next.filter(Boolean).length)); }
  };
  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  if (result) {
    const flagged = QUIZ.filter((_, i) => answers[i]).map(q => q.symptom);
    const rec = flagged.length > 0 ? getRecommendation(flagged) : null;

    // Map flagged symptoms to systems for display
    const systemHits = {};
    flagged.forEach(s => {
      const sys = SYMPTOM_SYSTEM_MAP[s];
      if (sys) systemHits[sys] = (systemHits[sys] || 0) + 1;
    });
    const affectedSystems = SCIENCE_SYSTEMS.filter(s => systemHits[s.id]);

    return (
      <div className="tab-enter">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '36px', color: '#c8dde8' }}>Your assessment</h2>

          {/* Score card */}
          <div className="card" style={{ textAlign: 'center', borderColor: result.color + '44', marginBottom: '20px', padding: '36px 28px' }}>
            <div style={{ width: '82px', height: '82px', borderRadius: '50%', background: result.color + '18', border: `2px solid ${result.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', color: result.color, fontWeight: 300, lineHeight: 1 }}>{answers.filter(Boolean).length}</div>
              <div style={{ fontSize: '10px', color: result.color, letterSpacing: '0.08em', opacity: 0.7 }}>/ 10</div>
            </div>
            <div style={{ fontSize: '11px', color: result.color, letterSpacing: '0.1em', marginBottom: '10px', textTransform: 'uppercase' }}>{result.label}</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: result.color, marginBottom: '14px' }}>{result.title}</h3>
            <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>{result.desc}</p>
          </div>

          {/* Affected body systems */}
          {affectedSystems.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#5a7a8e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px' }}>Body systems affected by your pattern</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {affectedSystems.map(sys => (
                  <div key={sys.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '10px', background: sys.color + '0a', border: `1px solid ${sys.color}22` }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>{sys.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: sys.color, fontSize: '14px', marginBottom: '2px' }}>{sys.title}</div>
                      <div style={{ fontSize: '12px', color: '#5a7a8e', lineHeight: 1.5 }}>{sys.subtitle} · {systemHits[sys.id]} indicator{systemHits[sys.id] > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flagged symptoms */}
          {flagged.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#5a7a8e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Symptoms you flagged</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {flagged.map(s => <span key={s} style={{ padding: '5px 13px', borderRadius: '20px', background: 'rgba(94,207,202,0.1)', border: '1px solid rgba(94,207,202,0.22)', fontSize: '13px', color: '#5ecfca' }}>{s}</span>)}
              </div>
            </div>
          )}

          {/* Personalised recommendation */}
          {rec && (
            <div className="card" style={{ marginBottom: '28px', borderColor: rec.color + '44', background: rec.color + '07' }}>
              <p style={{ fontSize: '11px', color: rec.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Recommended for you</p>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: rec.color, marginBottom: '8px' }}>{rec.label}</h4>
              <p style={{ color: '#7a9cb8', fontSize: '14px', lineHeight: 1.75, marginBottom: '16px' }}>{rec.reason}</p>
              <button className="btn-primary" onClick={() => setTab(rec.id)} style={{ background: rec.color, fontSize: '13px', padding: '10px 28px' }}>
                Go to {rec.label} →
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn-ghost" onClick={reset}>Retake assessment</button>
            <button className="btn-ghost" onClick={() => setTab('science')}>Read the science</button>
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
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '44px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #5ecfca, #7ce0dc)', borderRadius: '3px', transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)' }} />
        </div>
        <div className="card" style={{ marginBottom: '22px', padding: '32px 28px' }}>
          <p style={{ fontSize: '11px', color: '#5ecfca', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>{q.symptom}</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#dde6f0', lineHeight: 1.65, fontWeight: 400 }}>{q.q}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="quiz-opt" onClick={() => answer(true)} style={{ borderColor: 'rgba(94,207,202,0.22)', color: '#c8dde8', textAlign: 'center', padding: '18px' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>✓</div><div style={{ fontWeight: 500 }}>Yes, often</div>
          </button>
          <button className="quiz-opt" onClick={() => answer(false)} style={{ textAlign: 'center', padding: '18px' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px', opacity: 0.5 }}>✗</div><div style={{ fontWeight: 500 }}>No / rarely</div>
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── LIVE SCAN (iOS fixed) ─────────────────────────────────────────────────

function ScanTab({ logScan }) {
  const { status, request } = useMotionPermission();
  const [scanPhase, setScanPhase] = useState('intro'); // intro | belly | chest | done
  const [bellyResult, setBellyResult] = useState(null);
  const [chestResult, setChestResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const SCAN_DURATION = 20; // seconds per scan

  const scanning = (scanPhase === 'belly' || scanPhase === 'chest') && status === 'granted';
  const { rate, amplitude, noSensor, waveRef } = useBreathDetection(scanning);
  const { speak, enabled: voiceOn, setEnabled: setVoiceOn, available: voiceAvail } = useSpeechGuide();

  // Announce phase changes for eyes-free use
  useEffect(() => {
    if (scanPhase === 'belly') speak('Belly scan starting. Place your phone face-down on your belly, just below your ribcage. Lie still and breathe normally.');
    if (scanPhase === 'chest')  speak('Belly scan complete. Now move the phone to the centre of your chest, face-down. Stay still and breathe normally.');
    if (scanPhase === 'done')   speak('Scan complete. Your results are ready.');
  }, [scanPhase, speak]);

  // Timer for scan phases
  useEffect(() => {
    if (!scanning) return;
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e >= SCAN_DURATION - 1) {
          clearInterval(interval);
          // Save result and move to next phase
          const result = { rate, amplitude };
          if (scanPhase === 'belly') {
            setBellyResult(result);
            setScanPhase('chest');
          } else {
            setChestResult(result);
            setScanPhase('done');
          }
          return SCAN_DURATION;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [scanning, scanPhase]);

  const startScan = async () => {
    if (status === 'idle') {
      const ok = await request();
      if (ok) setScanPhase('belly');
    } else if (status === 'granted') {
      setScanPhase('belly');
    }
  };

  // Log scan result once when scan completes
  const loggedRef = useRef(false);
  useEffect(() => {
    if (scanPhase !== 'done' || !bellyResult || !chestResult || loggedRef.current) return;
    loggedRef.current = true;
    const bellyAmp = bellyResult.amplitude ?? 0;
    const chestAmp = chestResult.amplitude ?? 0;
    const avg = [bellyResult.rate, chestResult.rate].filter(Boolean);
    const finalRate = avg.length ? Math.round(avg.reduce((a,b)=>a+b)/avg.length) : null;
    const pattern = chestAmp > bellyAmp * 1.15 ? 'Chest breathing detected'
      : bellyAmp > chestAmp * 1.15 ? 'Good diaphragmatic breathing'
      : 'Mixed pattern';
    logScan?.({ pattern, rate: finalRate });
  }, [scanPhase, bellyResult, chestResult, logScan]);

  const reset = () => { setScanPhase('intro'); setBellyResult(null); setChestResult(null); setElapsed(0); loggedRef.current = false; };

  const progress = SCAN_DURATION > 0 ? (elapsed / SCAN_DURATION) * 100 : 0;

  if (scanPhase === 'done' && bellyResult && chestResult) {
    const bellyAmp = bellyResult.amplitude ?? 0;
    const chestAmp = chestResult.amplitude ?? 0;
    const avgRate = [bellyResult.rate, chestResult.rate].filter(Boolean);
    const finalRate = avgRate.length ? Math.round(avgRate.reduce((a,b) => a+b) / avgRate.length) : null;
    const isChestBreather = chestAmp > bellyAmp * 1.15;
    const isBellyBreather = bellyAmp > chestAmp * 1.15;

    const rateLabel = !finalRate ? null : finalRate < 9 ? { text: 'Excellent — very calm', color: '#5ecfca' }
      : finalRate < 14 ? { text: 'Normal range', color: '#f0bc4e' }
      : { text: 'Elevated — try slowing down', color: '#e07b6c' };

    const patternLabel = isChestBreather
      ? { text: 'Chest breathing detected', detail: 'Your chest moved more than your belly — a common dysfunctional pattern. The diaphragm is under-recruiting.', color: '#e07b6c' }
      : isBellyBreather
      ? { text: 'Good diaphragmatic breathing', detail: 'Your belly moved more than your chest — your diaphragm is doing the work. This is correct breathing.', color: '#5ecfca' }
      : { text: 'Mixed pattern', detail: 'Your chest and belly moved roughly equally. Ideally, the belly should lead on each inhale.', color: '#f0bc4e' };

    return (
      <div className="tab-enter">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '8px', color: '#c8dde8' }}>Scan Complete</h2>
          <p style={{ textAlign: 'center', color: '#4e6e82', marginBottom: '36px', fontSize: '14px' }}>Your live breathing analysis</p>

          <div className="card" style={{ borderColor: patternLabel.color + '44', background: patternLabel.color + '08', marginBottom: '16px', padding: '28px' }}>
            <div style={{ fontSize: '11px', color: patternLabel.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Breathing pattern</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: patternLabel.color, marginBottom: '12px' }}>{patternLabel.text}</h3>
            <p style={{ color: '#7a9cb8', lineHeight: 1.8, fontSize: '14px' }}>{patternLabel.detail}</p>
          </div>

          {rateLabel && (
            <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '52px', color: rateLabel.color, lineHeight: 1, flexShrink: 0 }}>{finalRate}</div>
              <div>
                <div style={{ fontSize: '11px', color: '#5a7a8e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Breaths per minute</div>
                <div style={{ color: rateLabel.color, fontWeight: 500, fontSize: '15px' }}>{rateLabel.text}</div>
                <div style={{ color: '#4e6e82', fontSize: '13px', marginTop: '4px' }}>Healthy resting range: 8–14 BPM</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Belly movement', val: Math.round(bellyAmp * 100) + '%' },
              { label: 'Chest movement', val: Math.round(chestAmp * 100) + '%' },
            ].map(r => (
              <div key={r.label} className="card" style={{ textAlign: 'center', padding: '18px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', color: '#c8dde8', marginBottom: '6px' }}>{r.val}</div>
                <div style={{ fontSize: '12px', color: '#5a7a8e' }}>{r.label}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}><button className="btn-ghost" onClick={reset}>Scan again</button></div>
        </div>
      </div>
    );
  }

  if (scanPhase === 'intro') {
    return (
      <div className="tab-enter">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '10px', color: '#c8dde8' }}>Live Breathing Scan</h2>
          <p style={{ textAlign: 'center', color: '#5a7a8e', marginBottom: '28px', lineHeight: 1.8 }}>Your phone's motion sensor detects chest and belly movement to analyse your breathing pattern in real time.</p>

          {/* Voice guidance toggle */}
          {voiceAvail && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
              <button
                onClick={() => setVoiceOn(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                  borderRadius: '20px', border: `1px solid ${voiceOn ? 'rgba(94,207,202,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: voiceOn ? 'rgba(94,207,202,0.1)' : 'rgba(255,255,255,0.03)',
                  color: voiceOn ? '#5ecfca' : '#4e6e82', fontSize: '14px', cursor: 'pointer',
                }}>
                <span style={{ fontSize: '18px' }}>{voiceOn ? '🔊' : '🔇'}</span>
                <span>{voiceOn ? 'Voice guidance on — phone placement instructions will be spoken' : 'Enable voice guidance for eyes-free use'}</span>
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gap: '12px', marginBottom: '36px' }}>
            {[
              { n: '1', title: 'Belly scan (20s)', desc: 'Lie down. Place your phone face-down on your belly, just below your ribcage. Breathe naturally and stay still.' },
              { n: '2', title: 'Chest scan (20s)', desc: 'Move your phone face-down to the centre of your chest. Same natural breathing — don\'t try to adjust it.' },
              { n: '3', title: 'Instant analysis', desc: 'The app compares both readings and tells you your breathing rate and pattern.' },
            ].map(s => (
              <div key={s.n} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(94,207,202,0.1)', border: '1px solid rgba(94,207,202,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5ecfca', fontSize: '13px', fontWeight: 600 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 500, color: '#c8dde8', marginBottom: '4px' }}>{s.title}</div>
                  <div style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {status === 'denied' && (
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(224,123,108,0.25)', background: 'rgba(224,123,108,0.05)', marginBottom: '20px' }}>
              <p style={{ color: '#e07b6c', fontSize: '14px', lineHeight: 1.7 }}>
                <strong>Permission denied.</strong> On iOS: Settings → Safari → Motion & Orientation Access. On iOS 16+: tap the site settings icon in Safari's address bar.
              </p>
            </div>
          )}

          {status === 'unavailable' && (
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(240,188,78,0.25)', background: 'rgba(240,188,78,0.04)', marginBottom: '20px' }}>
              <p style={{ color: '#f0bc4e', fontSize: '14px', lineHeight: 1.7 }}>No motion sensor found on this device. This feature requires a smartphone. Try the manual Breathing Check instead.</p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            {status === 'requesting'
              ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#5a7a8e' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(94,207,202,0.3)', borderTopColor: '#5ecfca', animation: 'spin 0.8s linear infinite' }} />
                  Requesting permission…
                </div>
              : <button className="btn-primary" onClick={startScan}>
                  {status === 'denied' || status === 'unavailable' ? 'Try again' : 'Begin scan'}
                </button>
            }
          </div>
        </div>
      </div>
    );
  }

  // Belly or chest scanning
  const isChestPhase = scanPhase === 'chest';
  const instruction = isChestPhase
    ? 'Place phone on your chest — upper sternum. Breathe naturally.'
    : 'Place phone on your belly, below your ribcage. Breathe naturally.';

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e07b6c', animation: 'scanBlink 1s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#5a7a8e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {isChestPhase ? 'Chest scan' : 'Belly scan'} · Live
          </span>
        </div>

        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#c8dde8', marginBottom: '10px', fontWeight: 400 }}>{instruction}</h3>
        <p style={{ color: '#4e6e82', fontSize: '14px', marginBottom: '24px' }}>Breathe normally. Don't try to change your pattern.</p>

        {/* Progress */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #5ecfca, #7ce0dc)', borderRadius: '3px', transition: 'width 1s linear' }} />
        </div>

        {/* Waveform canvas */}
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          {noSensor
            ? <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#3e5e72', fontSize: '13px', textAlign: 'center' }}>No motion events received yet.<br />Ensure phone is lying flat on your body.</p>
              </div>
            : <BreathCanvas waveRef={waveRef} height={90} />
          }
        </div>

        {/* Rate + phase */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <RateBadge rate={rate} />
          {rate === null && !noSensor && (
            <span style={{ fontSize: '13px', color: '#3e5e72' }}>Calibrating… hold still for a moment</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#5a7a8e' }}>
            {SCAN_DURATION - elapsed}s remaining
          </span>
          {!isChestPhase && (
            <span style={{ fontSize: '13px', color: '#3e5e72' }}>Next: chest scan →</span>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── BREATHE (existing, enhanced) ─────────────────────────────────────────

const GUIDED_PHASES = [
  { name: 'in',   label: 'Breathe in…',        ms: 4000, next: 'hold' },
  { name: 'hold', label: 'Hold gently',         ms: 2000, next: 'out'  },
  { name: 'out',  label: 'Breathe out slowly…', ms: 6000, next: 'rest' },
  { name: 'rest', label: '',                    ms: 1200, next: 'in'   },
];

function BreatheTab({ logSession }) {
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const sessionStartRef = useRef(null);
  const { phaseName, phaseLabel, rounds } = usePhaseTimer(GUIDED_PHASES, running);
  const { bell, wakeAudio: wakeSound } = useSoundEngine('breathe', soundOn && running);
  const { speak, cancel, enabled: voiceOn, setEnabled: setVoiceOn, available: voiceAvail } = useSpeechGuide();

  // Speak phase changes + ring bell
  const prevPhaseRef = useRef('');
  useEffect(() => {
    if (!running || !phaseLabel) return;
    if (phaseLabel === prevPhaseRef.current) return;
    prevPhaseRef.current = phaseLabel;
    if (soundOn) bell();
    speak(phaseLabel);
  }, [phaseLabel, running, soundOn, bell, speak]);

  const handleStart = () => {
    prevPhaseRef.current = '';
    sessionStartRef.current = Date.now();
    setRunning(true);
    speak('Starting guided breathing. Follow the orb.');
  };
  const handleStop = () => {
    setRunning(false);
    cancel();
    if (sessionStartRef.current) {
      logSession?.('breathe', Math.round((Date.now() - sessionStartRef.current) / 1000));
      sessionStartRef.current = null;
    }
  };

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, marginBottom: '10px', color: '#c8dde8' }}>Guided Breathing</h2>
        <p style={{ color: '#5a7a8e', marginBottom: '32px', lineHeight: 1.85, fontSize: '15px', maxWidth: '440px', margin: '0 auto 32px' }}>
          Follow the orb. Don't count seconds — just breathe with it. Let your mind wander to something calm or joyful. That's not a distraction; that's the technique.
        </p>

        {/* Phone placement tip */}
        <div className="card" style={{ marginBottom: '28px', padding: '14px 18px', borderColor: 'rgba(94,207,202,0.15)', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '22px', flexShrink: 0 }}>📱</span>
          <div>
            <p style={{ fontSize: '13px', color: '#7ab8e8', fontWeight: 500, marginBottom: '4px' }}>Phone in pocket or face-down?</p>
            <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.7 }}>
              Enable <strong style={{ color: '#5ecfca' }}>Voice guidance</strong> below and you can breathe freely — the app will speak each phase aloud so you don't need to watch the screen.
            </p>
          </div>
        </div>

        {/* Audio controls */}
        {(voiceAvail) && (
          <AudioBar
            voice={voiceOn} sound={soundOn}
            onToggleVoice={() => setVoiceOn(v => !v)}
            onToggleSound={() => setSoundOn(s => !s)} onWakeAudio={wakeSound}
          />
        )}

        <div style={{ height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <BreathOrb phaseName={running ? phaseName : 'idle'} size={160} />
        </div>

        <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          {phaseLabel && <p key={phaseLabel} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontStyle: 'italic', color: '#5ecfca', animation: 'labelFade 6s ease forwards' }}>{phaseLabel}</p>}
        </div>

        <div style={{ height: '24px', marginBottom: '28px' }}>
          {running && rounds > 0 && <p style={{ color: '#3e5e72', fontSize: '13px', letterSpacing: '0.05em' }}>{rounds} breath{rounds !== 1 ? 's' : ''} completed</p>}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '56px' }}>
          {!running
            ? <button className="btn-primary" onClick={handleStart}>Begin</button>
            : <button className="btn-ghost"   onClick={handleStop}>Stop</button>
          }
        </div>

        <div style={{ textAlign: 'left', display: 'grid', gap: '12px' }}>
          {[
            { icon: "🛑", text: "Don't breathe harder when you feel breathless. Gently slow down instead." },
            { icon: "👃", text: "Breathe through your nose if you can. Nasal breathing slows, filters, and humidifies your breath naturally." },
            { icon: "🔢", text: "Avoid counting seconds or monitoring your ratio. Too much attention amplifies anxiety." },
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

// ─── MEDITATION ────────────────────────────────────────────────────────────

function MeditateTab({ logSession }) {
  const [selected, setSelected] = useState(null);
  const [running, setRunning]   = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [done, setDone]         = useState(false);
  const [soundOn, setSoundOn]   = useState(false);
  const prevCueRef = useRef('');

  const med = selected ? MEDITATIONS[selected] : null;
  const soundPreset = selected ? MED_SOUNDSCAPE[selected] : null;
  const { wakeAudio: wakeSound } = useSoundEngine(soundPreset, soundOn && running);
  const { speak, cancel, enabled: voiceOn, setEnabled: setVoiceOn, available: voiceAvail } = useSpeechGuide();

  useEffect(() => {
    if (!running || !med) return;
    setElapsed(0); setDone(false);
    const iv = setInterval(() => {
      setElapsed(e => {
        if (e >= med.duration) { clearInterval(iv); setDone(true); return med.duration; }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running, med]);

  const currentCue = med
    ? (med.cues.filter(([t]) => t <= elapsed).pop()?.[1] ?? '')
    : '';

  // Speak new cues automatically
  useEffect(() => {
    if (!running || !currentCue || currentCue === prevCueRef.current) return;
    prevCueRef.current = currentCue;
    speak(currentCue);
  }, [currentCue, running, speak]);

  const stop = () => {
    if (running && elapsed > 10) logSession?.('meditate', elapsed);
    setRunning(false); setElapsed(0); setDone(false); cancel();
  };

  // Log when naturally complete
  useEffect(() => {
    if (done && med) logSession?.('meditate', med.duration);
  }, [done, med]);

  if (done) {
    return (
      <div className="tab-enter">
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#c8dde8', marginBottom: '14px' }}>Session complete</h2>
          <p style={{ color: '#5a7a8e', lineHeight: 1.8, marginBottom: '36px' }}>
            {med.label} · {Math.round(med.duration / 60)} minutes
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => { setRunning(true); setDone(false); }}>Repeat session</button>
            <button className="btn-ghost"   onClick={() => { setSelected(null); setDone(false); setRunning(false); }}>Choose another</button>
          </div>
        </div>
      </div>
    );
  }

  if (running && med) {
    const remaining = med.duration - elapsed;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const cueChanged = currentCue !== prevCueRef.current;
    if (cueChanged) prevCueRef.current = currentCue;

    return (
      <div className="tab-enter" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        {/* Audio controls */}
        {voiceAvail && (
          <AudioBar voice={voiceOn} sound={soundOn}
            onToggleVoice={() => setVoiceOn(v => !v)}
            onToggleSound={() => setSoundOn(s => !s)} onWakeAudio={wakeSound} />
        )}

        {/* Ambient orb */}
        <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '180px', height: '180px',
            background: `radial-gradient(circle at 42% 38%, ${med.color}cc 0%, ${med.color}44 50%, transparent 100%)`,
            borderRadius: '50%',
            boxShadow: `0 0 100px ${med.color}33`,
            animation: 'meditateOrb 12s ease-in-out infinite',
          }} />
        </div>

        {/* Current cue */}
        <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', padding: '0 20px' }}>
          {currentCue && (
            <p key={currentCue} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontStyle: 'italic', color: '#dde6f0', lineHeight: 1.65, animation: 'cueFade 12s ease forwards' }}>
              {currentCue}
            </p>
          )}
        </div>

        {/* Timer */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#4e6e82' }}>
            {mins}:{secs.toString().padStart(2, '0')} remaining
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '28px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(elapsed / med.duration) * 100}%`, background: `linear-gradient(90deg, ${med.color}88, ${med.color})`, borderRadius: '2px', transition: 'width 1s linear' }} />
        </div>

        <button className="btn-ghost" onClick={stop}>End session</button>
      </div>
    );
  }

  // Session selection
  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '10px', color: '#c8dde8' }}>Guided Meditation</h2>
        <p style={{ textAlign: 'center', color: '#5a7a8e', marginBottom: '44px', lineHeight: 1.8 }}>Timed sessions with researched cues. No app required after you press start.</p>

        <div style={{ display: 'grid', gap: '14px', marginBottom: '40px' }}>
          {Object.values(MEDITATIONS).map(m => (
            <button key={m.id} className="card" onClick={() => { setSelected(m.id); setRunning(true); }}
              style={{ textAlign: 'left', cursor: 'pointer', borderColor: selected === m.id ? m.color + '44' : undefined, display: 'block', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '32px', flexShrink: 0 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontWeight: 500, color: m.color, fontSize: '16px' }}>{m.label}</span>
                    <span style={{ fontSize: '12px', color: '#4e6e82', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.desc}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.7 }}>{m.science}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="card" style={{ borderColor: 'rgba(155,141,232,0.2)', background: 'rgba(155,141,232,0.04)' }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#9b8de8', marginBottom: '10px' }}>What the research says</h4>
          <p style={{ color: '#7a9cb8', fontSize: '14px', lineHeight: 1.8 }}>
            Even brief meditation practice (3–5 minutes) measurably reduces salivary cortisol and activates the prefrontal cortex — the brain region responsible for calm, rational response. Breath-anchored meditation is particularly effective because it provides a concrete physical focus that prevents rumination.
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── ANXIETY SOS ───────────────────────────────────────────────────────────

function AnxietyTab({ logSession }) {
  const [protocolId, setProtocolId] = useState(null);
  const [running, setRunning]       = useState(false);
  const [rounds, setRounds]         = useState(0);
  const [soundOn, setSoundOn]       = useState(false);
  const sessionStartRef             = useRef(null);
  const { status: motionStatus, request: requestMotion } = useMotionPermission();
  const motionActive = running && (motionStatus === 'granted');
  const { rate } = useBreathDetection(motionActive);

  const proto = protocolId ? ANXIETY_PROTOCOLS[protocolId] : null;
  const { phaseName, phaseLabel } = usePhaseTimer(proto ? proto.phases : [], running);
  const { wakeAudio: wakeSound } = useSoundEngine('anxiety', soundOn && running);
  const { speak, cancel, enabled: voiceOn, setEnabled: setVoiceOn, available: voiceAvail } = useSpeechGuide();

  // Speak phase changes
  const prevPhaseRef = useRef('');
  useEffect(() => {
    if (!running || !phaseLabel || phaseLabel === prevPhaseRef.current) return;
    prevPhaseRef.current = phaseLabel;
    speak(phaseLabel);
  }, [phaseLabel, running, speak]);

  // Calm score: if motion available, based on rate. Otherwise, based on rounds.
  const calmScore = motionActive && rate
    ? Math.round(Math.max(0, Math.min(100, ((20 - rate) / 14) * 100)))
    : Math.min(100, rounds * 12);

  const stop = () => {
    if (sessionStartRef.current) {
      logSession?.('anxiety', Math.round((Date.now() - sessionStartRef.current) / 1000));
      sessionStartRef.current = null;
    }
    setRunning(false); setRounds(0); cancel();
  };

  if (running && proto) {
    const calmColor = calmScore >= 60 ? '#5ecfca' : calmScore >= 30 ? '#f0bc4e' : '#e07b6c';
    return (
      <div className="tab-enter" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        {/* Audio controls */}
        {voiceAvail && (
          <AudioBar voice={voiceOn} sound={soundOn}
            onToggleVoice={() => setVoiceOn(v => !v)}
            onToggleSound={() => setSoundOn(s => !s)} onWakeAudio={wakeSound} />
        )}

        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', color: proto.color + 'bb', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{proto.label}</span>
        </div>

        {/* Orb */}
        <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <BreathOrb phaseName={phaseName} color={proto.color} size={150} />
        </div>

        {/* Phase label */}
        <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          {phaseLabel && (
            <p key={phaseLabel} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontStyle: 'italic', color: proto.color, animation: 'labelFade 6s ease forwards' }}>
              {phaseLabel}
            </p>
          )}
        </div>

        {/* Calm score bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#4e6e82', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Calm level</span>
            <span style={{ fontSize: '13px', color: calmColor, fontWeight: 500 }}>
              {calmScore >= 70 ? '✓ Very calm' : calmScore >= 40 ? 'Settling…' : 'Keep going'}
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${calmScore}%`, background: `linear-gradient(90deg, #e07b6c, ${calmColor})`, borderRadius: '6px', transition: 'width 1s ease, background 1.5s ease' }} />
          </div>
        </div>

        {motionStatus === 'granted' && rate && (
          <div style={{ marginBottom: '20px' }}><RateBadge rate={rate} /></div>
        )}

        {motionStatus === 'idle' && (
          <button onClick={requestMotion} style={{ fontSize: '13px', color: '#5a7a8e', marginBottom: '20px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
            Enable live breathing monitor
          </button>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={stop}>Stop</button>
        </div>

        {rounds >= 3 && (
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: proto.color + '0c', border: `1px solid ${proto.color}22`, animation: 'fadeIn 0.5s ease' }}>
            <p style={{ color: proto.color + 'cc', fontSize: '14px', lineHeight: 1.7 }}>
              {rounds} cycles complete. Your physiology is responding. Continue as long as feels right.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Protocol selection
  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ fontSize: '52px', marginBottom: '18px' }}>🛟</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, color: '#c8dde8', marginBottom: '12px' }}>Anxiety SOS</h2>
          <p style={{ color: '#5a7a8e', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
            Three evidence-based techniques for acute anxiety. Each works within 2–4 minutes. Choose by what feels right now.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px', marginBottom: '40px' }}>
          {Object.values(ANXIETY_PROTOCOLS).map(p => (
            <div key={p.id} className="card" style={{ borderColor: protocolId === p.id ? p.color + '55' : undefined, background: protocolId === p.id ? p.color + '08' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
                <span style={{ fontSize: '30px', flexShrink: 0 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: p.color, fontSize: '16px', marginBottom: '4px' }}>{p.label}</div>
                  <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.7 }}>{p.science}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {p.phases.filter(ph => ph.label).map((ph, i) => (
                  <span key={i} style={{ padding: '4px 10px', borderRadius: '12px', background: p.color + '15', fontSize: '12px', color: p.color + 'bb', border: `1px solid ${p.color}25` }}>
                    {ph.label} · {Math.round(ph.ms/1000)}s
                  </span>
                ))}
              </div>
              <div style={{ marginTop: '14px' }}>
                <button className="btn-primary" onClick={() => { setProtocolId(p.id); setRunning(true); setRounds(0); sessionStartRef.current = Date.now(); }}
                  style={{ background: p.color, padding: '10px 28px', fontSize: '13px' }}>
                  Start now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ borderColor: 'rgba(224,123,108,0.2)', background: 'rgba(224,123,108,0.04)' }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#e07b6c', marginBottom: '10px' }}>Important</h4>
          <p style={{ color: '#7a9cb8', fontSize: '14px', lineHeight: 1.8 }}>
            These techniques interrupt the physiological anxiety response, but do not treat the underlying cause. If you experience frequent panic attacks or severe anxiety, please speak with your GP. These exercises are safe to use as an adjunct to professional care.
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── SLEEP MODE ────────────────────────────────────────────────────────────

function SleepTab({ logSession }) {
  const [patternId, setPatternId] = useState(null);
  const [running, setRunning]     = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [dimLevel, setDimLevel]   = useState(0);
  const [soundOn, setSoundOn]     = useState(false);

  const pattern = patternId ? SLEEP_PATTERNS[patternId] : null;
  const { phaseName, phaseLabel, rounds } = usePhaseTimer(pattern ? pattern.phases : [], running);
  const { wakeAudio: wakeSound } = useSoundEngine('sleep', soundOn && running);
  const { speak, cancel, enabled: voiceOn, setEnabled: setVoiceOn, available: voiceAvail } = useSpeechGuide();

  // Speak phase changes (whisper-rate for sleep)
  const prevPhaseRef = useRef('');
  useEffect(() => {
    if (!running || !phaseLabel || phaseLabel === prevPhaseRef.current) return;
    prevPhaseRef.current = phaseLabel;
    speak(phaseLabel);
  }, [phaseLabel, running, speak]);

  // Main timer + progressive dimming
  useEffect(() => {
    if (!running) { setElapsed(0); setDimLevel(0); return; }
    setElapsed(0);
    const DIM_DURATION = 300; // 5 minutes to full dim
    const iv = setInterval(() => {
      setElapsed(e => e + 1);
      setDimLevel(d => Math.min(0.88, d + 0.88 / DIM_DURATION));
    }, 1000);
    return () => clearInterval(iv);
  }, [running]);

  const stop = () => {
    if (elapsed > 10) logSession?.('sleep', elapsed);
    setRunning(false); setDimLevel(0); cancel();
  };
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  if (running && pattern) {
    const screenBrightness = 1 - dimLevel * 0.88; // content opacity fades gently
    return (
      <>
        {/* Progressive black overlay */}
        <div style={{
          position: 'fixed', inset: 0, background: '#000', opacity: dimLevel,
          pointerEvents: 'none', zIndex: 400, transition: 'opacity 1.5s ease',
        }} />

        <div className="tab-enter" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', opacity: Math.max(0.15, screenBrightness) }}>
          {/* Audio controls — fade with screen */}
          {voiceAvail && dimLevel < 0.2 && (
            <AudioBar voice={voiceOn} sound={soundOn}
              onToggleVoice={() => setVoiceOn(v => !v)}
              onToggleSound={() => setSoundOn(s => !s)} onWakeAudio={wakeSound} />
          )}

          {/* Slow orb */}
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <BreathOrb phaseName={phaseName} color={pattern.color} size={200} />
          </div>

          {/* Phase label — very soft */}
          <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            {phaseLabel && (
              <p key={phaseLabel} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontStyle: 'italic', color: pattern.color + 'bb', animation: 'labelFade 10s ease forwards' }}>
                {phaseLabel}
              </p>
            )}
          </div>

          {/* Soft counter */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#2a4050' }}>
              {mins}:{secs.toString().padStart(2, '0')} · {rounds} breath{rounds !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Stop — fades away as screen dims */}
          <button onClick={stop} style={{ fontSize: '13px', color: '#2a4050', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
            End session
          </button>

          {dimLevel < 0.3 && (
            <p style={{ marginTop: '24px', fontSize: '12px', color: '#2a4050', lineHeight: 1.7 }}>
              The screen will dim gradually. You can leave the app open.
            </p>
          )}
        </div>
      </>
    );
  }

  // Pattern selection
  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ fontSize: '52px', marginBottom: '18px' }}>🌙</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, color: '#c8dde8', marginBottom: '12px' }}>Sleep Mode</h2>
          <p style={{ color: '#5a7a8e', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
            Breathing techniques specifically chosen to slow the nervous system and induce sleep. The screen dims progressively — just let yourself drift.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px', marginBottom: '40px' }}>
          {Object.values(SLEEP_PATTERNS).map(p => (
            <div key={p.id} className="card" style={{ borderColor: patternId === p.id ? p.color + '55' : undefined, background: patternId === p.id ? p.color + '06' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
                <span style={{ fontSize: '30px', flexShrink: 0 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: p.color, fontSize: '16px', marginBottom: '4px' }}>{p.label}</div>
                  <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.7 }}>{p.science}</p>
                </div>
              </div>
              {/* Phase breakdown */}
              <div style={{ display: 'flex', gap: '0', marginBottom: '14px', borderRadius: '8px', overflow: 'hidden' }}>
                {p.phases.filter(ph => ph.label).map((ph, i) => {
                  const totalMs = p.phases.filter(ph2 => ph2.label).reduce((a, b) => a + b.ms, 0);
                  const pct = (ph.ms / totalMs) * 100;
                  return (
                    <div key={i} style={{ flex: `0 0 ${pct}%`, padding: '8px 10px', background: p.color + (i % 2 === 0 ? '18' : '10'), textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: p.color + 'bb', marginBottom: '2px' }}>{ph.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: p.color }}>{Math.round(ph.ms/1000)}s</div>
                    </div>
                  );
                })}
              </div>
              <button className="btn-primary" onClick={() => { setPatternId(p.id); setRunning(true); }}
                style={{ background: p.color, padding: '10px 28px', fontSize: '13px' }}>
                Begin
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
          {[
            { icon: '📱', text: 'Keep your phone plugged in and brightness low before starting.' },
            { icon: '🔕', text: 'Put your phone on Do Not Disturb. Notifications break the breathing rhythm.' },
            { icon: '🌡️', text: 'Cooler rooms (16–19°C) assist sleep onset alongside these techniques.' },
          ].map((t, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '14px', padding: '14px 18px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{t.icon}</span>
              <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.7 }}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── CYCLE ─────────────────────────────────────────────────────────────────

function ScienceTab({ setTab }) {
  const [openSystem, setOpenSystem] = useState(null);
  const [openCycle, setOpenCycle]   = useState(null);

  return (
    <div className="tab-enter">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, textAlign: 'center', marginBottom: '10px', color: '#c8dde8' }}>The Science of Breath</h2>
        <p style={{ textAlign: 'center', color: '#5a7a8e', marginBottom: '48px', lineHeight: 1.85, maxWidth: '520px', margin: '0 auto 48px' }}>
          Breathing is the only autonomic function you can consciously control. It acts as a bridge between your mind and your body's internal chemistry — modulating four distinct systems.
        </p>

        {/* 4 system cards */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '48px' }}>
          {SCIENCE_SYSTEMS.map(sys => (
            <div key={sys.id}>
              <button
                onClick={() => setOpenSystem(openSystem === sys.id ? null : sys.id)}
                className="card"
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start',
                  borderColor: openSystem === sys.id ? sys.color + '44' : undefined,
                  background:  openSystem === sys.id ? sys.color + '08' : undefined, transition: 'all 0.2s' }}>
                <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>{sys.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: sys.color, fontSize: '16px', marginBottom: '3px' }}>{sys.title}</div>
                      <div style={{ fontSize: '13px', color: '#5a7a8e' }}>{sys.subtitle}</div>
                    </div>
                    <span style={{ color: '#4e6e82', fontSize: '18px', marginLeft: '12px', flexShrink: 0 }}>{openSystem === sys.id ? '−' : '+'}</span>
                  </div>

                  {openSystem === sys.id && (
                    <div style={{ marginTop: '16px', animation: 'fadeIn 0.25s ease' }}>
                      <p style={{ color: '#7a9cb8', fontSize: '14px', lineHeight: 1.85, marginBottom: '18px', fontStyle: 'italic' }}>{sys.summary}</p>

                      {/* Points */}
                      {sys.points && sys.points.map((pt, i) => (
                        <div key={i} style={{ marginBottom: '14px', paddingLeft: '14px', borderLeft: `2px solid ${sys.color}44` }}>
                          <div style={{ fontWeight: 500, color: '#c8dde8', fontSize: '14px', marginBottom: '4px' }}>{pt.head}</div>
                          <p style={{ color: '#7a9cb8', fontSize: '13px', lineHeight: 1.8 }}>{pt.body}</p>
                        </div>
                      ))}

                      {/* Table for cardio */}
                      {sys.table && (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {sys.table.map((row, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ fontWeight: 500, color: sys.color, fontSize: '13px', lineHeight: 1.5 }}>{row.mech}</div>
                              <div style={{ color: '#7a9cb8', fontSize: '13px', lineHeight: 1.6 }}>{row.effect}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA to relevant mode */}
                      {sys.id === 'nervous' && <button onClick={() => setTab('anxiety')} style={{ marginTop: '14px', fontSize: '12px', color: sys.color, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Try Anxiety SOS →</button>}
                      {sys.id === 'chemistry' && <button onClick={() => setTab('breathe')} style={{ marginTop: '14px', fontSize: '12px', color: sys.color, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Try Guided Breathing →</button>}
                      {sys.id === 'cardio' && <button onClick={() => setTab('breathe')} style={{ marginTop: '14px', fontSize: '12px', color: sys.color, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Try 6 BPM Resonance →</button>}
                      {sys.id === 'mechanical' && <button onClick={() => setTab('meditate')} style={{ marginTop: '14px', fontSize: '12px', color: sys.color, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Try Body Scan Meditation →</button>}
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Key techniques */}
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: '#c8dde8', marginBottom: '8px' }}>Evidence-Based Techniques</h3>
        <p style={{ color: '#5a7a8e', fontSize: '14px', marginBottom: '22px', lineHeight: 1.7 }}>Each technique targets a specific physiological mechanism. Tap to go straight to the exercise.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '48px' }}>
          {TECHNIQUES.map((t, i) => (
            <button key={i} onClick={() => setTab(t.tabId)} className="card"
              style={{ textAlign: 'left', cursor: 'pointer', borderColor: t.color + '22', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 500, color: t.color, fontSize: '14px' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: '#4e6e82', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{t.ratio}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#4e6e82', marginBottom: '8px', letterSpacing: '0.06em' }}>{t.who}</div>
              <p style={{ fontSize: '13px', color: '#7a9cb8', lineHeight: 1.7 }}>{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Dysfunctional Cycle section */}
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: '#c8dde8', marginBottom: '8px' }}>The Dysfunctional Cycle</h3>
        <p style={{ color: '#5a7a8e', fontSize: '14px', marginBottom: '22px', lineHeight: 1.7 }}>Understanding why the pattern is self-perpetuating is the first step to breaking it.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {CYCLE.map((c, i) => (
            <button key={i} onClick={() => setOpenCycle(openCycle === i ? null : i)}
              style={{ padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                background: openCycle === i ? c.color + '10' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${openCycle === i ? c.color + '44' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.22s ease' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: c.color, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{c.label}</div>
            </button>
          ))}
        </div>

        {openCycle !== null && (
          <div className="card" key={openCycle} style={{ borderColor: CYCLE[openCycle].color + '33', background: CYCLE[openCycle].color + '09', animation: 'fadeIn 0.3s ease', marginBottom: '20px' }}>
            <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: CYCLE[openCycle].color, marginBottom: '10px' }}>{CYCLE[openCycle].label.replace('\n', ' ')}</h4>
            <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px' }}>{CYCLE[openCycle].detail}</p>
          </div>
        )}

        <div className="card" style={{ borderColor: 'rgba(94,207,202,0.2)', background: 'rgba(94,207,202,0.04)' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#5ecfca', marginBottom: '12px' }}>Breaking the cycle</h3>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px', marginBottom: '12px' }}>
            The key insight: <strong style={{ color: '#dde6f0' }}>you don't need to breathe harder when you feel breathless.</strong> The urge is natural, but it feeds the loop.
          </p>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, fontSize: '15px', marginBottom: '16px' }}>
            Instead: gently slow your breathing, redirect attention to something pleasant and unrelated, and trust the sensation will pass. The app's guided modes are built on exactly this evidence.
          </p>
          <button className="btn-primary" onClick={() => setTab('assess')} style={{ fontSize: '13px', padding: '10px 28px' }}>Take the assessment →</button>
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
        <p style={{ textAlign: 'center', color: '#5a7a8e', marginBottom: '48px', lineHeight: 1.8 }}>Dysfunctional breathing is common, underdiagnosed, and treatable.</p>

        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#c8dde8', marginBottom: '18px' }}>What it can cause</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '14px', marginBottom: '48px' }}>
          {SYMPTOMS.map((s, i) => (
            <button key={i} onClick={() => setOpen(open === i ? null : i)} className="card" style={{ textAlign: 'left', cursor: 'pointer', width: '100%', display: 'block' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontWeight: 500, color: '#c8dde8', marginBottom: open === i ? '10px' : 0, fontSize: '15px' }}>{s.title}</div>
              {open === i && <p style={{ fontSize: '13px', color: '#5a7a8e', lineHeight: 1.75, animation: 'fadeIn 0.2s ease' }}>{s.desc}</p>}
            </button>
          ))}
        </div>

        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#c8dde8', marginBottom: '16px' }}>How it's treated</h3>
        <div className="card" style={{ marginBottom: '14px' }}>
          <p style={{ color: '#7a9cb8', lineHeight: 1.85, marginBottom: '12px', fontSize: '15px' }}>
            There is no single gold standard treatment. Research confirms the best outcomes come from a <strong style={{ color: '#c8dde8' }}>multidisciplinary approach</strong> — doctors, physiotherapists, speech-language therapists, and psychologists working together.
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

        <div className="card" style={{ borderColor: 'rgba(240,188,78,0.2)', background: 'rgba(240,188,78,0.03)', marginBottom: '20px' }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#f0bc4e', marginBottom: '14px' }}>Who to speak to</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '10px' }}>
            {['GP / primary care', 'Respiratory physiotherapist', 'Pulmonologist', 'Speech & language therapist', 'Psychologist / therapist', 'Respiratory nurse'].map(w => (
              <div key={w} style={{ padding: '10px 14px', background: 'rgba(240,188,78,0.06)', borderRadius: '8px', fontSize: '13px', color: '#b8a060', lineHeight: 1.45 }}>{w}</div>
            ))}
          </div>
        </div>

        <div style={{ padding: '18px 22px', border: '1px solid rgba(224,123,108,0.18)', borderRadius: '12px', background: 'rgba(224,123,108,0.04)' }}>
          <p style={{ fontSize: '13px', color: '#7a5a50', lineHeight: 1.8 }}>
            <strong style={{ color: '#e07b6c' }}>Important:</strong> This app is an educational resource, not a medical diagnosis. If you're experiencing significant breathlessness — especially alongside chest pain or a racing heart — speak to a doctor promptly to rule out cardiac or respiratory conditions.
          </p>
        </div>
      </div>
    </div>
  );
}

