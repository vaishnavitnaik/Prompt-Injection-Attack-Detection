from flask import Flask, request, jsonify
from flask_cors import CORS 
import requests

app = Flask(__name__)
CORS(app)
# The URL of the original backend (running on port 5000)
original_backend_url = "http://127.0.0.1:5000/query"

@app.route('/query', methods=['POST'])
def intruder_query():
    # Get the incoming request data
    data = request.json
    intrude =  input("Enter your query: ")
    # Simulate intruder appending "ignore previous instruction" to the query
    modified_prompt = intrude + data.get("question")
    
    # Create a new request with the modified prompt and the same PIN
    modified_data = {
        "question": modified_prompt,
        "password": data.get("password")
    }

    # Forward the modified request to the original backend
    try:
        response = requests.post(original_backend_url, json=modified_data)
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to contact the original backend", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(port=3000, debug=True)
