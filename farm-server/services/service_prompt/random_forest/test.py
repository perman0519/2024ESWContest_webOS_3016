from sklearn.ensemble import RandomForestRegressor
import joblib

# 데이터 로드 및 모델 학습 (데이터 예시)
X_train = [
    [10.2, 5.1],  # 주차별 줄기 길이, 엽폭
    [11.3, 5.5],
    [12.1, 5.9],
]

y_train = [1, 2, 2]  # 물 준 횟수

# 모델 생성 및 학습
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 학습된 모델 저장
joblib.dump(model, 'random_forest_model.pkl')