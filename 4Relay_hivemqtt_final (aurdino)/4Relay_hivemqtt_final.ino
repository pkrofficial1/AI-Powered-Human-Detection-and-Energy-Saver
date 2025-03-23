#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// Wi-Fi credentials
char ssid[32] = "";           // Default Wi-Fi name
char password[64] = "";       // Default Wi-Fi password

// MQTT Broker details (HiveMQ)
char mqtt_broker[100] = "";  // Buffer for MQTT broker URL
char mqtt_username[50] = ""; // Buffer for MQTT username
char mqtt_password[50] = ""; // Buffer for MQTT password
const int mqtt_port = 8883;
const char *topic = "bedroom_1"; // Keep the topic the same if required

// Relay pins
const int relayPins[4] = {12, 14, 27, 26};

// Switch pins
const int switchPins[4] = {15, 0, 4, 16};

// Previous switch states
int previousStates[4] = {LOW, LOW, LOW, LOW};

// Previous relay states (to restore after "humans detected")
int previousRelayStates[4] = {LOW, LOW, LOW, LOW};

// Push button for hotspot mode
const int buttonPin = 13;

// LED pin
const int ledPin = 2;

// Hotspot details
const char *ap_ssid = "IOT_HOME";
const char *ap_password = "12345678";

// Flags and timers
bool isHotspotMode = false;
unsigned long hotspotStartTime = 0;
const unsigned long hotspotTimeout = 120000; // 2 minutes in milliseconds

// Objects
WiFiClientSecure espClient;
PubSubClient client(espClient);
WebServer server(80);
Preferences preferences;
bool wifiStatusLogged = false;
bool ledInitialized = false;

// Callback for MQTT messages
void callback(char *topic, byte *payload, unsigned int length) {
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println("MQTT Message: " + message);

    // Control relays via MQTT
    if (message.equals("LED 1 ON")) {
        digitalWrite(relayPins[0], HIGH);
        Serial.println("Relay 1 (LED 1 ) turned ON");
    } else if (message.equals("LED 1 OFF")) {
        digitalWrite(relayPins[0], LOW);
        Serial.println("Relay 1 (LED 1) turned OFF");
    } else if (message.equals("LED 2 ON")) {
        digitalWrite(relayPins[1], HIGH);
        Serial.println("Relay 2 (LED 2) turned ON");
    } else if (message.equals("LED 2 OFF")) {
        digitalWrite(relayPins[1], LOW);
        Serial.println("Relay 2 (LED 2) turned OFF");
    } else if (message.equals("Fan 1 ON")) {
        digitalWrite(relayPins[2], HIGH);
        Serial.println("Relay 3 (Fan 1) turned ON");
    } else if (message.equals("Fan 1 OFF")) {
        digitalWrite(relayPins[2], LOW);
        Serial.println("Relay 3 (Fan 1) turned OFF");
    } else if (message.equals("LED 3 ON")) {
        digitalWrite(relayPins[3], HIGH);
        Serial.println("Relay 4 (LED 3 ) turned ON");
    } else if (message.equals("LED 3 OFF")) {
        digitalWrite(relayPins[3], LOW);
        Serial.println("Relay 4 (LED 3) turned OFF");
    } else if (message.equals("turn off all appliances")) {
        // Save the current state of the relays
        for (int i = 0; i < 4; i++) {
            previousRelayStates[i] = digitalRead(relayPins[i]);
        }
        // Turn off all relays
        for (int i = 0; i < 4; i++) {
            digitalWrite(relayPins[i], LOW);
        }
        Serial.println("All appliances turned OFF");
    } else if (message.equals("humans detected")) {
        // Restore the previous state of the relays
        for (int i = 0; i < 4; i++) {
            digitalWrite(relayPins[i], previousRelayStates[i]);
        }
        Serial.println("Previous state of appliances restored");
    }
}

// Start hotspot mode
void startHotspot() {
    WiFi.softAP(ap_ssid, ap_password);
    IPAddress IP = WiFi.softAPIP();
    Serial.println("Hotspot started. Connect to:");
    Serial.println("SSID: " + String(ap_ssid));
    Serial.println("Password: " + String(ap_password));
    Serial.println("Access the webpage at: http://" + IP.toString());

    isHotspotMode = true;
    hotspotStartTime = millis();

    // Serve the configuration webpage
    server.on("/", handleRoot);
    server.on("/update_wifi", handleUpdateWifi);
    server.on("/update_mqtt", handleUpdateMqtt);
    server.begin();
}

// Stop hotspot mode
void stopHotspot() {
    WiFi.softAPdisconnect(true);
    server.stop();
    isHotspotMode = false;
    Serial.println("Hotspot stopped.");
}

// Initialize relays and switches
void initializeHardware() {
    for (int i = 0; i < 4; i++) {
        pinMode(relayPins[i], OUTPUT);
        digitalWrite(relayPins[i], HIGH); // Ensure all relays are OFF initially (HIGH for active-low relays)

        pinMode(switchPins[i], INPUT_PULLUP);
    }

    pinMode(buttonPin, INPUT_PULLUP);
    pinMode(ledPin, OUTPUT);
    digitalWrite(ledPin, LOW); // Ensure LED starts off
}

