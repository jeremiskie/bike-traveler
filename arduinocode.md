#include <WiFi.h>
#include <WebServer.h>

// WiFi credentials
const char* ssid = "Infinix HOT 60 Pro";
const char* password = "qwerty123";

// Button pins (Make sure your physical wires match pins 18 and 19!)
const int LEFT_BUTTON = 18;
const int RIGHT_BUTTON = 19;

// Web server
WebServer server(80);

// Keep track of last button states for edge detection
bool lastLeftState = HIGH;
bool lastRightState = HIGH;

// Add CORS headers to browser responses
void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.sendHeader("Cache-Control", "no-store");
}

// Handle CORS preflight for /buttons
void handleOptions() {
  addCORSHeaders();
  server.send(204);
}

// Handle GET /buttons request from Next.js
void handleButtons() {
  addCORSHeaders();

  // Read physical button states
  bool leftPressed = (digitalRead(LEFT_BUTTON) == LOW);
  bool rightPressed = (digitalRead(RIGHT_BUTTON) == LOW);

  // Construct JSON response for Next.js
  String json = "{";
  json += "\"left\":" + String(leftPressed ? "true" : "false") + ",";
  json += "\"right\":" + String(rightPressed ? "true" : "false");
  json += "}";

  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LEFT_BUTTON, INPUT_PULLUP);
  pinMode(RIGHT_BUTTON, INPUT_PULLUP);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // ---> CRITICAL FIX FOR LATENCY <---
  WiFi.setSleep(false); // Disables Wi-Fi power saving mode for instant response

  Serial.println("\nConnected!");
  Serial.print("ESP32 IP Address: http://");
  Serial.println(WiFi.localIP());

  server.on("/buttons", HTTP_OPTIONS, handleOptions);
  server.on("/buttons", HTTP_GET, handleButtons);

  server.begin();
  Serial.println("HTTP server started. Ready for button presses!");
}

void loop() {
  // Always keep the web server running to accept requests
  server.handleClient();

  // Read current states
  bool leftState = digitalRead(LEFT_BUTTON);
  bool rightState = digitalRead(RIGHT_BUTTON);

  // Detect falling edge (HIGH -> LOW) meaning button was just pressed down
  if (lastLeftState == HIGH && leftState == LOW) {
    Serial.println("Left button pressed!");
  }

  // Detect falling edge for right button
  if (lastRightState == HIGH && rightState == LOW) {
    Serial.println("Right button pressed!");
  }

  // Save current states for the next loop iteration
  lastLeftState = leftState;
  lastRightState = rightState;

  // Tiny delay to stabilize readings
  delay(10);
}