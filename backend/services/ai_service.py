import requests
import json
from typing import List, Dict

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_API_URL


class AIServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _build_prompt(description: str) -> str:
    return (
        "You are an expert product support writer. Given the following company or product description, "
        "generate 5 to 7 highly relevant, concise FAQ pairs. Each FAQ should include a clear question and a helpful, "
        "accurate answer tailored to the description. Avoid marketing fluff. Focus on practical, user-centric concerns.\n\n"
        f"Description:\n{description}\n\n"
        "Return ONLY valid JSON with this exact shape: {\n"
        "  \"faqs\": [\n"
        "    { \"question\": \"...\", \"answer\": \"...\" },\n"
        "    ... 5-7 items total ...\n"
        "  ]\n"
        "}"
    )


def generate_faqs(description: str) -> List[Dict[str, str]]:
    if not GEMINI_API_KEY:
        raise AIServiceError("GEMINI_API_KEY is not set", 500)

    prompt = _build_prompt(description)

    try:
        # Using Gemini REST API (Generative Language API)
        # Reference endpoint format for text generation
        url = f"{GEMINI_API_URL}/models/{GEMINI_MODEL}:generateContent"

        headers = {
            "Content-Type": "application/json",
        }

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            # Encourage JSON output
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.9,
                "topK": 40,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json"
            }
        }

        # Pass API key via query param for compatibility
        response = requests.post(url, params={"key": GEMINI_API_KEY}, json=payload, headers=headers, timeout=30)
        if response.status_code >= 400:
            raise AIServiceError(f"Gemini API error: {response.status_code} {response.text}", response.status_code)

        data = response.json()

        # Gemini JSON response structure parsing
        # Prefer candidates[0].content.parts[0].text as JSON
        candidates = data.get("candidates", [])
        if not candidates:
            raise AIServiceError("No candidates returned by Gemini API", 502)

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise AIServiceError("No content parts returned by Gemini API", 502)

        raw_text = parts[0].get("text", "").strip()
        if not raw_text:
            raise AIServiceError("Empty response from Gemini API", 502)

        try:
            json_obj = json.loads(raw_text)
        except Exception:
            # Fallback: sometimes model returns JSON fenced in markdown; try to extract
            import re, json
            match = re.search(r"\{[\s\S]*\}", raw_text)
            if not match:
                raise AIServiceError("Failed to parse JSON from Gemini response", 502)
            json_obj = json.loads(match.group(0))

        faqs = json_obj.get("faqs", [])
        if not isinstance(faqs, list) or len(faqs) == 0:
            raise AIServiceError("Gemini response did not include 'faqs' list", 502)

        sanitized: List[Dict[str, str]] = []
        for item in faqs:
            question = str(item.get("question", "")).strip()
            answer = str(item.get("answer", "")).strip()
            if question and answer:
                sanitized.append({"question": question, "answer": answer})

        if not sanitized:
            raise AIServiceError("No valid FAQs parsed from Gemini response", 502)

        # Limit to 7 items, ensure 5-7 range
        return sanitized[:7]

    except requests.Timeout:
        raise AIServiceError("Gemini API request timed out", 504)
    except requests.RequestException as e:
        raise AIServiceError(f"Gemini API request failed: {str(e)}", 502)


