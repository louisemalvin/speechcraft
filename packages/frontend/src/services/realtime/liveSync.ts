import { supabase } from '../../lib/supabaseClient';

export interface TranslationSegment {
  sequence_number: number;
  raw_text: string;
  translated_text: string;
  timestamp: number;
  audio_start_time?: number;
  stt_received_time?: number;
  deepseek_start_time?: number;
  deepseek_received_time?: number;
}

export function subscribeToLiveSermon(
  onSegmentReceived: (segment: TranslationSegment) => void
): () => void {
  const channel = supabase.channel('sermon-live');

  channel
    .on('broadcast', { event: 'translation_segment' }, ({ payload }) => {
      onSegmentReceived(payload as TranslationSegment);
    })
    .subscribe();

  return () => {
    void channel.unsubscribe();
  };
}
