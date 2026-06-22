# Terminology & Translation Glossary

This document outlines the specialized term corrections, dictionary mappings, and processing strategies used by the Speechcraft translation layer.

---

## 📖 Glossary Mappings

Spoken Indonesian terms—especially proper nouns, conference terminology, and theological concepts—are often transcribed phonetically or with lowercase letters by automatic speech recognition (ASR) engines. 

The translation layer injects a glossary into the DeepSeek prompt context to handle these corrections:

### Core Mappings

| Indonesian ASR Term | Target English Translation | Contextual Purpose |
|---|---|---|
| `tuan` (homophone typo) | `Lord` | Corrects standard speech typos where *Tuhan* (Lord) is transcribed as *tuan* (sir/master). |
| `roh kudus` | `Holy Spirit` | Capitalizes and correctly translates proper nouns. |
| `alkitab` | `Bible` | Capitalizes proper nouns. |
| `firman` / `firman tuhan` | `Word` / `Word of God` | Corrects capitalization and provides appropriate religious terminology. |
| `kasih karunia` | `Grace` | Resolves idiomatic expressions. |
| `jemaat` / `umat` | `Congregation` / `Church members` | Maps church-specific terms to standard community terminology. |
| `gembala` / `pendeta` | `Pastor` | Translates roles accurately. |
| `ibadah` / `kebaktian` | `Service` / `Worship service` | Maps gathering contexts. |
| `penebusan` | `Redemption` | Translates theological abstractions. |
| `mujizat` | `Miracle` | Translates religious concepts. |
| `perjamuan kudus` | `Holy Communion` | Capitalizes and translates sacral terminology. |

---

## 🛠️ Translation Strategy

The glossary is enforced using a system prompt structure, rather than a hardcoded find-and-replace regex parser.

### Why Find-and-Replace is Avoided
1.  **Context Destructive**: Substituting terms blindly breaks grammatical grammar flow and sentence structure (e.g., translating *tuan rumah* as *Lord rumah* instead of *host*).
2.  **Word Inflection Issues**: Indonesian is an inflected language that utilizes prefixes and suffixes (e.g. *menyaksikan*, *saksi*, *kesaksian*). A hardcoded search fails on morphological changes.

### LLM Prompt Enforcement
By providing the glossary as a lookup dictionary in the system prompt of the **DeepSeek V4-Flash** API, the model uses its linguistic semantic mapping to:
*   Apply correct translations while adapting grammatical structures.
*   Resolve ASR spelling errors based on the surrounding sentences.
*   Retain English phrases spoken during bilingual speech without translating them back to Indonesian.
