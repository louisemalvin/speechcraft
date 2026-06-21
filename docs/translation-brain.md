# Translation Brain: Contextual DeepSeek Translation Strategy

This document specifies the setup, system prompt design, and execution logic of the translation brain powered by the **DeepSeek V4-Flash API**.

## The Translation Challenge

Translating Indonesian church sermons in real-time presents two unique challenges:
1. **Raw ASR (Automatic Speech Recognition) Errors**: Web Speech API is phonetically driven and operates in real-time. It frequently makes spelling errors, misses context-specific words, fails to capitalize proper nouns (e.g., writing "yesus" instead of "Yesus", "alkitab" instead of "Alkitab"), or maps church-specific terms to common homophones (e.g., transcribing "Tuhan" as "tuan").
2. **Context Fragmentation**: Standard translation models translate individual sentences in isolation. Without knowing the previous sentences, a model cannot maintain pronouns, tense, flow, or logical progression, leading to a choppy, disjointed reading experience for the congregation.

To solve these, the Translation Brain implements a **Sliding Context Window** combined with a **Theologically-Aware System Prompt**.

---

## Sliding Context Window

To translate statelessly without database storage overhead, the **Speaker client** keeps a sliding in-memory history of the **last 3 translated segments** (both the raw Indonesian text and their translated English outputs). 

When the Speaker client requests a translation from the Supabase Edge Function via HTTP POST, it sends this history array in the request body. The Edge Function then constructs the conversation context and sends it to DeepSeek.

### Context Message Schema
The message payload sent to DeepSeek is constructed as:

```json
[
  {
    "role": "system",
    "content": "...[System Prompt containing instructions & glossary]..."
  },
  {
    "role": "user",
    "content": "Context Segment 1 (Indonesian): Bapa kami yang di sorga, dikuduskanlah nama-Mu.\nTranslation 1 (English): Our Father in heaven, hallowed be Your name."
  },
  {
    "role": "user",
    "content": "Context Segment 2 (Indonesian): datanglah kerajaan-Mu, jadilah kehendak-Mu di bumi seperti di sorga.\nTranslation 2 (English): Your kingdom come, Your will be done on earth as it is in heaven."
  },
  {
    "role": "user",
    "content": "Context Segment 3 (Indonesian): Berikanlah kami pada hari ini makanan kami yang secukupnya\nTranslation 3 (English): Give us this day our daily bread"
  },
  {
    "role": "user",
    "content": "Translate this new segment (Indonesian): dan ampunilah kami akan kesalahan kami seperti kami juga mengampuni orang yang bersalah kepada kami"
  }
]
```

By presenting the input as sequential turn context, DeepSeek can infer terms (like "kesalahan kami" → "our debts/trespasses") that fit the established theological pattern of the preceding sentences.

---

## The System Prompt

The system prompt is the core instruction set for the model. It defines the translation style, handling of raw voice text, formatting requirements, and theological rules.

```markdown
You are the translation engine of a real-time Indonesian-to-English church sermon pipeline.
Your goal is to translate spoken Indonesian into natural, grammatically correct, and contextually appropriate English.

Core Instructions:
1. Translate conversational Indonesian to natural, readable English suitable for displaying live to a church congregation.
2. Correct ASR (Automatic Speech Recognition) transcription typos. Spoken Indonesian often results in phonetically similar typos (e.g., "tuan" instead of "Tuhan", "yesus" instead of "Yesus", "roh kudus" instead of "Roh Kudus"). Use the surrounding sermon context to repair these spelling errors.
3. Align translations with Christian theological terminology (see the Indonesian-English church glossary below).
4. Keep translations concise and immediate. Do not add commentary, explanations, formatting markers, or conversational filler.
5. Translate the final user prompt. You are provided up to 3 prior segments as context to preserve flow and pronoun antecedents. Do NOT translate the context segments; only translate the LAST segment.
6. Return your output STRICTLY in JSON format with a single key "translated_text" containing the translated string.

Indonesian-English Church Glossary:
- "Tuhan" -> "Lord" (rarely "Sir" or "master" in this context)
- "Bapa" -> "Father"
- "Roh Kudus" -> "Holy Spirit"
- "Firman" -> "Word" (e.g., "Firman Tuhan" -> "Word of God")
- "Kasih karunia" -> "Grace"
- "Jemaat" / "Umat" -> "Congregation" / "Church members"
- "Alkitab" -> "Bible"
- "Gembala" / "Pendeta" -> "Pastor"
- "Kristus" -> "Christ"
- "Salib" / "Penyaliban" -> "Cross" / "Crucifixion"
- "Kebaktian" / "Ibadah" -> "Service" / "Worship service"
- "Pujian" / "Penyembahan" -> "Praise" / "Worship"
- "Keselamatan" -> "Salvation"
- "Dosa" -> "Sin"
- "Kerajaan Allah" -> "Kingdom of God"
- "Penebusan" -> "Redemption"
- "Saksi" -> "Witness"
- "Mujizat" -> "Miracle"
- "Perjamuan Kudus" -> "Holy Communion"
```

---

## Output Contract & Validation

To ensure the Supabase Edge function can parse the output reliably and quickly, the model must output JSON.

### Request Payload
- **Endpoint**: `https://api.deepseek.com/v1/chat/completions` (or compatible OpenAI routing)
- **Model**: `deepseek-chat` (DeepSeek V4-Flash API)
- **Temperature**: `0.3` (low temperature ensures translation consistency and reduces hallucinations)
- **Response Format**: `{"type": "json_object"}` (forces JSON output validation)

### Expected JSON Response Form
```json
{
  "translated_text": "And forgive us our debts, as we also have forgiven our debtors."
}
```

### Parsing Edge-Case Handler
If DeepSeek returns invalid JSON or fails to include the `"translated_text"` key, the Edge Function fallback executes:
1. Attempt to regex-parse content between curly braces.
2. If regex extraction fails, fall back to treating the entire returned string as the raw translation.
3. Strip trailing quotes or escape sequences.
4. Trim surrounding whitespace.
