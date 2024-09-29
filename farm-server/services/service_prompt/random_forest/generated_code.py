import numpy as np
import pandas as pd
import joblib

# Load the trained regression model
model = joblib.load('regression_model.pkl')

# Create the plant feature data as numpy array
# Example: [Temperature, Humidity, Sunlight]
온도 = 21  # Input actual value
습도 = 32  # Input actual value
일조량 = 6  # Input actual value

# Create data to predict (using pandas DataFrame)
features = pd.DataFrame([[온도, 습도, 일조량]], columns=['온도', '습도', '일조량'])

# Predict the water amount
predicted_water_amount = model.predict(features)

# Print the predicted water amount
print(predicted_water_amount[0])  # Print the predicted amount

# from flask import Flask, request, jsonify
# import numpy as np
# import pandas as pd
# import joblib

# app = Flask(__name__)

# # 모델 로드
# model = joblib.load('regression_model.pkl')

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         # 요청에서 데이터 가져오기
#         data = request.json
        
#         # 입력값을 pandas DataFrame으로 변환
#         features = pd.DataFrame([data['features']], columns=['온도', '습도', '일조량'])
        
#         # 예측 수행
#         prediction = model.predict(features)
        
#         # 결과 반환
#         return jsonify({'prediction': prediction[0]})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)