import { SpeechToTextProvider } from './SpeechToTextProvider';
import { DeepgramSpeechProvider } from './DeepgramSpeechProvider';
import { WebSpeechProvider } from './WebSpeechProvider';
import { requestWakeLock, releaseWakeLock } from '../../lib/wakeLock';

export class AudioOrchestrator {
  private stream: MediaStream | null = null;
  private isRunning = false;
  private provider: SpeechToTextProvider;

  constructor(
    providerType: 'deepgram' | 'webspeech',
    config: { apiKey?: string },
    private onTextCaptured: (text: string) => void
  ) {
    if (providerType === 'deepgram') {
      this.provider = new DeepgramSpeechProvider(config.apiKey || '');
    } else {
      this.provider = new WebSpeechProvider();
    }
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.isRunning = true;
    await requestWakeLock();
    await this.provider.start(this.stream, this.onTextCaptured);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.provider.stop();

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    releaseWakeLock();
  }
}
