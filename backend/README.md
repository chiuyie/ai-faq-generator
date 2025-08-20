## ai-faq-generator

AI FAQ Generator – A minimal Flask backend that generates 5–7 FAQ question/answer pairs from any company or product description using Google's Gemini API. Returns clean, structured JSON for easy integration.

### Project Structure

```
ai-faq-generator/
  app.py                 # Flask app and /generate_faq route
  config.py              # Environment-based config (GEMINI_API_KEY, model, base URL)
  services/
    ai_service.py        # Gemini API integration and response parsing
  requirements.txt       # Python dependencies
  setup.ps1              # PowerShell script to create/activate venv and install deps
  README.md              # This file
```

### Quick Setup (Windows PowerShell)

```powershell
# From the project root
./setup.ps1

# Then start the app (venv remains active)
python app.py
```

### Setup Instructions

1) Create and activate a virtual environment (recommended):

```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: . .venv/Scripts/Activate.ps1
```

2) Install dependencies:

```bash
pip install -r requirements.txt
```

3) Set your Gemini API key (and optional overrides):

```bash
$env:GEMINI_API_KEY = "YOUR_API_KEY"          # PowerShell
# Optional overrides
$env:GEMINI_MODEL = "gemini-2.5-flash"        # default
$env:GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"  # default
```

Alternatively, you can create a `.env` file in the project root (auto-loaded):

```
GEMINI_API_KEY=YOUR_API_KEY
# Optional
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
```

4) Run the Flask app:

```bash
# PowerShell
$env:FLASK_APP = "app.py"; $env:FLASK_RUN_PORT = "5000"; flask run
# Or simply:
python app.py
```

The server will start on `http://127.0.0.1:5000`.

### Usage

Endpoint: `POST /generate_faq`

Request headers:
- `Content-Type: application/json`

Request body example:

```json
{ "description": "We are a pet adoption platform helping people find and adopt stray cats and dogs." }
```

Successful response example (truncated):

```json
{
  "faqs": [
    { "question": "How does the adoption process work?", "answer": "Create a profile, browse pets, apply, complete a home check, and finalize the adoption." },
    { "question": "Is there an adoption fee?", "answer": "Yes, fees cover vaccinations, microchipping, and initial care. Amounts vary by pet and location." }
  ]
}
```

### Error Handling

- Missing or empty `description` → `400` with `{ "error": "..." }`
- Invalid content type (non-JSON) → `415`
- Upstream Gemini API errors/timeouts → `5xx` with a descriptive message

### Notes

- Ensure your `GEMINI_API_KEY` has access to the specified model.
- The service requests JSON output from the model and sanitizes the result to ensure the `faqs` list contains objects with `question`/`answer` strings.
