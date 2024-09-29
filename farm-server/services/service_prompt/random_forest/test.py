import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib

# 샘플 데이터 생성 (잎 너비와 줄기 길이를 사용한 가상 데이터)
data = {
    'leaf_width': [3.2, 4.1, 5.0, 4.5, 3.8, 4.9, 5.3, 3.6, 4.2, 5.1],
    'stem_length': [7.5, 8.0, 9.0, 8.5, 7.8, 9.2, 9.5, 7.7, 8.3, 9.1],
    'watering_frequency': [2, 3, 4, 3, 2, 4, 5, 2, 3, 4]  # 물 주는 빈도 (예측 대상)
}

# pandas DataFrame으로 변환
df = pd.DataFrame(data)

# 독립 변수(X)와 종속 변수(y) 분리
X = df[['leaf_width', 'stem_length']]
y = df['watering_frequency']

# 학습 데이터와 테스트 데이터 분리
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Random Forest 회귀 모델 초기화 및 학습
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 테스트 데이터로 예측 및 성능 평가
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse}")

# 학습된 모델 저장
joblib.dump(model, 'random_forest_model.pkl')
print("Model saved as random_forest_model.pkl")
