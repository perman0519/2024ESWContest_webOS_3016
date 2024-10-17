#define LED_PIN 8
#define WATERPUMP_PIN 9

unsigned long pumpStartTime = 0;
bool isPumpRunning = false;
const unsigned long PUMP_DURATION = 5000; // 5 seconds in milliseconds

void setup() {
  Serial.begin(115200); // PC와의 통신을 위한 시리얼 포트
  Serial.flush();
  Serial.println("Arduino Ready");
  pinMode(LED_PIN, OUTPUT);
  pinMode(WATERPUMP_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);  // 초기 상태는 LED 꺼짐
  digitalWrite(WATERPUMP_PIN, LOW);  // 초기 상태는 LED 꺼짐
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // 앞뒤 공백 제거
    if (command == "LED_ON") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED_ON_OK");
    } else if (command == "LED_OFF") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED_OFF_OK");
    } else if (command == "WATERPUMP_ON") {
      startPump();
    }
  }

  checkPumpStatus();
}

void startPump() {
  if (!isPumpRunning) {
    digitalWrite(WATERPUMP_PIN, HIGH);
    isPumpRunning = true;
    pumpStartTime = millis();
    Serial.println("WATERPUMP_ON_OK");
  }
}

void stopPump() {
  digitalWrite(WATERPUMP_PIN, LOW);
  isPumpRunning = false;
  Serial.println("WATERPUMP_AUTO_OFF");
}

void checkPumpStatus() {
  if (isPumpRunning && (millis() - pumpStartTime >= PUMP_DURATION)) {
    stopPump();
  }
}
