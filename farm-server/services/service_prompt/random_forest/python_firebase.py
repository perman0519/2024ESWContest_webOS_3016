from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
import firebase_admin
from firebase_admin import credentials, db
import threading
import time

app = Flask(__name__)

# Firebase database 인증 및 앱 초기화
cred = credentials.Certificate('./smartfarm.json')  # Firebase auth key setting
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smartfarm-ddbc3-default-rtdb.firebaseio.com' #real DB url
})

#Realtime Database reference
firebase_ref = db.reference('sector/0/sensorData') #임시

#model loading
#model = joblib.load('stacked_model.pkl')

with open('stacked_model.pkl', 'rb') as f:
    model = joblib.load(f)

# 수확버튼 누르면 Firebase에서 해당 섹터의 데이터를 전부 가져옴
def update_sensor_data():
    try:
        # Firebase에서 모든 데이터를 가져옴 (timestamp 기준으로 정렬해서 데이터를 가져옴)
        sensor_data_snapshot = firebase_ref.order_by_key().get()

        newData = {
            '온도': [],
            '토양습도': [],
            '물주기양': []
        }
        
        if sensor_data_snapshot:
            print("Firebase에서 모든 데이터 가져옴:")
            # Firebase에서 모든 데이터를 가져옴 (timestamp 기준으로 정렬해서 데이터를 가져옴)
            for timestamp, data in sensor_data_snapshot.items():
                print(f"Timestamp: {timestamp}, Data: {data}")

                # 데이터가 존재하는지 확인하고 newData에 추가
                if 'temperature' in data:
                    newData['온도'].append(data['temperature'])
                if 'soil_humidity' in data:
                    newData['토양습도'].append(data['soil_humidity'])
                #물주기양넣는 부분
                    newData['물주기양'].append(100)
                    
            print(newData)  # 가져온 데이터 출력
        else:
            print("Firebase에 사용할 데이터가 없습니다.")

            # 10초마다 반복
            time.sleep(10)
    except Exception as e:
        print("Firebase 데이터 가져오기 오류:", str(e))
    return newData

#update_sensor_data()


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 요청에서 데이터 가져오기
        data = request.json
        print("받은 데이터: ", data)



        # 입력값을 pandas DataFrame으로 변환
        features = pd.DataFrame([data['features']], columns=['온도', '토양습도'])
        print("받은 특징: ", features)


        # 예측 수행
        prediction = model.predict(features)

        # 결과 반환
        return jsonify({'prediction': prediction[0]})
    except Exception as e:
        print("에러", str(e))
        return jsonify({'error': str(e)}), 400

#추론외에 일정시간주기로, fireBase에 직접 접근하는 API 추가


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)