// Handle switches
void handleSwitches() {
    for (int i = 0; i < 4; i++) {
        int currentState = digitalRead(switchPins[i]);
        if (currentState != previousStates[i]) {
            digitalWrite(relayPins[i], currentState == LOW ? HIGH : LOW);
            previousStates[i] = currentState;

            Serial.printf("Switch %d state changed: %s\n", i + 1, currentState == LOW ? "ON" : "OFF");
        }
    }
}

// Serve the configuration webpage
// Serve the configuration webpage
void handleRoot() {
    unsigned long remainingTime = hotspotTimeout - (millis() - hotspotStartTime);
    int seconds = remainingTime / 1000;

    String html = R"(
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hiomate Configuration</title>
            <style>
                /* Global Styles */
                body {
                    font-family: 'Consolas', 'Courier New', monospace;
                    margin: 0;
                    padding: 0;
                    background: #1e1e1e; /* Dark background */
                    color: #d4d4d4; /* Light text */
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* Container */
                .container {
                    background: #252526; /* Dark container */
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
                    width: 90%;
                    max-width: 500px;
                    border: 1px solid #3c3c3c; /* Subtle border */
                }

                /* Logo */
                .logo {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .logo img {
                    width: 180px;
                    opacity: 0;
                    animation: fadeIn 1s ease forwards;
                }

                /* Headings */
                h1 {
                    color: #569cd6; /* Developer blue */
                    text-align: center;
                    margin-bottom: 1.5rem;
                    font-size: 1.8rem;
                    font-weight: 600;
                    opacity: 0;
                    animation: fadeIn 1s ease 0.2s forwards;
                }

                h2 {
                    color: #569cd6; /* Developer blue */
                    margin: 1.5rem 0 1rem;
                    font-size: 1.3rem;
                    border-bottom: 2px solid #3c3c3c;
                    padding-bottom: 0.5rem;
                }

                /* Countdown */
                .countdown {
                    text-align: center;
                    font-size: 1.1rem;
                    color: #ce9178; /* Orange for alerts */
                    margin-bottom: 1.5rem;
                    padding: 0.8rem;
                    background: rgba(206, 145, 120, 0.1);
                    border-radius: 8px;
                    opacity: 0;
                    animation: fadeIn 1s ease 0.4s forwards;
                }

                /* Forms */
                form {
                    opacity: 0;
                    animation: fadeIn 1s ease 0.6s forwards;
                }

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #d4d4d4;
                    font-weight: 500;
                }

                input[type="text"], input[type="password"] {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 1.2rem;
                    border: 2px solid #3c3c3c;
                    border-radius: 4px;
                    font-size: 1rem;
                    background: #333333;
                    color: #d4d4d4;
                    transition: all 0.3s ease;
                }

                input[type="text"]:focus, input[type="password"]:focus {
                    border-color: #569cd6;
                    outline: none;
                    box-shadow: 0 0 8px rgba(86, 156, 214, 0.3);
                }

                input[type="submit"] {
                    width: 100%;
                    padding: 12px;
                    background: #569cd6;
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                input[type="submit"]:hover {
                    background: #4a8bc2;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(86, 156, 214, 0.3);
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
            <script>
                function updateCountdown() {
                    let seconds = )" + String(seconds) + R"(;
                    const countdownElement = document.getElementById('countdown');
                    const interval = setInterval(() => {
                        seconds--;
                        countdownElement.textContent = '⏳ Time remaining: ' + seconds + ' seconds';
                        if (seconds <= 0) {
                            clearInterval(interval);
                            countdownElement.textContent = '🔌 Hotspot will turn off shortly...';
                        }
                    }, 1000);
                }
                window.onload = updateCountdown;
            </script>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMTAwIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkNvbnNvbGFzIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNTY5Y2Q2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+SGlvbWF0ZTwvdGV4dD48L3N2Zz4=" 
                         alt="Hiomate Logo">
                </div>
                <h1>Configuration Panel</h1>
                <div class="countdown" id="countdown">⏳ Time remaining: )" + String(seconds) + R"( seconds</div>
                
                <h2>📶 Wi-Fi Settings</h2>
                <form action="/update_wifi" method="POST">
                    <label for="ssid">Network Name (SSID):</label>
                    <input type="text" id="ssid" name="ssid" required>
                    
                    <label for="password">Wi-Fi Password:</label>
                    <input type="password" id="password" name="password" required>
                    
                    <input type="submit" value="💾 Save Wi-Fi Settings">
                </form>

                <h2>📡 MQTT Configuration</h2>
                <form action="/update_mqtt" method="POST">
                    <label for="mqtt_broker">Broker Address:</label>
                    <input type="text" id="mqtt_broker" name="mqtt_broker" required>
                    
                    <label for="mqtt_username">Username:</label>
                    <input type="text" id="mqtt_username" name="mqtt_username">
                    
                    <label for="mqtt_password">Password:</label>
                    <input type="password" id="mqtt_password" name="mqtt_password">
                    
                    <input type="submit" value="💾 Save MQTT Settings">
                </form>
            </div>
        </body>
        </html>
    )";
    server.send(200, "text/html", html);
}

// Handle Wi-Fi form submission
void handleUpdateWifi() {
    String newSSID = server.arg("ssid");
    String newPassword = server.arg("password");

    // Save new Wi-Fi credentials to Preferences
    preferences.putString("wifi_ssid", newSSID);
    preferences.putString("wifi_password", newPassword);

    // Update global variables
    newSSID.toCharArray(ssid, sizeof(ssid));
    newPassword.toCharArray(password, sizeof(password));

    server.send(200, "text/plain", "Wi-Fi credentials updated. Restarting...");
    delay(1000);
    ESP.restart();
}

// Handle MQTT form submission
void handleUpdateMqtt() {
    String newMQTTBroker = server.arg("mqtt_broker");
    String newMQTTUsername = server.arg("mqtt_username");
    String newMQTTPassword = server.arg("mqtt_password");

    // Save new MQTT credentials to Preferences
    preferences.putString("mqtt_broker", newMQTTBroker);
    preferences.putString("mqtt_username", newMQTTUsername);
    preferences.putString("mqtt_password", newMQTTPassword);

    // Update global variables
    newMQTTBroker.toCharArray(mqtt_broker, sizeof(mqtt_broker));
    newMQTTUsername.toCharArray(mqtt_username, sizeof(mqtt_username));
    newMQTTPassword.toCharArray(mqtt_password, sizeof(mqtt_password));

    server.send(200, "text/plain", "MQTT credentials updated. Restarting...");
    delay(1000);
    ESP.restart();
}

void setup() {
    Serial.begin(115200);
    preferences.begin("wifi-config", false);

    initializeHardware();

    // Load saved Wi-Fi credentials
    String savedSSID = preferences.getString("wifi_ssid", ssid);
    String savedPassword = preferences.getString("wifi_password", password);
    String savedMQTTBroker = preferences.getString("mqtt_broker", mqtt_broker);
    String savedMQTTUsername = preferences.getString("mqtt_username", mqtt_username);
    String savedMQTTPassword = preferences.getString("mqtt_password", mqtt_password);

    savedSSID.toCharArray(ssid, sizeof(ssid));
    savedPassword.toCharArray(password, sizeof(password));
    savedMQTTBroker.toCharArray(mqtt_broker, sizeof(mqtt_broker));
    savedMQTTUsername.toCharArray(mqtt_username, sizeof(mqtt_username));
    savedMQTTPassword.toCharArray(mqtt_password, sizeof(mqtt_password));

    if (savedSSID.length() > 0) {
        WiFi.begin(ssid, password);
        unsigned long startAttemptTime = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
            delay(500);
            Serial.print(".");
        }
        Serial.println();

        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("Connected to Wi-Fi: " + String(WiFi.SSID()));
            digitalWrite(ledPin, HIGH); // Turn on LED
            delay(5000);               // Keep LED on for 5 seconds
            digitalWrite(ledPin, LOW); // Turn off LED
            ledInitialized = true;
        } else {
            Serial.println("Failed to connect to saved Wi-Fi. Press button to configure.");
        }
    } else {
        Serial.println("No saved Wi-Fi credentials. Press button to configure.");
    }

    // Set up MQTT
    espClient.setInsecure(); // For HiveMQ, bypass certificate validation
    client.setServer(mqtt_broker, mqtt_port);
    client.setCallback(callback);

    if (WiFi.status() == WL_CONNECTED) {
        if (client.connect("ESP32Client", mqtt_username, mqtt_password)) {
            Serial.println("Connected to MQTT broker.");
            client.subscribe(topic);
            Serial.println("Subscribed to topic: " + String(topic));
        } else {
            Serial.println("Failed to connect to MQTT broker.");
        }
    }
}

void loop() {
    if (isHotspotMode) {
        server.handleClient();
        // Stop hotspot after timeout
        if (millis() - hotspotStartTime > hotspotTimeout) {
            stopHotspot();
        }
    } else {
        client.loop();
        handleSwitches();

        // Check Wi-Fi connection
        if (WiFi.status() != WL_CONNECTED) {
            if (!wifiStatusLogged) {
                Serial.println("Wi-Fi not connected. Press button for configuration.");
                wifiStatusLogged = true;
            }

            // Flicker LED
            static unsigned long lastToggleTime = 0;
            static bool ledState = LOW;
            if (millis() - lastToggleTime > 250) { // Toggle every 250ms
                ledState = !ledState;
                digitalWrite(ledPin, ledState);
                lastToggleTime = millis();
            }
        } else if (!wifiStatusLogged) {
            Serial.println("Connected to Wi-Fi: " + String(WiFi.SSID()));
            wifiStatusLogged = true;
        }

        // Check for button press to start hotspot mode
        if (digitalRead(buttonPin) == LOW) {
            Serial.println("Button pressed. Starting hotspot mode...");
            startHotspot();
        }
    }
}