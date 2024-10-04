import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
from generated_code import update_sensor_data


# Step 1: 기존 모델 불러오기
with open('regression_model.pkl', 'rb') as f:
    old_model = pickle.load(f)

# 기존 데이터 스케일러도 함께 불러오기
scaler = StandardScaler()

# 기존 데이터

data = {
    '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
    '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
    '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
}

df = pd.DataFrame(data)

# 기존 데이터의 특성 추출 및 스케일링
X_old = df[['온도', '토양습도']]
X_old_scaled = scaler.fit_transform(X_old)

# Step 2: 새로운 모델 학습 (새 데이터 사용) POST던 GET이던 쏴야한다

new_data = update_sensor_data()
# print(new_data)
print(f"그래 이거 맞아 {new_data}입니다.")

# new_data = {
#     '온도': [26, 28, 27, 29, 30],
#     '토양습도': [15, 18, 17, 14, 16],
#     '물주기양': [140, 135, 145, 130, 150]
# }

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


with open('regression_model.pkl', 'rb') as f:
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

# Stacked 모델 저장
with open('stacked_model.pkl', 'wb') as f:
    pickle.dump(stacked_model, f)

# # Step 3: 두 모델의 예측 결과를 조합 (앙상블)
# # 예측할 데이터
# test_data = np.array([[21, 33]])  # 예: 온도 21, 토양습도 33
# test_data_scaled = scaler.transform(test_data)  # 기존 스케일러 사용

# # 기존 모델을 통한 예측
# old_model_prediction = old_model.predict(test_data_scaled)

# # 새로운 모델을 통한 예측
# new_model_prediction = new_model.predict(test_data_scaled)

# # 두 모델의 결과를 평균 (앙상블)
# final_prediction = (old_model_prediction + new_model_prediction) / 2
# print(f"앙상블 예측된 물주기양: {final_prediction[0]}")













# import numpy as np
# import pandas as pd
# from sklearn.ensemble import RandomForestRegressor, StackingRegressor
# from sklearn.linear_model import Ridge
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler
# import pickle
# from python_firebase import update_sensor_data


# # Step 1: 기존 모델 불러오기
# with open('regression_model.pkl', 'rb') as f:
#     old_model = pickle.load(f)

# # 기존 데이터 스케일러도 함께 불러오기
# scaler = StandardScaler()

# # 기존 데이터

# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 기존 데이터의 특성 추출 및 스케일링
# X_old = df[['온도', '토양습도']]
# X_old_scaled = scaler.fit_transform(X_old)

# # Step 2: 새로운 모델 학습 (새 데이터 사용) POST던 GET이던 쏴야한다

# new_data = update_sensor_data()
# # print(new_data)
# print(f"그래 이거 맞아 {new_data}입니다.")

# # new_data = {
# #     '온도': [26, 28, 27, 29, 30],
# #     '토양습도': [15, 18, 17, 14, 16],
# #     '물주기양': [140, 135, 145, 130, 150]
# # }

# new_df = pd.DataFrame(new_data)

# # 새로운 데이터 특성 추출 및 스케일링 (기존 스케일러 사용)
# X_new = new_df[['온도', '토양습도']]
# X_new_scaled = scaler.transform(X_new)

# # 타겟값
# y_new = new_df['물주기양']

# # 새로운 Random Forest 모델 학습
# new_model = RandomForestRegressor(n_estimators=100, random_state=42)
# new_model.fit(X_new_scaled, y_new)

# # 새로운 모델 저장 (선택적)
# with open('regression_model_new.pkl', 'wb') as f:
#     pickle.dump(new_model, f)


# with open('regression_model.pkl', 'rb') as f:
#     model1 = pickle.load(f)

# with open('regression_model_new.pkl', 'rb') as f:
#     model2 = pickle.load(f)

# stacked_model = StackingRegressor(
#     estimators=[('model1', model1),('model2', model2) ],
#     final_estimator=Ridge()
# )

# with open('stacked_model.pkl', 'wb') as f:
#     pickle.dump(stacked_model, f)

# # Step 3: 두 모델의 예측 결과를 조합 (앙상블)
# # 예측할 데이터
# test_data = np.array([[21, 33]])  # 예: 온도 21, 토양습도 33
# test_data_scaled = scaler.transform(test_data)  # 기존 스케일러 사용

# # 기존 모델을 통한 예측
# old_model_prediction = old_model.predict(test_data_scaled)

# # 새로운 모델을 통한 예측
# new_model_prediction = new_model.predict(test_data_scaled)

# # 두 모델의 결과를 평균 (앙상블)
# final_prediction = (old_model_prediction + new_model_prediction) / 2
# print(f"앙상블 예측된 물주기양: {final_prediction[0]}")

