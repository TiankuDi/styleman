export class VoiceNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setListener(listener: (speaking: boolean) => void) {
    this.onStateChange = listener;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;

      const voices = this.synth.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (options.voiceName) {
        selectedVoice = voices.find((v) => v.name === options.voiceName);
      }

      if (!selectedVoice) {
        // Prefer Chinese voices (zh-TW, zh-HK, zh-CN)
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith('zh-TW') ||
            v.lang.startsWith('zh-HK') ||
            v.lang.startsWith('zh') ||
            v.lang.includes('cmn')
        ) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.onStateChange?.(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isSpeaking = true;
      this.onStateChange?.(true);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const narrator = new VoiceNarrator();
