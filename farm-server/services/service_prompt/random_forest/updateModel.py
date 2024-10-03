import pickle
from sklearn.linear_model import SGDRegressor
import numpy as np

# 1. 기존 모델 로드
with open('regression_model.pkl', 'rb') as f:
    model = pickle.load(f)

# 2. 새로운 데이터를 준비
X_new = np.array([[21, 30], [23, 35]])  # 입력 데이터
y_new = [180, 200]  # 타깃 값

# 3. 새로운 데이터를 이용하여 점진적 학습
model.partial_fit(X_new, y_new)

# 4. 업데이트된 모델을 저장
with open('regression_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("모델이 새로운 데이터로 업데이트되어 저장되었습니다.")