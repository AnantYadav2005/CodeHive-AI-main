# 🧠 CodeHive AI — Multi-Agent Code Intelligence

CodeHive AI is a **multi-agent AI system** that analyzes code using local LLMs via Ollama.

It simulates a team of expert developers to:

* Explain code
* Detect bugs
* Optimize performance
* Generate documentation
* Provide final review scores

---

## 🚀 Features

### 🤖 5-Agent Architecture

| Agent            | Role                               |
| ---------------- | ---------------------------------- |
| 🔍 Analyzer      | Explains code (ELI5 + Technical)   |
| 🐛 Bug Detector  | Finds bugs & edge cases            |
| ⚡ Optimizer      | Improves performance & readability |
| 📄 Doc Generator | Generates documentation            |
| 🧠 Reviewer      | Gives scores & summary             |

---

### ✨ Highlights

* ⚡ **LangGraph-style execution UI**
* 📊 **Progress visualization for each agent**
* 🧾 **Structured JSON parsing**
* 🧠 **Runs locally using Ollama (no API cost)**
* 📋 **Copy optimized code**
* 📄 **Download results as PDF** 

---

## ⚙️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** None (Client-side app)
* **AI Engine:** Ollama (Llama 3)
* **Architecture:** Multi-Agent Prompt System

---

## 📦 Setup Instructions

### 1. Install Ollama

Download from: https://ollama.com

---

### 2. Pull Model

```bash
ollama pull llama3
```

---

### 3. Run Ollama

```bash
ollama serve
```

---

### 4. Run the App

Just open:

```bash
index.html
```

---

## 🔌 API Configuration

The app connects to:

```
http://localhost:11434/api/generate
```

Make sure Ollama is running.

---

## 🧪 Example Code

```python
def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i, len(arr)):
            if arr[i] == arr[j]:
                duplicates.append(arr[i])
    return duplicates
```

---

## 📊 Output Includes

* ✅ Code Explanation (ELI5 + Technical)
* 🐛 Bug Detection
* ⚡ Optimized Code
* 📄 Documentation
* 🧠 Review Scores & Summary

---

## ⚠️ Known Issues

* Ollama must be running locally
* Large prompts may be slow
* JSON parsing depends on model output

---

## 🔮 Future Improvements

* 🌐 Deploy backend (Node.js)
* 🤖 Add more agents
* 🧩 Plugin support
* 📈 Code complexity visualization

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!