# Speechcraft Documentation Directory

Welcome to the technical documentation directory for **Speechcraft**. 

This directory contains in-depth specifications, architectural drawings, and operational guides detailing the Speechcraft real-time AI interpreter ecosystem.

---

## 🗺️ Documentation Sitemap

Refer to these documents for detailed analyses of specific system modules:

1.  **[Project Overview](overview.md)**
    *   Outlines Speechcraft's product goals, problem statement, key constraints, and core design principles.
2.  **[System Architecture](architecture.md)**
    *   Describes goals, system components (Speaker, Viewer, Admin), and displays the technical flow diagrams.
3.  **[Translation Pipeline](translation-pipeline.md)**
    *   Deep-dive into ASR downsampling, sliding context windows, DeepSeek integration, and low-latency considerations.
4.  **[Deployment Guide](deployment.md)**
    *   Outlines step-by-step setup for local Supabase emulator, environment keys, and production deployments to Vercel/Supabase Cloud.
5.  **[Security & Privacy Model](security.md)**
    *   Highlights the security measures including PIN gates, IP lockouts, rate limiting, and stateless data privacy.
6.  **[User Journeys](user-journeys.md)**
    *   Maps step-by-step journeys and mental models for Speakers, Viewers, and Administrators.
7.  **[System Performance](performance.md)**
    *   Covers latency breakdown, reconnect behaviors, error handling, and browser-native optimizations.
8.  **[Translation Glossary](glossary.md)**
    *   Provides term dictionaries and the context lookup translation strategy.
9.  **[Project Roadmap](roadmap.md)**
    *   Examines future development targets including multi-language selection, deep-link onboarding, and analytics metrics.

---

## 🏛️ Historical Setup

*   **[Historical Implementation Plans Directory](implementation-plans/README.md)**
    *   Historical reference guide detailing the initial scaffold and validation phases of the MVP code base.
