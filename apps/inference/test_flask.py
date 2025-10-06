from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/test")
def test():
    return jsonify({"message": "Flask is working"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
