#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define WIFI_AP "42 Guest" // Access point 
#define WIFI_PASSWORD "WeL0ve42Seoul" //password
#define TOKEN "- 이예제에서는 사용안함" //thingsboard device token

int ledPin = 13;
int sensorPin = A0;
int value1; // 센서에서 나온값 저장용
int value2; //매핑용
char data[80]; //publishing 할때 사용

char thingsboardServer[] = "10.19.220.146"; // thingsboard server ip

WiFiClient wifiClient;
PubSubClient client(wifiClient);

int status = WL_IDLE_STATUS;
unsigned long lastSend;

void setup() {
  Serial.begin(115200);
  delay(10);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  //Wifi접속
  InitWiFi();
  
  //thingsboard 설정 or MQTT broker 
  client.setServer(thingsboardServer, 1883);
  
  // MQTT borker 설정

  lastSend = 0;
}

void loop() {
  //wifi, 서버 접속, 적어도 한번은 실행된다.
  if( !client.connected()){
    reconnect();
  }

  //센서 데이터를 일정 간격으로 취득
  if(millis() - lastSend > 10000) { //1000은 1초
    //센서 데이터 처리
    getAndSendData();
    lastSend = millis();
  }
  client.loop();
  //delay(5000);
}

void getAndSendData(){
  //sensor data 취득하기
  Serial.println("Collecting sensor data.");
  value1 = analogRead(sensorPin);
  value2 = map(value1, 1023, 0, 0, 100);

  //시리얼모니터 출력
  Serial.println("Mositure : " + String(value1));
  Serial.println(String(value2) + "%"); //우리가 알고 있는 습도의 %가 아니다.^^
  
  //send data
  digitalWrite(ledPin, HIGH);
  //전송할 데이터를 json 타입으로 가공하기
  String payload = "{";
  payload += "\"humidity\" : ";
  payload += value1;
  payload += ",";
  payload += "\"humidity2\" : ";
  payload += value2;
  payload += "%";
  payload += "}";
 
  payload.toCharArray(data, (payload.length() + 1));
  client.publish("Sensor/soil_humidity", data);
  digitalWrite(ledPin, LOW);
}

void InitWiFi(){
  Serial.println();//시리얼모니터창에 보기 좋게 줄을 바꿈
  Serial.println();
  Serial.println("Connectiong to AP ...");
  // attempt to connect to WiFi network
  WiFi.begin(WIFI_AP, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.println(".");
  }
  // 접속이 되면 출력
  Serial.println();
  Serial.println("Connected to AP");
  //접속 정보를 출력
  Serial.println(WiFi.localIP());
}

void reconnect(){
  //네트워크 접속
  while (!client.connected()){
    status = WiFi.status();
    if( status != WL_CONNECTED) {
      WiFi.begin(WIFI_AP, WIFI_PASSWORD);
      while(WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.println(".");
       }
      Serial.println("Connected to AP again");
     }
      //thingsboard에도 재접속 시도
      Serial.println("Connecting to server ...");
      if( client.connect("ESP8266 Device", TOKEN, NULL) ) {
        Serial.println("Done");
        } else {
        Serial.println("Failed rc = ");
        Serial.println(client.state() );
        Serial.println(" : retrying in 5 seconds");
        delay(500);
      }
  }
}
