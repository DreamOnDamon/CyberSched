/* ============================================================
   CyberSchedule_Matrix — Audio Engine (Web Audio API)
   v1.1: added meow SFX for mascot
   ============================================================ */

const AudioEngine = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function play(type) {
    try {
      const c = getCtx();
      const now = c.currentTime;

      switch (type) {
        case 'success': {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.connect(gain);
          gain.connect(c.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.06);
          osc.frequency.setValueAtTime(784, now + 0.12);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }
        case 'laser': {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.connect(gain);
          gain.connect(c.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'levelup': {
          const notes = [523, 659, 784, 1047];
          notes.forEach((freq, i) => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.connect(g);
            g.connect(c.destination);
            o.type = 'square';
            const t = now + i * 0.08;
            o.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            o.start(t);
            o.stop(t + 0.12);
          });
          break;
        }
        case 'meow': {
          // 8-bit cat meow: quick rise + fall with vibrato
          const osc = c.createOscillator();
          const gain = c.createGain();
          const lfo = c.createOscillator();
          const lfoGain = c.createGain();

          lfo.frequency.setValueAtTime(40, now);
          lfoGain.gain.setValueAtTime(80, now);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);

          osc.type = 'square';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.08);
          osc.frequency.linearRampToValueAtTime(350, now + 0.18);
          osc.frequency.linearRampToValueAtTime(200, now + 0.3);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(c.destination);
          lfo.start(now);
          lfo.stop(now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }
        case 'check': {
          // Short bright ping for checkbox toggle
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.connect(gain);
          gain.connect(c.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1100, now + 0.04);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        default: {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.connect(gain);
          gain.connect(c.destination);
          osc.type = 'square';
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        }
      }
    } catch (e) {
      // Audio not available — fail silently
    }
  }

  return { play };
})();
