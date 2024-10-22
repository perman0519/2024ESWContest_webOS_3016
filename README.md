# 2024 ESWContest - webOS by 우리42수상한42

## 📚 Index
- [Client](./client/README.md)
- [farm-server](./farm-server/README.md)
- [esp_part](./esp_part/README.md)

## 🌿 Features
#### 🌱 Subscribe to Your Preferred Plants by Sector 🌱
> Users can subscribe to grow their desired plants in different sectors of the smart farm.

#### 📹 Real-time Monitoring via Web App 📹
> Through the web app, users can check the status of the smart farm in real-time using cameras. <br>
> Multiple sensors monitor temperature, humidity, soil moisture, and plant height, and these metrics are visualized in graphs for easy tracking on the dashboard.

#### 💧 Control Irrigation and LED Lighting 💡
> Watering and LED lighting controls are accessible directly through the web app, allowing users to manage their plants remotely.

#### 🎥 Time-lapse of Plant Growth 🎥
> The service offers a time-lapse video feature that captures the entire lifecycle of the plants, from growth to maturity.

#### 🤖 AI-based Plant Care Advice 🌿
> Utilizing generative AI, the platform provides helpful advice on plant care, giving users tailored suggestions to ensure their plants thrive.

## 📜 Prerequisites
* You must have [ares-cli](https://www.webosose.org/docs/tools/sdk/cli/cli-user-guide/#step-02-installing-cli) installed on your PC.
* The installation location for the executable file must be based on [webOS](https://www.webosose.org/).
* Your smart farm environment must be set up (including sensors, LED lights, etc.).

## 💻 Installation

Follow these steps to set up and run the project on your local machine:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/perman0519/2024ESWContest_webOS_3016.git smart_farm
    cd smart_farm
    ```

2. **Build the project**
   > ⚠️ In the deploy.sh shell script, first, write the target_device according to your settings.
   1. **Server**
      ```bash
      cd farm-server
      bash deploy.sh
      ```
   2. **Client**
      ```bash
      cd client
      bash deploy.sh
      ```
3. **Run the program**:
   > You can run the web app on your webOS device.
   1. **Server**
      ```bash
      App Name : farm_dashboard
      ```
      * .env
      ```
      REACT_APP_IP=
      REACT_APP_CAM_WS_PORT=3000
      REACT_APP_SENSOR_WS_PORT=3001
      REACT_APP_HTTP_PORT=8081
      REACT_APP_HTTP2_PORT=8082
      ```
   2. **Client**
      ```bash
      App Name : ClientApp
      ```
      * .env
      ```
      APIKEY=
      AUTH_DOMAIN=
      DATABASE_URL=
      PROJECT_ID=
      STORAGE_BUCKET=
      MESSAGING_SENDER_ID=
      APP_ID=
      MQTT_HOST=
      MQTT_PORT=
      GPT_KEY=
      ```

## 🙌 Collaborator
|<img src="https://avatars.githubusercontent.com/u/58614643?v=4" width="200" height="200"/>|<img src="https://avatars.githubusercontent.com/u/102403228?v=4" width="200" height="200"/>|<img src="https://avatars.githubusercontent.com/u/117874685?v=4" width="200" height="200"/>|<img src="https://avatars.githubusercontent.com/u/115722373?v=4" width="200" height="200"/>|
|:-:|:-:|:-:|:-:|
|[한필호](https://github.com/ph-han)|[송준상](https://github.com/perman0519)|[이상민](https://github.com/sanglee2)|[구혁모](https://github.com/siru02)|
