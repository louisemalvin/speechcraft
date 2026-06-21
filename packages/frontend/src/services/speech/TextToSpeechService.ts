export class TextToSpeechService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private enabled: boolean = false;

  public setEnabled(status: boolean): void {
    this.enabled = status;
    if (!status && this.synth) {
      this.synth.cancel();
    }
  }

  public speak(text: string): void {
    if (!this.synth || !this.enabled) {
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;

    const voices = this.synth.getVoices();
    const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));

    const preferredVoice = englishVoices.find((v) => {
      const name = v.name;
      return (
        name.includes('Natural') ||
        name.includes('Google') ||
        name.includes('Siri') ||
        name.toLowerCase().includes('natural') ||
        name.toLowerCase().includes('google') ||
        name.toLowerCase().includes('siri')
      );
    });

    const voiceToUse = preferredVoice || englishVoices[0] || null;
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    this.synth.speak(utterance);
  }
}
