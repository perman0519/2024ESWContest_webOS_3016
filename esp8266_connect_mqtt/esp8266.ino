#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>

// Wi-Fi 설정
const char* ssid = "yourssid";
const char* password = "yourpassword";

// MQTT Broker 설정
const char* mqtt_server = "yourmqttserverip";
int mqtt_port = 1883;
const char* mqtt_user = "";
const char* mqtt_password = "";

// 토픽 설정
const char* led_command_topic = "esp32/led/command";
const char* led_status_topic = "esp32/led/status";

SoftwareSerial espSerial(2, 3); // RX, TX

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];
int value = 0;

void setup_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    randomSeed(micros());

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println(message);

    // LED 제어 로직 추가
    if (String(topic) == led_command_topic) {
        if (message == "ON") {
            espSerial.println("ON");
            client.publish(led_status_topic, "ON");
        } else if (message == "OFF") {
            espSerial.println("OFF");
            client.publish(led_status_topic, "OFF");
        }
    }
}

void reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        String clientId = "ESP8266Client-";
        clientId += String(random(0xffff), HEX);
        // MQTT 사용자 인증 추가 가능
        if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
            Serial.println("connected");
            client.publish("outTopic", "hello world");  // 연결 확인 메시지
            client.subscribe(led_command_topic);        // LED 제어 토픽 구독
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    espSerial.begin(115200);
    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
}
