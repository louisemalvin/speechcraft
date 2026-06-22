export interface TranslationPayload {
  sequence_number: number;
  raw_text: string;
  translated_text: string;
  timestamp: number;
}

export interface TranslationResponse {
  translated_text: string;
}

export const MAX_HISTORY_WINDOW = 3;
