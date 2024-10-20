import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle

# 가상의 식물 데이터를 생성합니다.
# 10주
data = {
    '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
    '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
    '주당 물주기횟수': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
}

# 데이터를 표형식으로
df = pd.DataFrame(data)

# 특성과 타겟으로 나누기
X = df[['토양습도', '온도']]
y = df['주당 물주기횟수']

# 데이터 정규화
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 훈련 세트와 테스트 세트로 분리
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 비선형 관계를 더 잘 학습할 수 있는 RandomForest 회귀 모델을 생성하고 훈련합니다.
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 모델을 pickle 파일로 저장합니다.
with open('stacked_tomato_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("tomato 모델이 regression_model.pkl로 저장되었습니다.")

# scaler를 pickle 파일로 저장
with open('tomato_scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
print("scaler가 tomato_scaler.pkl로 저장되었습니다.")
