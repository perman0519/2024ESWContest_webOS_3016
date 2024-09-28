import sys
import joblib

# 학습된 모델 로드
model = joblib.load('random_forest_model.pkl')

# 자바스크립트에서 입력받은 피처(특성) 값
features = list(map(float, sys.argv[1:]))

# 예측 수행
prediction = model.predict([features])

# 예측 결과 출력
print(prediction[0])
