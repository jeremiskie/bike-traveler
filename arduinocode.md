#include <WiFi.h>
#include <WebServer.h>

// WiFi credentials (your phone hotspot)
const char* ssid = "Infinix HOT 60 Pro";
const char* password = "qwerty123";

// Button pins (wired to GND using INPUT_PULLUP)
const int LEFT_BUTTON = 18;
const int RIGHT_BUTTON = 19;

// Hall sensor digital output pin
const int HALL_PIN = 27;

// Bike wheel calibration
const float WHEEL_CIRCUMFERENCE_M = 2.10; // Measure your wheel's rolled distance (in meters)
const int PULSES_PER_REV = 1;            // Set to >1 if multiple triggers happen per 1 full turn

// Anti-double-count debounce window (microseconds)
// 50,000 us = 50 ms helps stop a single magnet pass from counting twice
const unsigned long MIN_PULSE_INTERVAL_US = 50000;

// How often speed is calculated and printed to Serial Monitor (milliseconds)
const unsigned long SPEED_UPDATE_INTERVAL_MS = 250;

// Sanity filter to ignore wild double-trigger spikes on a bike
const float MAX_PLAUSIBLE_SPEED_KMH = 85.0;

// Web server on port 80
WebServer server(80);

// Keep track of last button states for edge detection
bool lastLeftState = HIGH;
bool lastRightState = HIGH;

// Shared variables modified inside the interrupt
volatile unsigned long lastPulseMicros = 0;
volatile unsigned long totalPulses = 0;

// Speed & timing state used in loop()
unsigned long lastUpdateMs = 0;
unsigned long lastSampledPulses = 0;
float currentSpeedKmh = 0.0;

// Runs on falling edge (HIGH -> LOW) when magnet passes the Hall sensor
void IRAM_ATTR handleHallInterrupt() {
  unsigned long now = micros();
  unsigned long elapsed = now - lastPulseMicros;

  if (lastPulseMicros == 0 || elapsed >= MIN_PULSE_INTERVAL_US) {
    lastPulseMicros = now;
    totalPulses++;
  }
}

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

  bool leftPressed = (digitalRead(LEFT_BUTTON) == LOW);
  bool rightPressed = (digitalRead(RIGHT_BUTTON) == LOW);

  noInterrupts();
  unsigned long pulsesSnapshot = totalPulses;
  interrupts();

  String json = "{";
  json += "\"left\":" + String(leftPressed ? "true" : "false") + ",";
  json += "\"right\":" + String(rightPressed ? "true" : "false") + ",";
  json += "\"speed_kmh\":" + String(currentSpeedKmh, 2) + ",";
  json += "\"pulses\":" + String(pulsesSnapshot);
  json += "}";

  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LEFT_BUTTON, INPUT_PULLUP);
  pinMode(RIGHT_BUTTON, INPUT_PULLUP);
  pinMode(HALL_PIN, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(HALL_PIN), handleHallInterrupt, FALLING);

  // Connect to phone hotspot
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Disable Wi-Fi power saving mode for instant response
  WiFi.setSleep(false);

  Serial.println("\nConnected!");
  Serial.print("ESP32 IP Address: http://");
  Serial.println(WiFi.localIP());

  server.on("/buttons", HTTP_OPTIONS, handleOptions);
  server.on("/buttons", HTTP_GET, handleButtons);

  server.begin();
  Serial.println("HTTP server started. Ready for button presses and bike speed!");

  lastUpdateMs = millis();
}

void loop() {
  // Keep the web server running to accept requests
  server.handleClient();

  // Read current button states
  bool leftState = digitalRead(LEFT_BUTTON);
  bool rightState = digitalRead(RIGHT_BUTTON);

  // Detect falling edge (HIGH -> LOW) for left button
  if (lastLeftState == HIGH && leftState == LOW) {
    Serial.println("Left button pressed!");
  }

  // Detect falling edge (HIGH -> LOW) for right button
  if (lastRightState == HIGH && rightState == LOW) {
    Serial.println("Right button pressed!");
  }

  lastLeftState = leftState;
  lastRightState = rightState;

  // Calculate and print bike speed in km/h at fixed intervals
  unsigned long nowMs = millis();
  if (nowMs - lastUpdateMs >= SPEED_UPDATE_INTERVAL_MS) {
    noInterrupts();
    unsigned long pulsesNow = totalPulses;
    interrupts();

    unsigned long deltaPulses = pulsesNow - lastSampledPulses;
    float elapsedSec = (nowMs - lastUpdateMs) / 1000.0;

    float measuredSpeedKmh = 0.0;
    if (deltaPulses > 0 && elapsedSec > 0.0) {
      float distanceMeters = (deltaPulses / (float)PULSES_PER_REV) * WHEEL_CIRCUMFERENCE_M;
      measuredSpeedKmh = (distanceMeters / elapsedSec) * 3.6;

      // Ignore implausible spikes caused by leftover double-counts
      if (measuredSpeedKmh > MAX_PLAUSIBLE_SPEED_KMH) {
        measuredSpeedKmh = currentSpeedKmh;
      }
    }

    // Light smoothing so readings don't jump around sharply
    currentSpeedKmh = (0.4 * measuredSpeedKmh) + (0.6 * currentSpeedKmh);
    if (currentSpeedKmh < 0.2) {
      currentSpeedKmh = 0.0;
    }

    lastSampledPulses = pulsesNow;
    lastUpdateMs = nowMs;

    Serial.print("Speed: ");
    Serial.print(currentSpeedKmh, 2);
    Serial.print(" km/h | Total Pulses: ");
    Serial.println(pulsesNow);
  }

  delay(5);
}