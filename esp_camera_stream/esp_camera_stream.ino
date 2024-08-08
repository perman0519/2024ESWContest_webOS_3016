#include "camera_stream.hpp"
#include "env.h"

// Not tested with this model
//#define CAMERA_MODEL_WROVER_KIT

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); //disable brownout detector
 
  Serial.begin(115200);
  Serial.setDebugOutput(false);
  
  StreamServer server;

  if (server.camera_init() != ESP_OK)
  {
    Serial.print("\nCamera init failed with error");
    return ;
  }
  // Wi-Fi connection
  if (server.wifi_conn() == false)
  {
    Serial.printf("wifi connect failed!\n");
    return ;
  }

  if (server.start() == false)
  {
    Serial.printf("start failed!\n");
    return ;
  }
}

void loop() {
  delay(10000);
}