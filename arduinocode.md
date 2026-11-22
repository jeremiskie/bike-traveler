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

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(HALL_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(HALL_PIN), handleHallInterrupt, FALLING);

  lastUpdateMs = millis();
  Serial.println("ESP32 Bike Speedometer Ready (Serial Monitor in km/h)");
}

void loop() {
  unsigned long nowMs = millis();

  if (nowMs - lastUpdateMs >= SPEED_UPDATE_INTERVAL_MS) {
    // Safely read pulse count from ISR
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
}