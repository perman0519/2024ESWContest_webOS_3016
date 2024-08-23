#include "camera_stream.hpp"

StreamServer::StreamServer()
{
  Serial.println("stream server constructor");
}

StreamServer::~StreamServer()
{
  Serial.println("stream server destructor");
}

esp_err_t  StreamServer::camera_init()
{
  camera_config_t config;
  set_camera_config(config);
  
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  
  return err;
}

bool  StreamServer::wifi_conn()
{
  int cnt = 0;

  uint64_t chipid = ESP.getEfuseMac();
  Serial.println("chip id : " + String(chipid, HEX));
  String esp_ap_name = "ESP32_" + String(chipid, HEX);
  
  WiFiManager wifiManager;

  wifiManager.resetSettings();
  if (wifiManager.autoConnect(esp_ap_name.c_str()) == false)
  {
    Serial.println("WiFiManager auto connect failed!");
    ESP.restart();
  }

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    cnt++;
    if (cnt >= 100)
      return false;
  }

  Serial.println("");
  Serial.println("WiFi connected");
  return true;
}

bool   StreamServer::start()
{
  client.poll();
  camera_fb_t *fb = esp_camera_fb_get();
  if(!fb)
  {
    esp_camera_fb_return(fb);
    return false;
  }

  if(fb->format != PIXFORMAT_JPEG) { return false; }

  client.sendBinary((const char*) fb->buf, fb->len);
  esp_camera_fb_return(fb);

  Serial.println("Camera Streaming..");
  return true;
}

bool StreamServer::stop()
{
  if (client.isOpen()) {
    Serial.println("Disconnecting from WebSocket server...");
    client.close();
  }
  return true;
}

void StreamServer::onEventsCallback(websockets::WebsocketsEvent event, String data)
{
    if(event == websockets::WebsocketsEvent::ConnectionOpened)
    {
      Serial.println("Connection Opened");
    }
    else if(event == websockets::WebsocketsEvent::ConnectionClosed)
    {
      Serial.println("Connection Closed");
      ESP.restart();
    }
    else if(event == websockets::WebsocketsEvent::GotPing)
    {
      Serial.println("Got a Ping!");
    }
    else if(event == websockets::WebsocketsEvent::GotPong)
    {
      Serial.println("Got a Pong!");
    }
}

void StreamServer::onMessageCallback(websockets::WebsocketsMessage message)
{
  Serial.print("web socket Message: ");
  Serial.println(message.data());
}

bool StreamServer::ws_server_conn(const char *server_host, const uint16_t server_port)
{
  client.onMessage(onMessageCallback);
  client.onEvent(onEventsCallback);
  bool connected = client.connect(server_host, server_port, "/");
  int i = 0;

  while (!connected)
  {
    Serial.println("Waiting for connected Web Socket server.");
    connected = client.connect(server_host, server_port, "/");
    delay(300);
    if (++i > 100)
    {
      Serial.println("Web Socket server connect failed.");
      return false;
    }
  }
  Serial.println("Web Socket server connect.");
  return true;
}

bool StreamServer::check_ws_server_conn()
{
  return client.ping();
}

void StreamServer::set_camera_config(camera_config_t &config)
{
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG; 

  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 40;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 40;
    config.fb_count = 2;
  }
}