// Web Audio API Ambient Sound Synthesizer & Spotify-Grade Generative Music Engine
// Supports 80+ dynamic soundscapes, pop hit arrangements (like BTS Dynamite, Golden Hour, Blinding Lights),
// acoustic instruments, rain, nature, lo-fi, piano, and dynamic live melody generation for any searched title.

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private activeNodes: (AudioNode | number)[] = [];
  private currentSoundType: string | null = null;
  private currentTrackTitle: string | null = null;
  private volume = 0.6;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume() {
    return this.volume;
  }

  public stop() {
    if (this.ctx) {
      this.activeNodes.forEach((node) => {
        if (typeof node === 'number') {
          clearInterval(node);
          clearTimeout(node);
        } else {
          try {
            if ('stop' in node && typeof (node as any).stop === 'function') {
              (node as any).stop();
            }
            node.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
        }
      });
      this.activeNodes = [];
    }
    this.isPlaying = false;
    this.currentSoundType = null;
    this.currentTrackTitle = null;
  }

  public playSound(soundType: string, trackTitle?: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.isPlaying = true;
    this.currentSoundType = soundType;
    this.currentTrackTitle = trackTitle || soundType;

    // Direct routing for specific sound engines
    switch (soundType) {
      // Pop & Global Hits
      case 'pop-groove-dynamite':
        this.createDynamiteGroove();
        break;
      case 'pop-piano-ballad':
        this.createGoldenHourPiano();
        break;
      case 'synthwave-retro':
        this.createBlindingLightsSynth();
        break;
      case 'indie-pop-groove':
        this.createAsItWasGroove();
        break;
      case 'disco-pop':
      case 'disco-funk':
        this.createLevitatingDisco();
        break;
      case 'rnb-chill':
        this.createPeachesRnb();
        break;
      case 'uk-garage-pop':
      case 'acoustic-ballad':
        this.createAcousticGuitarBallad();
        break;
      case 'dream-pop':
      case 'bossa-pop':
      case 'fast-synth-pop':
        this.createDreamPopSynth();
        break;

      // Rain
      case 'rain':
      case 'rain-window':
      case 'rain-leaves':
        this.createRainSound(900, 0.7);
        break;
      case 'rain-thunder':
        this.createRainThunderSound();
        break;
      case 'rain-roof':
      case 'rain-attic':
        this.createRainSound(1400, 0.65);
        break;
      case 'rain-tropical':
      case 'rain-city':
        this.createRainSound(750, 0.8);
        break;

      // Nature
      case 'forest-birds':
      case 'morning-songbirds':
      case 'bamboo-forest':
        this.createForestBirdsSound();
        break;
      case 'ocean-waves':
      case 'waves-pebbles':
        this.createOceanWavesSound(0.5, 500);
        break;
      case 'night-crickets':
        this.createNightCricketsSound();
        break;
      case 'mountain-stream':
      case 'waterfall':
        this.createMountainStreamSound();
        break;
      case 'wind-chimes':
        this.createWindChimesSound();
        break;
      case 'campfire':
      case 'cozy-fireplace':
      case 'woodstove':
        this.createFireplaceSound();
        break;

      // Lo-Fi Beats
      case 'lofi-beats':
      case 'lofi-cafe':
      case 'lofi-study':
      case 'lofi-coffee':
      case 'lofi-tokyo':
      case 'lofi-bedroom':
        this.createLofiBeatsSound();
        break;
      case 'lofi-vinyl':
      case 'vinyl-crackle':
        this.createVinylLofiSound();
        break;

      // Piano
      case 'piano-chords':
      case 'peaceful-piano':
      case 'piano-moonlight':
      case 'piano-river':
      case 'piano-nocturne':
      case 'piano-waltz':
      case 'piano-autumn':
        this.createCalmingPianoSound();
        break;

      // Meditation & Healing
      case 'singing-bowl':
      case 'crystal-bowl':
        this.createSingingBowlSound();
        break;
      case 'binaural-calm':
      case 'delta-sleep':
      case 'chakra-healing':
        this.createBinauralCalmSound();
        break;
      case 'solfeggio-528':
        this.createSolfeggioTone(528);
        break;
      case 'temple-bell':
        this.createTempleBellSound();
        break;

      // Cozy
      case 'antique-clock':
        this.createAntiqueClockSound();
        break;
      case 'cat-purr':
        this.createCatPurrSound();
        break;

      default:
        // Universal dynamic music synthesizer fallback based on song title
        this.createDynamicGenerativeTrack(trackTitle || soundType);
        break;
    }
  }

  // ----------------------------------------------------
  // POP HIT ENGINES (Dynamite, Golden Hour, Blinding Lights, etc.)
  // ----------------------------------------------------

  // BTS - Dynamite: 114 BPM Funky Disco Bass + Brassy Rhodes Chords + Snappy Percussion
  private createDynamiteGroove() {
    if (!this.ctx || !this.masterGain) return;
    const chords = [
      [293.66, 369.99, 440.00, 554.37], // Dmaj7
      [246.94, 293.66, 369.99, 440.00], // Bm7
      [329.63, 392.00, 493.88, 587.33], // Em7
      [220.00, 277.18, 329.63, 440.00], // A7
    ];
    const bassline = [146.83, 123.47, 164.81, 110.00];

    let beat = 0;
    const playDynamiteStep = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const step = beat % 16;
      const chordIdx = Math.floor(beat / 4) % chords.length;

      // Funky walking bass note
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassline[chordIdx] * (step % 4 === 2 ? 1.5 : 1), now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(450, now);

        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.masterGain!);

        bassOsc.start(now);
        bassOsc.stop(now + 0.3);
      }

      // Brassy Funky Chord Stabs on off-beats (1, 3)
      if (step % 2 === 1) {
        const currentChord = chords[chordIdx];
        currentChord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const filter = this.ctx!.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.frequency.exponentialRampToValueAtTime(600, now + 0.2);

          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now);
          osc.stop(now + 0.25);
        });
      }

      // Snappy Hi-Hat / Shaker
      const noise = this.ctx.createOscillator();
      const nGain = this.ctx.createGain();
      noise.type = 'square';
      noise.frequency.setValueAtTime(3200 + Math.random() * 800, now);
      nGain.gain.setValueAtTime(step % 4 === 2 ? 0.04 : 0.02, now);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      noise.connect(nGain);
      nGain.connect(this.masterGain!);
      noise.start(now);
      noise.stop(now + 0.06);

      beat++;
    };

    playDynamiteStep();
    const interval = window.setInterval(playDynamiteStep, 260); // ~115 BPM 16th feel
    this.activeNodes.push(interval);
  }

  // JVKE - Golden Hour: Cascading Arpeggiated Piano Runs with Warm Bass
  private createGoldenHourPiano() {
    if (!this.ctx || !this.masterGain) return;
    const arpeggios = [
      [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5], // C major cascade
      [220.00, 261.63, 329.63, 440.00, 523.25, 659.25, 880.00], // Am cascade
      [174.61, 220.00, 261.63, 349.23, 440.00, 523.25, 698.46], // F major cascade
      [196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 783.99], // G major cascade
    ];

    let step = 0;
    const playArp = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const arpSet = arpeggios[Math.floor(step / 16) % arpeggios.length];
      const noteIdx = step % 8;
      const freq = arpSet[noteIdx % arpSet.length];

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 1.5);
      osc2.stop(now + 1.5);

      step++;
    };

    playArp();
    const interval = window.setInterval(playArp, 160);
    this.activeNodes.push(interval);
  }

  // The Weeknd - Blinding Lights: 80s Synthwave Bass & Lead Arpeggio
  private createBlindingLightsSynth() {
    if (!this.ctx || !this.masterGain) return;
    const leadNotes = [440, 523.25, 659.25, 587.33, 523.25, 440, 392, 440];
    let step = 0;

    const playSynthwave = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;

      // Driving 8th synth bass
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(110, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(500, now);

      bassGain.gain.setValueAtTime(0.14, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(now);
      bassOsc.stop(now + 0.22);

      // Lead Melody
      if (step % 2 === 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadNotes[(step / 2) % leadNotes.length], now);

        leadGain.gain.setValueAtTime(0.08, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        leadOsc.connect(leadGain);
        leadGain.connect(this.masterGain!);

        leadOsc.start(now);
        leadOsc.stop(now + 0.4);
      }

      step++;
    };

    playSynthwave();
    const interval = window.setInterval(playSynthwave, 210);
    this.activeNodes.push(interval);
  }

  // Harry Styles - As It Was: Cheerful Bells & Bouncy Groove
  private createAsItWasGroove() {
    if (!this.ctx || !this.masterGain) return;
    const melody = [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 587.33, 523.25];
    let beat = 0;

    const playAsItWas = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const note = melody[beat % melody.length];

      // Bell Synth
      const bell = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(note, now);
      bGain.gain.setValueAtTime(0.12, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      bell.connect(bGain);
      bGain.connect(this.masterGain!);
      bell.start(now);
      bell.stop(now + 0.7);

      // Warm bass pulse
      if (beat % 2 === 0) {
        const b = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        b.type = 'triangle';
        b.frequency.setValueAtTime(130.81, now);
        bg.gain.setValueAtTime(0.12, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        b.connect(bg);
        bg.connect(this.masterGain!);
        b.start(now);
        b.stop(now + 0.35);
      }

      beat++;
    };

    playAsItWas();
    const interval = window.setInterval(playAsItWas, 250);
    this.activeNodes.push(interval);
  }

  // Dua Lipa - Levitating: Groovy Nu-Disco Funk
  private createLevitatingDisco() {
    if (!this.ctx || !this.masterGain) return;
    const chords = [
      [220, 261.63, 329.63], // Am
      [246.94, 293.66, 369.99], // Bm
      [329.63, 392, 493.88], // Em
      [293.66, 369.99, 440], // D
    ];
    let step = 0;

    const playDisco = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const chord = chords[Math.floor(step / 4) % chords.length];

      // Slap Bass
      const bass = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(step % 2 === 0 ? 110 : 165, now);
      bGain.gain.setValueAtTime(0.14, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      bass.connect(bGain);
      bGain.connect(this.masterGain!);
      bass.start(now);
      bass.stop(now + 0.2);

      // Disco Chord Stab
      if (step % 2 === 1) {
        chord.forEach((freq) => {
          const o = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq * 2, now);
          g.gain.setValueAtTime(0.08, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          o.connect(g);
          g.connect(this.masterGain!);
          o.start(now);
          o.stop(now + 0.18);
        });
      }

      step++;
    };

    playDisco();
    const interval = window.setInterval(playDisco, 240);
    this.activeNodes.push(interval);
  }

  // Justin Bieber - Peaches: Smooth Neo-Soul Rhodes Chords
  private createPeachesRnb() {
    if (!this.ctx || !this.masterGain) return;
    const chords = [
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
      [329.63, 392.0, 493.88, 587.33, 659.25], // Em9
      [220.0, 261.63, 329.63, 392.0, 493.88], // Am9
      [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9
    ];
    let idx = 0;

    const playRnb = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const current = chords[idx % chords.length];
      idx++;

      current.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.09, now + i * 0.05 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + i * 0.05);
        osc.stop(now + 3.5);
      });
    };

    playRnb();
    const interval = window.setInterval(playRnb, 3200);
    this.activeNodes.push(interval);
  }

  // Acoustic Guitar Fingerpicking Ballad (One Direction / Jungkook Seven)
  private createAcousticGuitarBallad() {
    if (!this.ctx || !this.masterGain) return;
    const pattern = [196, 261.63, 329.63, 392, 329.63, 261.63, 196, 261.63];
    let step = 0;

    const pluck = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const freq = pattern[step % pattern.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.9);

      step++;
    };

    pluck();
    const interval = window.setInterval(pluck, 280);
    this.activeNodes.push(interval);
  }

  // Dream Pop / Bossa Pop
  private createDreamPopSynth() {
    if (!this.ctx || !this.masterGain) return;
    const chords = [
      [349.23, 440, 523.25, 659.25], // Fmaj7
      [392, 493.88, 587.33, 698.46], // G7
      [329.63, 392, 493.88, 587.33], // Em7
      [220, 261.63, 329.63, 392], // Am7
    ];
    let idx = 0;

    const playDream = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const chord = chords[idx % chords.length];
      idx++;

      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 2.6);
      });
    };

    playDream();
    const interval = window.setInterval(playDream, 2400);
    this.activeNodes.push(interval);
  }

  // ----------------------------------------------------
  // RAIN & NATURE ENGINES
  // ----------------------------------------------------

  private createRainSound(cutoff = 900, vol = 0.7) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(vol, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  private createRainThunderSound() {
    this.createRainSound(800, 0.7);
    if (!this.ctx || !this.masterGain) return;

    const thunder = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 5.0);
    };

    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) thunder();
    }, 12000);
    this.activeNodes.push(interval);
  }

  private createForestBirdsSound() {
    if (!this.ctx || !this.masterGain) return;
    this.createOceanWavesSound(0.2, 350);

    const chirp = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startFreq = 2200 + Math.random() * 800;
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 500, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(startFreq - 200, now + 0.18);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.25);
    };

    chirp();
    const interval = window.setInterval(() => {
      if (Math.random() > 0.3) chirp();
    }, 2200);
    this.activeNodes.push(interval);
  }

  private createOceanWavesSound(vol = 0.5, cutoff = 500) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(vol * 0.4, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(vol * 0.3, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    brownNoise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    brownNoise.start();
    lfo.start();

    this.activeNodes.push(brownNoise, lfo, filter, waveGain, lfoGain);
  }

  private createMountainStreamSound() {
    this.createRainSound(1600, 0.45);
    this.createOceanWavesSound(0.2, 400);
  }

  private createWindChimesSound() {
    if (!this.ctx || !this.masterGain) return;
    this.createOceanWavesSound(0.15, 300);
    const notes = [1046.5, 1174.66, 1318.51, 1567.98, 1760];

    const chime = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const freq = notes[Math.floor(Math.random() * notes.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 2.3);
    };

    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) chime();
    }, 1800);
    this.activeNodes.push(interval);
  }

  // ----------------------------------------------------
  // LOFI & PIANO ENGINES
  // ----------------------------------------------------

  private createLofiBeatsSound() {
    if (!this.ctx || !this.masterGain) return;
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx!.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, this.ctx!.currentTime);

        const now = this.ctx!.currentTime + i * 0.04;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChord();
    const interval = window.setInterval(playChord, 3800);
    this.activeNodes.push(interval);
  }

  private createVinylLofiSound() {
    this.createFireplaceSound();
    this.createLofiBeatsSound();
  }

  private createCalmingPianoSound() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

    const playRandomNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 3.5);
      osc2.stop(now + 3.5);
    };

    playRandomNote();
    const interval = window.setInterval(playRandomNote, 1600);
    this.activeNodes.push(interval);
  }

  // ----------------------------------------------------
  // MEDITATION & SOUND HEALING ENGINES
  // ----------------------------------------------------

  private createSingingBowlSound() {
    if (!this.ctx || !this.masterGain) return;
    const fundamental = 216;
    const harmonics = [1, 2.76, 5.4, 8.1];

    const strikeBowl = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      harmonics.forEach((ratio, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * ratio, this.ctx!.currentTime);

        const now = this.ctx!.currentTime;
        const peak = 0.15 / (i + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 7.5);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 8.0);
      });
    };

    strikeBowl();
    const interval = window.setInterval(strikeBowl, 8500);
    this.activeNodes.push(interval);
  }

  private createBinauralCalmSound() {
    if (!this.ctx || !this.masterGain) return;
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);
    const gain = this.ctx.createGain();

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, this.ctx.currentTime);
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(222, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(this.masterGain);

    oscL.start();
    oscR.start();

    this.activeNodes.push(oscL, oscR, merger, gain);
  }

  private createSolfeggioTone(frequency: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.activeNodes.push(osc, gain);
  }

  private createTempleBellSound() {
    this.createSingingBowlSound();
  }

  // ----------------------------------------------------
  // COZY ENGINES
  // ----------------------------------------------------

  private createFireplaceSound() {
    if (!this.ctx || !this.masterGain) return;
    this.createOceanWavesSound(0.25, 200);

    const crackle = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(80 + Math.random() * 400, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    };

    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) crackle();
    }, 180);
    this.activeNodes.push(interval);
  }

  private createNightCricketsSound() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(4500, this.ctx.currentTime);

    lfo.type = 'square';
    lfo.frequency.setValueAtTime(4.5, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    lfo.connect(gain.gain);
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    lfo.start();

    this.activeNodes.push(osc, lfo, gain, lfoGain);
  }

  private createAntiqueClockSound() {
    if (!this.ctx || !this.masterGain) return;
    let tick = true;
    const playTick = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tick ? 800 : 600, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.05);
      tick = !tick;
    };

    const interval = window.setInterval(playTick, 1000);
    this.activeNodes.push(interval);
  }

  private createCatPurrSound() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(45, this.ctx.currentTime);
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(25, this.ctx.currentTime); // 25Hz purr rattle

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    lfo.start();

    this.activeNodes.push(osc, lfo, gain, lfoGain);
  }

  // ----------------------------------------------------
  // DYNAMIC GENERATIVE TRACK FALLBACK
  // Creates unique, musical chord progressions and rhythms for any custom searched title!
  // ----------------------------------------------------
  private createDynamicGenerativeTrack(title: string) {
    if (!this.ctx || !this.masterGain) return;
    // Derive musical seeds from title string
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const baseNotes = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
    const root1 = baseNotes[seed % baseNotes.length];
    const root2 = baseNotes[(seed + 3) % baseNotes.length];
    const root3 = baseNotes[(seed + 5) % baseNotes.length];
    const root4 = baseNotes[(seed + 7) % baseNotes.length];

    const chordProgression = [
      [root1, root1 * 1.25, root1 * 1.5, root1 * 1.875],
      [root2, root2 * 1.2, root2 * 1.5, root2 * 1.8],
      [root3, root3 * 1.25, root3 * 1.5, root3 * 1.875],
      [root4, root4 * 1.2, root4 * 1.5, root4 * 1.75],
    ];

    let step = 0;
    const playGenerative = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const chord = chordProgression[Math.floor(step / 4) % chordProgression.length];

      // Bass pulse
      const bass = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(chord[0] / 2, now);
      bGain.gain.setValueAtTime(0.12, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      bass.connect(bGain);
      bGain.connect(this.masterGain!);
      bass.start(now);
      bass.stop(now + 0.45);

      // Melodic note
      const noteFreq = chord[step % chord.length];
      const melody = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      melody.type = 'sine';
      melody.frequency.setValueAtTime(noteFreq, now);
      mGain.gain.setValueAtTime(0.09, now);
      mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      melody.connect(mGain);
      mGain.connect(this.masterGain!);
      melody.start(now);
      melody.stop(now + 0.65);

      step++;
    };

    playGenerative();
    const interval = window.setInterval(playGenerative, 300);
    this.activeNodes.push(interval);
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentSoundType() {
    return this.currentSoundType;
  }

  public getCurrentTrackTitle() {
    return this.currentTrackTitle;
  }
}

export const ambientAudio = new AmbientAudioEngine();
