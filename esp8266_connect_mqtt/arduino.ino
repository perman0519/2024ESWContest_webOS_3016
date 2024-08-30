#define LED_PIN 8

void setup() {
  Serial.begin(115200); // PC와의 통신을 위한 시리얼 포트
  Serial.flush();
  Serial.println("Arduino Ready");
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);  // 초기 상태는 LED 꺼짐
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // 앞뒤 공백 제거
    if (command == "ON") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED_ON_OK");
    } else if (command == "OFF") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED_OFF_OK");
    }
  }
}
