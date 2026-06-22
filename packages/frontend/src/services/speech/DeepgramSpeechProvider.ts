import { SpeechToTextProvider } from './SpeechToTextProvider';

const SAMPLE_RATE = 16000;

export class DeepgramSpeechProvider implements SpeechToTextProvider {
  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  private lastActiveTime = 0;

  constructor(private token: string) {}

  public start(
    stream: MediaStream,
    onTextCaptured: (text: string) => void,
    onInterimTextCaptured?: (text: string) => void,
    onUtteranceEnd?: () => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let isInitialized = false;

      try {
        this.socket = new WebSocket(
          'wss://api.au.deepgram.com/v1/listen?language=id&model=nova-3&encoding=linear16&sample_rate=16000&punctuate=true&interim_results=true&utterance_end_ms=1000',
          ['token', this.token]
        );

        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = async () => {
          try {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
              sampleRate: SAMPLE_RATE,
            });

            await this.audioContext.audioWorklet.addModule('/audio-processor.js');

            this.source = this.audioContext.createMediaStreamSource(stream);

            this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
            this.workletNode.port.onmessage = (event) => {
              if (this.socket?.readyState !== WebSocket.OPEN) return;

              const pcmData = new Int16Array(event.data);
              let sum = 0;
              for (let i = 0; i < pcmData.length; i++) {
                sum += Math.abs(pcmData[i]);
              }
              const avgAmplitude = sum / pcmData.length;

              const SILENCE_THRESHOLD = 150;
              const HANGOVER_MS = 500;
              const now = Date.now();

              if (avgAmplitude >= SILENCE_THRESHOLD) {
                this.lastActiveTime = now;
              }

              if (now - this.lastActiveTime > HANGOVER_MS) {
                return;
              }

              this.socket.send(event.data);
            };

            this.source.connect(this.workletNode);
            this.workletNode.connect(this.audioContext.destination);

            this.keepAliveInterval = setInterval(() => {
              if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'KeepAlive' }));
              }
            }, 5000);

            isInitialized = true;
            resolve();
          } catch (err) {
            if (!isInitialized) {
              isInitialized = true;
              reject(err);
            }
          }
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'Results') {
              const transcript = data.channel?.alternatives?.[0]?.transcript;
              const isFinal = data.is_final;

              if (transcript && transcript.trim().length > 0) {
                if (isFinal) {
                  onTextCaptured(transcript.trim());
                } else if (onInterimTextCaptured) {
                  onInterimTextCaptured(transcript.trim());
                }
              }
            } else if (data.type === 'UtteranceEnd') {
              if (onUtteranceEnd) {
                onUtteranceEnd();
              }
            }
          } catch {
            // Ignored
          }
        };

        this.socket.onerror = () => {
          this.clearKeepAlive();
          if (!isInitialized) {
            isInitialized = true;
            reject(new Error('Deepgram socket connection failed'));
          }
        };

        this.socket.onclose = () => {
          this.clearKeepAlive();
          if (!isInitialized) {
            isInitialized = true;
            reject(new Error('Deepgram socket closed before opening'));
          }
        };
      } catch (err) {
        if (!isInitialized) {
          isInitialized = true;
          reject(err);
        }
      }
    });
  }

  public async stop(): Promise<void> {
    this.clearKeepAlive();
    try {
      if (this.workletNode) {
        this.workletNode.disconnect();
        this.workletNode = null;
      }
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
    } catch {
      // Ignored
    }

    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // Ignored
      } finally {
        this.socket = null;
      }
    }
  }

  private clearKeepAlive(): void {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}
