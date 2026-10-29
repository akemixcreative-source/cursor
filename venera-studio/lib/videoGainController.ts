/**
 * Routes a media element through Web Audio so volume works on iOS
 * (where `HTMLMediaElement.volume` is ignored). Falls back to element
 * volume when createMediaElementSource fails (typically CORS).
 */

export type GainBackend = "webaudio" | "element" | "unavailable";

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    webkitAudioContext?: AudioContextCtor;
  };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

export class VideoGainController {
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gain: GainNode | null = null;
  private video: HTMLVideoElement | null = null;
  private backend: GainBackend = "unavailable";
  private wired = false;

  getBackend(): GainBackend {
    return this.backend;
  }

  /**
   * Bind once per video element. Must run after `crossOrigin` is set and
   * ideally before/at first play. Returns the backend in use.
   */
  connect(video: HTMLVideoElement): GainBackend {
    if (this.wired && this.video === video) return this.backend;

    this.disconnectGraph();
    this.video = video;

    const Ctor = getAudioContextCtor();
    if (!Ctor) {
      this.backend = "element";
      this.wired = true;
      return this.backend;
    }

    try {
      this.ctx = this.ctx ?? new Ctor();
      this.source = this.ctx.createMediaElementSource(video);
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0;
      this.source.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      // Element level stays at 1; gain does the real attenuation.
      video.volume = 1;
      this.backend = "webaudio";
      this.wired = true;
      return this.backend;
    } catch {
      this.source = null;
      this.gain = null;
      this.backend = "element";
      this.wired = true;
      return this.backend;
    }
  }

  async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Snap or short-ramp to a level. When `muted`, output is silence.
   * `fadeMs` > 0 linear-ramps (used for play fade-in).
   */
  setOutput(volume: number, muted: boolean, fadeMs = 0): void {
    const level = muted ? 0 : Math.min(1, Math.max(0, volume));
    const video = this.video;

    if (this.backend === "webaudio" && this.ctx && this.gain) {
      const now = this.ctx.currentTime;
      const current = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(current, now);
      if (fadeMs > 0) {
        this.gain.gain.linearRampToValueAtTime(level, now + fadeMs / 1000);
      } else {
        this.gain.gain.setValueAtTime(level, now);
      }
      if (video) {
        video.muted = false;
        video.volume = 1;
      }
      return;
    }

    if (video) {
      // Native path (desktop / failed Web Audio). iOS still ignores volume.
      video.volume = level;
      video.muted = muted || level === 0;
    }
  }

  /** Silence immediately and tear down graph references (keeps element). */
  silence(): void {
    this.setOutput(0, true, 0);
    if (this.video) {
      this.video.muted = true;
      this.video.volume = 1;
    }
  }

  private disconnectGraph(): void {
    try {
      this.source?.disconnect();
    } catch {
      /* already disconnected */
    }
    try {
      this.gain?.disconnect();
    } catch {
      /* already disconnected */
    }
    this.source = null;
    this.gain = null;
    this.wired = false;
    this.backend = "unavailable";
  }

  dispose(): void {
    this.silence();
    this.disconnectGraph();
    this.video = null;
    if (this.ctx) {
      void this.ctx.close().catch(() => {
        /* ignore */
      });
      this.ctx = null;
    }
  }
}
