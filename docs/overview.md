# Speechcraft: Project Overview

Speechcraft is a real-time AI interpretation platform that converts spoken Indonesian into live English translations and broadcasts them instantly to attendees through a web browser.

---

## 💡 The Problem

Many organizations—including community groups, non-profits, seminars, and churches—serve multilingual audiences but face significant barriers to providing live translation:
1.  **High Hardware Cost**: Traditional translation setups require dedicated transmitters, multi-channel receivers, and headsets.
2.  **Personnel Constraints**: Professional human interpreters are expensive and difficult to source, especially for niche language pairs or local community events.
3.  **App Friction**: Forcing attendees to download and install native mobile applications to receive audio feeds causes onboarding delays and resistance.

---

## 🚀 The Solution

Speechcraft offers a lightweight, zero-maintenance, and low-cost alternative. It requires only:
*   **A phone** for the speaker to capture audio.
*   **A web browser** for attendees to read or listen to translations.
*   **Cloud AI services** to handle transcription and translation.

By combining browser-based speech-to-text, serverless edge translation, and real-time WebSocket broadcasting, Speechcraft delivers scrolling translations with sub-second latency directly to user devices.

---

## 🎯 Target Audience & Use Cases

*   **Churches & Houses of Worship**: Translate sermons live for multi-ethnic congregations.
*   **Conferences & Seminars**: Broaden accessibility for international attendees.
*   **Community Events**: Bridge language divides in local town halls and municipal gatherings.
*   **Academic Lectures**: Assist exchange students and international scholars.

---

## 📐 Key Product Principles

1.  **Low Latency**: The voice-to-screen loop must remain near one second to keep the audience synchronized with the physical speaker.
2.  **Zero-Install Friction**: Attendees join instantly via a URL or QR code. No user registration, app store downloads, or account creation are required.
3.  **Stateless & Cost-Efficient**: By utilizing ephemeral WebSocket broadcasts and eliminating database storage, Speechcraft runs on free-tier cloud resources, costing $0/month in idle state.
4.  **Device Keep-Alive**: The speaker console is built as a Progressive Web App (PWA) that leverages the browser's Screen Wake Lock API to prevent the device from entering sleep mode during long presentations.
