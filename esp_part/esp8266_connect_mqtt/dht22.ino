#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

/*
JSON 형식 문자열 생성: packet 변수에서 {"Temperature": , "Humidity": } 형식의 JSON 문자열을 생성.
버퍼 크기 증가: msg 배열의 크기를 100으로 증가시켜 JSON 데이터를 처리.
문자열 변환: toCharArray()를 사용해 JSON 형식의 문자열을 client.publish()에서 사용할 수 있는 char 배열로 변환.
*/

#define DHTPIN D2  // 사용하기로 한 디지털 핀
#define DHTTYPE DHT22

const char* ssid = "42 Guest";
const char* password = "WeL0ve42Seoul";
const char* mqtt_server = "192.168.100.101";  // broker가 실행되고 있는 주소.

WiFiClient espClient;
PubSubClient client(espClient);

long lastMsg = 0;
char msg[100];  // JSON 메시지 크기를 고려해 100으로 설정
String packet;
float Humi, Temp;

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  if ((char)payload[0] == '1') {
    digitalWrite(BUILTIN_LED, LOW);  // LED ON
  } else {
    digitalWrite(BUILTIN_LED, HIGH);  // LED OFF
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      client.publish("outTopic", "hello world");
      client.subscribe("inTopic");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

float getHumi() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
  }

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  return h;
}

float getTemp() {
  float t = dht.readTemperature();
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println(" *C ");
  return t;
}

// JSON 형식으로 데이터 전송
void mqtt_publish(float Humi, float Temp) {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 2000) {
    lastMsg = now;

    // JSON 형식으로 데이터 생성
    packet = "{ \"Temperature\": " + String(Temp) + ", \"Humidity\": " + String(Humi) + " }";
    packet.toCharArray(msg, 100);  // JSON 데이터를 char 배열로 변환
    Serial.print("Publish message: ");
    Serial.println(msg);

    // MQTT로 메시지 발행
    client.publish("Sensor/Temp_Humi", msg);
  }
  delay(500);  // 0.5초 간격으로 발행
}

void loop() {
  Humi = getHumi();  // 습도를 받아서 변수에 입력
  Temp = getTemp();  // 온도를 받아서 변수에 입력

  mqtt_publish(Humi, Temp);  // 온습도 값을 JSON으로 변환해 MQTT로 전송
}
