# 🪨 RockExport – AI-Powered Rock Identifier & Chat Companion

**RockExport** is a full-stack application that helps users identify rocks from images or text descriptions, fetches expert geological information from multiple APIs, and presents the data through a friendly AI chatbot. It’s designed for geologists, students, hikers, and curious explorers.

Built with a **TypeScript frontend**, a **Supabase backend**, and a **Hugging Face LLM chatbot**, RockExport combines science, education, and conversation in a single smart app.

---

## ✨ Features

- 🔍 **Rock Identification**
  - Upload an image or describe a rock — get the closest match using AI image classification and NLP.
- 🌐 **Geological Data Aggregation**
  - Automatically pulls rock information from trusted APIs (Mindat.org, USGS, Wikipedia, RockD).
- 💬 **Chatbot with Personality**
  - Conversational interface powered by a Hugging Face LLM acting as a friendly geology expert.
- 🧾 **User History & Storage**
  - Supabase backend stores user interactions, rock uploads, and preferences.
- 🎨 **Clean Frontend**
  - TypeScript + CSS-based UI with responsive design for mobile & desktop.

---

## 🧠 Tech Stack

| Layer        | Technology                             |
|--------------|-----------------------------------------|
| 🤖 AI Model   | Hugging Face LLM (Mistral, LLaMA, or GPT)|
| 🖼️ Image ID   | ViT / ResNet trained on rock datasets   |
| 🌐 APIs       | Mindat.org, USGS, RockD, Wikipedia      |
| 🔧 Backend    | Supabase (Auth, DB, Storage, Edge Functions) |
| 🖥️ Frontend   | TypeScript + React + CSS Modules        |
| ⚡ Dev Tools  | Vite, ESLint, Prettier, GitHub Actions  |

---

## 📁 Project Structure

```bash
rockexport/
├── backend/             # Supabase Edge Functions & SQL
├── frontend/            # React + TypeScript + CSS Modules
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── App.tsx
├── prompts/             # System prompts for LLM and classifiers
├── models/              # Rock image classification models
├── api_clients/         # API integrations
└── README.md
