from flask import Flask, request, jsonify
from services.ai_service import generate_faqs, AIServiceError


app = Flask(__name__)


@app.route('/generate_faq', methods=['POST'])
def generate_faq():
    if not request.is_json:
        return jsonify({"error": "Invalid content type. Expected application/json"}), 415

    data = request.get_json(silent=True)
    if not data or 'description' not in data:
        return jsonify({"error": "Missing required field 'description'"}), 400

    description = data.get('description')
    if not isinstance(description, str) or not description.strip():
        return jsonify({"error": "Field 'description' must be a non-empty string"}), 400

    try:
        faqs = generate_faqs(description.strip())
        return jsonify({"faqs": faqs}), 200
    except AIServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Allows running via `python app.py` in addition to `flask run`
    app.run(host='0.0.0.0', port=5000, debug=True)


