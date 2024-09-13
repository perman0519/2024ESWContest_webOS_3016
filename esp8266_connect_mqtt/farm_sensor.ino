#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

#define DHTPIN D2
#define SOILPIN A0
#define LEDPIN 13

#define DHTTYPE DHT22

const char* ssid = "LGU+-974B82";
const char* password = "77025701";
const char* mqtt_server = "192.168.100.102";          // broker가 실행되고 있는 주소.

WiFiClient espClient;
PubSubClient client(espClient);

long lastMsg = 0;

float humi, temp;
int   soil_humi;

DHT dht(DHTPIN, DHTTYPE);

void setup() 
{
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() 
{
  delay(10);
  // WiFi 연결 확인하는 부분.
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) 
{
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  for (int i = 0; i < length; i++) 
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // 1 받으면 LED ON
  if ((char)payload[0] == '1') 
  {
    digitalWrite(BUILTIN_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level

  } 
  else 
  {
    digitalWrite(BUILTIN_LED, HIGH);  // Turn the LED off by making the voltage HIGH
  }

}

void reconnect() 
{
  // Loop until we're reconnected
  while (!client.connected()) 
  {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) 
    {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("outTopic", "hello world");
      // ... and resubscribe
      client.subscribe("inTopic");
    } 
    else 
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


float getHumi() 
{                  //DHT22 습도를 받아오는 함수
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) 
  {
    Serial.println("Failed to read from DHT sensor!");
  }

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  return(h);
}

float getTemp() 
{                 //DHT22 온도를 받아오는 함수
  
  float t = dht.readTemperature();

  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println(" *C ");

  return (t);
}

int getSoliHumi()
{
  //sensor data 취득하기
  Serial.println("Collecting sensor data.");
  int value1 = analogRead(SOILPIN);
  int value2 = map(value1, 1023, 0, 0, 100);

  //시리얼모니터 출력
  Serial.println("Mositure : " + String(value1));
  Serial.println(String(value2) + "%"); //우리가 알고 있는 습도의 %가 아니다.^^
  
  //send data
  digitalWrite(LEDPIN, HIGH);

  return (value2);
  
}

void mqtt_publish(float humi, float temp, int soil_humi)
{
  //전송할 데이터를 json 타입으로 가공하기
  String payload = "{";
  char msg[1000];
 
  digitalWrite(LEDPIN, LOW);
  if (!client.connected()) 
  {
    reconnect();
  }
  client.loop();

  long now = millis();

  if (now - lastMsg > 2000) 
  {
    lastMsg = now;

    payload += "\"humidity\" : ";
    payload += String(humi);
    payload += ",";
    payload += "\"temperature\" : ";
    payload += String(temp);
    payload += ",";
    payload += "\"soil_humidity\" : ";
    payload += String(soil_humi);
    payload += "}";
    // packet = "Humidity : " + String(Humi) + "% " + "Temperature : " + String(Temp) + "*C" ; //문자열과 숫자를 합친다.
    payload.toCharArray(msg, payload.length() + 1); //mqtt publishing이 char형으로만 보낼 수 있기때문에 toCharArray로 변환.
    Serial.print("Publish message: ");
    Serial.println(msg);
    client.publish("sensor/all", msg);
  }
  delay(500); //0.5초 단위로 Publishing (조정가능)
}

void loop() 
{
  humi = getHumi(); //습도를 받아서 변수에 입력
  temp = getTemp(); //온도를 받아서 변수에 입력
  soil_humi = getSoliHumi();

  mqtt_publish(humi, temp, soil_humi);// 온습도의 값을 함수에 넣어서 해당 값을 통신을 통해서 전송한다.
}
