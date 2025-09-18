from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('./disease_predictor_model.pkl')
print(len(model.classes_))



# Use feature names exactly as the model expects
feature_columns = list(model.feature_names_in_)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}

    # Convert input dictionary to DataFrame
    input_df = pd.DataFrame([data])

    # Reindex columns to match model feature names, filling missing with 0
    input_df = input_df.reindex(columns=feature_columns, fill_value=0)

    # Predict disease
    prediction = model.predict(input_df)[0]

    return jsonify({'predicted_disease': prediction})

if __name__ == "__main__":
    app.run(debug=True)
