---
title: AuraStyle AI
emoji: 👗
colorFrom: yellow
colorTo: purple
sdk: docker
app_port: 7860
short_description: AI outfit analysis and styling advice
---

# AuraStyle AI

AI outfit stylist that analyzes a photo and presents outfit scores, color harmony, item-by-item feedback, occasion suitability, and styling suggestions in an interactive fashion canvas. Users can take or upload a photo, or try the sample outfits. Critiques can be read aloud using the browser's built-in speech synthesis.

## Configuration

To enable Gemini image analysis, add `GEMINI_API_KEY` in the Space's **Settings → Variables and secrets**. The key is read by the server at runtime and must not be committed to this repository. Without the key, the app uses its bundled sample report.

## Run locally

```bash
npm install
npm run dev
```

For the production server, run `npm start` after setting `GEMINI_API_KEY` in your environment. The server listens on `PORT` (7860 on Hugging Face Spaces).

Original Google AI Studio project: https://ai.studio/apps/30623bbe-eefc-4863-8425-e03ecffb6a61
