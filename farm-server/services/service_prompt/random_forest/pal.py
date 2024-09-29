import numpy as np
import pandas as pd  # pandas 임포트 추가
import joblib

# 훈련된 회귀 모델을 불러옵니다.
model = joblib.load('regression_model.pkl')

# 여기에 실제 피처 값을 입력하세요.
temperature = 21  # 실제 온도 값
humidity = 32     # 실제 습도 값
sunlight = 6      # 실제 일조량 값

# 예측할 데이터 생성 (pandas DataFrame 사용)
features = pd.DataFrame([[temperature, humidity, sunlight]], columns=['온도', '습도', '일조량'])

# 물 주기 양을 예측합니다.
predicted_water_amount = model.predict(features)

# 예측된 물 주기 양을 출력합니다.
print(predicted_water_amount[0])  # 예측된 양을 출력합니다.





# import pickle
# import numpy as np

# # 사전에 훈련된 회귀 모델을 로드
# with open('regression_model.pkl', 'rb') as model_file:
#     model = pickle.load(model_file)

# # 예측을 위한 피처 데이터 입력 (줄기 길이, 잎 너비 등)
# features = [10.5, 3.2, 7.8]  # 예시 데이터

# # 회귀 모델을 사용하여 예측 수행
# def predict_watering(features):
#     prediction = model.predict([features])
#     return prediction[0]

# # 예측 결과 출력
# predicted_watering_amount = predict_watering(features)
# print(f"{predicted_watering_amount}")