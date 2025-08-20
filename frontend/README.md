## ai-faq-generator
AI FAQ Generator – Generates 5–7 FAQs from any company or product description using a React + Tailwind frontend. Optionally connects to a Flask backend that calls Google's Gemini API and returns structured JSON.

### Frontend (React + Vite + Tailwind + lucide-react)

Project structure (frontend parts only):
```
package.json
vite.config.js
index.html
postcss.config.js
tailwind.config.js
public/
  favicon.svg
src/
  main.jsx
  index.css
  App.jsx
  api.js
```

#### Run the frontend

1) Install Node.js 18+.
2) Install dependencies:
```bash
npm install
```
3) Start the dev server:
```bash
npm run dev
```
The app runs at `http://localhost:5173` by default.

#### Connect to the backend

The frontend sends requests to `http://localhost:5000/generate_faq` by default. To point elsewhere, set an env var before starting the dev server:
```bash
# Unix
export VITE_API_BASE_URL="http://localhost:5000"
# PowerShell
$env:VITE_API_BASE_URL = "http://localhost:5000"
```

Backend must expose `POST /generate_faq` with body `{ "description": "..." }` and return:
```json
{ "faqs": [ { "question": "...", "answer": "..." } ] }
```

### Features

- Textarea input with polished styling and helpful placeholder
- Example prompts that auto-fill the textarea and instantly show high-quality sample FAQs (works even if backend is not ready)
- AI Generate button with loading state, icons, and smooth transitions
- Results as expandable FAQ cards with per-item copy and a "Copy All" action
- Clear error handling with a banner, Details toggle, and Retry button
- Responsive, production-ready UI with gradient background, subtle animated blurs, and a favicon

### Error handling and offline mode

- If the backend is unreachable or returns an error, the app clearly indicates it's using local AI samples.
- The details panel shows the configured backend URL and the low-level error for troubleshooting.
- You can still demo the product fully using the built-in example prompts and locally generated samples.

### Build for production

```bash
npm run build
npm run preview
```

