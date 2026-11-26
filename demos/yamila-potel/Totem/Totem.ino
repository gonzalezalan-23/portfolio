const int pirPin = 2;          // Pin digital conectado al sensor PIR
unsigned long motionStartTime = 0;
bool motionDetectedState = false;
const unsigned long REQUIRED_TIME = 3000; // 3 segundos en milisegundos
const unsigned long COOLDOWN_TIME = 5000; // 5 segundos de espera para evitar disparos en bucle
unsigned long lastTriggerTime = 0;

void setup() {
  pinMode(pirPin, INPUT);
  Serial.begin(9600); // Velocidad de comunicación serie
}

void loop() {
  unsigned long currentMillis = millis();
  int pirState = digitalRead(pirPin);

  // Si estamos en período de enfriamiento (cooldown), ignoramos el sensor temporalmente
  if (currentMillis - lastTriggerTime < COOLDOWN_TIME) {
    return;
  }

  if (pirState == HIGH) {
    if (!motionDetectedState) {
      // El movimiento acaba de empezar
      motionDetectedState = true;
      motionStartTime = currentMillis;
    } else {
      // El movimiento es constante; verificamos si ya pasaron los 3 segundos
      if (currentMillis - motionStartTime >= REQUIRED_TIME) {
        Serial.println("TRIGGER"); // Enviamos la señal clave a la PC
        lastTriggerTime = currentMillis; // Marcamos el tiempo del disparo
        motionDetectedState = false;     // Reiniciamos estado
      }
    }
  } else {
    // Si el PIR baja a LOW, se interrumpió el movimiento
    motionDetectedState = false;
  }
}