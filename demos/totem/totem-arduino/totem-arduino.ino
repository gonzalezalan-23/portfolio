const int pirPin = 7;
unsigned long motionStartTime = 0;
bool motionDetectedState = false;
bool waitingForClear = false; // Evita disparos en bucle si el sensor sigue en HIGH

const unsigned long REQUIRED_TIME = 3000; // 3 segundos de presencia
const unsigned long COOLDOWN_TIME = 5000; // 5 segundos de espera mínima
unsigned long lastTriggerTime = 0;

void setup() {
  pinMode(pirPin, INPUT);
  Serial.begin(9600);
  
  // Los sensores PIR reales necesitan entre 10 y 30 segundos para calibrar el infrarrojo ambiental
  delay(5000); 
  Serial.println("INICIO_OK");
}

void loop() {
  unsigned long currentMillis = millis();
  int pirState = digitalRead(pirPin);

  // 1. Si ya disparó, esperamos a que el sensor baje a LOW al menos una vez
  if (waitingForClear) {
    if (pirState == LOW) {
      waitingForClear = false; // El sensor se liberó, ya puede volver a detectar
    }
    return;
  }

  // 2. Respetamos el tiempo de enfriamiento entre audios
  if (currentMillis - lastTriggerTime < COOLDOWN_TIME) {
    return;
  }

  // 3. Lógica de detección sostenida por 3 segundos
  if (pirState == HIGH) {
    if (!motionDetectedState) {
      motionDetectedState = true;
      motionStartTime = currentMillis;
    } else if (currentMillis - motionStartTime >= REQUIRED_TIME) {
      Serial.println("TRIGGER");
      lastTriggerTime = currentMillis;
      motionDetectedState = false;
      waitingForClear = true; // Bloqueamos hasta que el sensor deje de detectar
    }
  } else {
    motionDetectedState = false;
  }
}



