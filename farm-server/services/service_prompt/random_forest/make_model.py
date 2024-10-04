# import numpy as np
# import pandas as pd
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.model_selection import train_test_split
# import joblib

# # 가상의 식물 데이터를 생성합니다.
# # 예: 온도, 습도, 일조량, 물 주기 양
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '일조량': [6, 7, 5, 8, 4, 9, 5, 6, 7, 8],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '습도', '일조량']]
# y = df['물주기양']

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # 랜덤 포레스트 모델을 훈련합니다.
# model = RandomForestRegressor(n_estimators=100, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# joblib.dump(model, 'regression_model.pkl')
# print("모델이 regression_model.pkl로 저장되었습니다.")

# import numpy as np
# import pandas as pd
# from sklearn.linear_model import SGDRegressor
# from sklearn.model_selection import train_test_split
# import pickle  # joblib 대신 pickle을 사용

# # 가상의 식물 데이터를 생성합니다.
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '토양습도']]
# y = df['물주기양']

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # SGD 회귀 모델을 생성하고 훈련합니다.
# model = SGDRegressor(max_iter=1000, tol=1e-3, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# with open('regression_model.pkl', 'wb') as f:
#     pickle.dump(model, f)
# print("모델이 regression_model.pkl로 저장되었습니다.")

# # 새로운 데이터로 점진적 학습 예시
# new_data = pd.DataFrame({
#     '온도': [21, 23],
#     '토양습도': [30, 35],  # '습도'에서 '토양습도'로 변경
# })
# new_targets = [180, 200]

# # 모델에 새로운 데이터로 업데이트
# model.partial_fit(new_data, new_targets)

# # 예측
# predictions = model.predict(X_test)
# print("테스트 세트에 대한 예측 결과:", predictions)


# import numpy as np
# import pandas as pd
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.model_selection import train_test_split
# import joblib

# # 가상의 식물 데이터를 생성합니다.
# # 예: 온도, 습도, 일조량, 물 주기 양
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '일조량': [6, 7, 5, 8, 4, 9, 5, 6, 7, 8],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '습도', '일조량']]
# y = df['물주기양']

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # 랜덤 포레스트 모델을 훈련합니다.
# model = RandomForestRegressor(n_estimators=100, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# joblib.dump(model, 'regression_model.pkl')
# print("모델이 regression_model.pkl로 저장되었습니다.")

# import numpy as np
# import pandas as pd
# from sklearn.linear_model import SGDRegressor
# from sklearn.model_selection import train_test_split
# import pickle  # joblib 대신 pickle을 사용

# # 가상의 식물 데이터를 생성합니다.
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '토양습도']]
# y = df['물주기양']

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # SGD 회귀 모델을 생성하고 훈련합니다.
# model = SGDRegressor(max_iter=1000, tol=1e-3, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# with open('regression_model.pkl', 'wb') as f:
#     pickle.dump(model, f)
# print("모델이 regression_model.pkl로 저장되었습니다.")

# # 새로운 데이터로 점진적 학습 예시
# new_data = pd.DataFrame({
#     '온도': [21, 23],
#     '토양습도': [30, 35],  # '습도'에서 '토양습도'로 변경
# })
# new_targets = [180, 200]

# # 모델에 새로운 데이터로 업데이트
# model.partial_fit(new_data, new_targets)

# # 예측
# predictions = model.predict(X_test)
# print("테스트 세트에 대한 예측 결과:", predictions)


import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle

# 가상의 식물 데이터를 생성합니다.
data = {
    '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
    '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
    '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
}

df = pd.DataFrame(data)

# 특성과 타겟으로 나누기
X = df[['온도', '토양습도']]
y = df['물주기양']

# 데이터 정규화
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 훈련 세트와 테스트 세트로 분리
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 비선형 관계를 더 잘 학습할 수 있는 RandomForest 회귀 모델을 생성하고 훈련합니다.
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 모델을 pickle 파일로 저장합니다.
with open('regression_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("모델이 regression_model.pkl로 저장되었습니다.")
























# import numpy as np
# import pandas as pd
# from sklearn.linear_model import SGDRegressor
# from sklearn.model_selection import train_test_split
# import joblib

# # 가상의 식물 데이터를 생성합니다.
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '토양습도']]
# y = df['물주기양']

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # SGD 회귀 모델을 생성하고 훈련합니다.
# model = SGDRegressor(max_iter=1000, tol=1e-3, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# joblib.dump(model, 'regression_model.pkl')
# print("모델이 regression_model.pkl로 저장되었습니다.")

# # 새로운 데이터로 점진적 학습 예시
# new_data = pd.DataFrame({
#     '온도': [21, 23],
#     '습도': [30, 35],
# })
# new_targets = [180, 200]

# # 모델에 새로운 데이터로 업데이트
# model.partial_fit(new_data, new_targets)

# # 예측
# predictions = model.predict(X_test)
# print("테스트 세트에 대한 예측 결과:", predictions)













# import numpy as np
# import pandas as pd
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler
# import pickle

# # 가상의 식물 데이터를 생성합니다.
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '토양습도']]
# y = df['물주기양']

# # 데이터 정규화
# scaler = StandardScaler()
# X_scaled = scaler.fit_transform(X)

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# # 비선형 관계를 더 잘 학습할 수 있는 RandomForest 회귀 모델을 생성하고 훈련합니다.
# model = RandomForestRegressor(n_estimators=100, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# with open('regression_model.pkl', 'wb') as f:
#     pickle.dump(model, f)
# print("모델이 regression_model.pkl로 저장되었습니다.")
























# import numpy as np
# import pandas as pd
# from sklearn.linear_model import SGDRegressor
# from sklearn.model_selection import train_test_split
# import joblib

# # 가상의 식물 데이터를 생성합니다.
# data = {
#     '온도': [20, 22, 21, 19, 24, 25, 23, 22, 21, 20],
#     '토양습도': [30, 35, 32, 40, 25, 20, 22, 30, 32, 35],
#     '물주기양': [150, 200, 180, 220, 170, 160, 200, 210, 190, 180]
# }

# df = pd.DataFrame(data)

# # 특성과 타겟으로 나누기
# X = df[['온도', '토양습도']]
# y = df['물주기양']

# # 훈련 세트와 테스트 세트로 분리
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # SGD 회귀 모델을 생성하고 훈련합니다.
# model = SGDRegressor(max_iter=1000, tol=1e-3, random_state=42)
# model.fit(X_train, y_train)

# # 모델을 pickle 파일로 저장합니다.
# joblib.dump(model, 'regression_model.pkl')
# print("모델이 regression_model.pkl로 저장되었습니다.")

# # 새로운 데이터로 점진적 학습 예시
# new_data = pd.DataFrame({
#     '온도': [21, 23],
#     '습도': [30, 35],
# })
# new_targets = [180, 200]

# # 모델에 새로운 데이터로 업데이트
# model.partial_fit(new_data, new_targets)

# # 예측
# predictions = model.predict(X_test)
# print("테스트 세트에 대한 예측 결과:", predictions)