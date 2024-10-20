from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
import firebase_admin
from firebase_admin import credentials, db
import threading
import time
import subprocess
import os

app = Flask(__name__)

# Firebase database 인증 및 앱 초기화
cred = credentials.Certificate('./smartfarm.json')  # Firebase auth key setting
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smartfarm-ddbc3-default-rtdb.firebaseio.com' #real DB url
})

#Realtime Database reference
# firebase_ref = db.reference('sector/0/sensorData') #임시
firebase_ref = db.reference('sector/0/weekly_avg')

# 모델 파일 확인 및 로드
basil_model_path = 'stacked_basil_model.pkl'
tomato_model_path = 'stacked_tomato_model.pkl'

def load_basil_model():
    if not os.path.exists(basil_model_path):
        print(f"{basil_model_path} 파일이 없습니다. basil 모델을 학습합니다.")
        subprocess.run(['python3', 'make_basil_model.py'])  # 모델이 없을 경우 make_model.py 실행
    with open(basil_model_path, 'rb') as f:
        return joblib.load(f)

def load_tomato_model():
    if not os.path.exists(tomato_model_path):
        print(f"{tomato_model_path} 파일이 없습니다. tomato 모델을 학습합니다.")
        subprocess.run(['python3', 'make_tomato_model.py'])  # 모델이 없을 경우 make_model.py 실행
    with open(tomato_model_path, 'rb') as f:
        return joblib.load(f)

basil_model = load_basil_model()
tomato_model = load_tomato_model()

# 수확버튼 누르면 Firebase에서 해당 섹터의 데이터를 전부 가져옴
def update_sensor_data():
    try:
        # Firebase에서 모든 데이터를 가져옴 (timestamp 기준으로 정렬해서 데이터를 가져옴)
        sensor_data_snapshot = firebase_ref.order_by_key().get()

        newData = {
            '토양습도': [],
            '온도': [],
            '주당 물주기횟수': []
        }
        
        if sensor_data_snapshot:
            print("Firebase에서 모든 데이터 가져옴:")
            # Firebase에서 모든 데이터를 가져옴 (timestamp 기준으로 정렬해서 데이터를 가져옴)
            for weeks, data in sensor_data_snapshot.items():
                print(f"Weeks: {weeks}, Data: {data}")

                # 데이터가 존재하는지 확인하고 newData에 추가
                if 'avgSoilHumidity' in data:
                    newData['토양습도'].append(data['avgSoilHumidity'])
                if 'avgTemperature' in data:
                    newData['온도'].append(data['avgTemperture'])
                #물주기양넣는 부분
                    newData['주당 물주기횟수'].append(data['pumpCnt'])

            print(newData)  # 가져온 데이터 출력
        else:
            print("Firebase에 사용할 데이터가 없습니다.")

            # 10초마다 반복
            time.sleep(10)
    except Exception as e:
        print("Firebase 데이터 가져오기 오류:", str(e))
    return newData

@app.route('/predict/<species>', methods=['POST'])
def predict(species):
    try:
        # 요청에서 데이터 가져오기
        data = request.json
        print("받은 데이터: ", data)

        # 요청 데이터에 작물종류를 포함하도록 함.
        print("작물종류: ", species)

        # 입력값을 pandas DataFrame으로 변환
        features = pd.DataFrame([data['features']], columns=['토양습도', '온도'])
        print("받은 특징: ", features)


        # species에 따라 모델 선택 및 예측 수행
        if species == 'bazil':
            prediction = basil_model.predict(features)
        elif species == 'tomato':
            prediction = tomato_model.predict(features)
        else:
            return jsonify({'error': 'Invalid species'}), 400

        # 결과 반환
        return jsonify({'prediction': prediction[0]})
    except Exception as e:
        print("에러", str(e))
        return jsonify({'error': str(e)}), 400


# end-point로 update를 추가하여 updating_model.py를 실행하도록 한다
@app.route('/update', methods=['POST'])
def update_model():
    try:
        # update_model.py 파일을 실행
        result = subprocess.run(['python3', 'updating_model.py'], capture_output=True, text=True)

        # 실행 결과 출력
        if result.returncode == 0:
            print("업데이트 성공: ", result.stdout)
            return jsonify({'message': '모델 업데이트 성공', 'output': result.stdout}), 200
        else:
            print("업데이트 실패: ", result.stderr)
            return jsonify({'error': '모델 업데이트 실패', 'output': result.stderr}), 500

    except Exception as e:
        print("업데이트 오류: ", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)