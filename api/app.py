from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('disease_predictor_model.pkl')
print(len(model.classes_))

# Use feature names exactly as the model expects
feature_columns = list(model.feature_names_in_)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json() or {}
        input_df = pd.DataFrame([data])
        input_df = input_df.reindex(columns=feature_columns, fill_value=0)
        prediction = model.predict(input_df)[0]
        return jsonify({'predicted_disease': prediction})
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(traceback_str)
        return jsonify({'error': str(e), 'trace': traceback_str}), 500

if __name__ == "__main__":
    app.run(debug=True)
