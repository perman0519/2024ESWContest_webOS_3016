import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
from generated_code import update_sensor_data


# Step 1: 기존 모델 불러오기
with open('stacked_model.pkl', 'rb') as f:
    old_model = pickle.load(f)

# 기존 데이터 스케일러도 함께 불러오기
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Step 2: 새로운 모델 학습 (새 데이터 사용) POST던 GET이던 쏴야한다

new_data = update_sensor_data()
# print(new_data)
print(f"그래 이거 맞아 {new_data}입니다.")

new_df = pd.DataFrame(new_data)

# 새로운 데이터 특성 추출 및 스케일링 (기존 스케일러 사용)
X_new = new_df[['온도', '토양습도']]
X_new_scaled = scaler.transform(X_new)

# 타겟값
y_new = new_df['물주기양']

# 새로운 Random Forest 모델 학습
new_model = RandomForestRegressor(n_estimators=100, random_state=42)
new_model.fit(X_new_scaled, y_new)

# 새로운 모델 저장 (선택적)
with open('regression_model_new.pkl', 'wb') as f:
    pickle.dump(new_model, f)

with open('stacked_model.pkl', 'rb') as f:
    model1 = pickle.load(f)

with open('regression_model_new.pkl', 'rb') as f:
    model2 = pickle.load(f)

stacked_model = StackingRegressor(
    estimators=[('model1', model1),('model2', model2) ],
    final_estimator=Ridge()
)

# Stacking 모델을 학습시키기
stacked_model.fit(X_new_scaled, y_new)

# 예측 수행
final_prediction = stacked_model.predict(X_new_scaled)

# 예측 결과 출력
print(f"스택킹 모델을 통한 예측된 물주기양: {final_prediction}")

# Stacked 모델 업데이트
with open('stacked_model.pkl', 'wb') as f:
    pickle.dump(stacked_model, f)
