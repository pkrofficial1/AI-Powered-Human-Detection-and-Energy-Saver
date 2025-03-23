# AI-Powered-Human-Detection-and-Energy-Saver ⚡🔌..🔥🔥

https://youtu.be/Aj5DD1BrBq0 - Watch full video


![Screenshot 2025-03-23 102428](https://github.com/user-attachments/assets/8484715a-fe32-45aa-8f7b-e8dbf9ad9d7d)
![Screenshot 2025-03-23 102449](https://github.com/user-attachments/assets/a3d989c3-27d4-40ef-9ef8-6e43e90102d5)
![Screenshot 2025-03-23 102438](https://github.com/user-attachments/assets/d311fdb5-fbe6-4ab5-abad-44922815205b)
![Screenshot 2025-03-23 102516](https://github.com/user-attachments/assets/8f7b8524-09a5-464b-89c1-6f2c1c991e93)
![Screenshot 2025-03-23 102526](https://github.com/user-attachments/assets/f99de6bb-4654-40e7-a7b7-028ca37ef8e5)
![Screenshot 2025-03-23 102526](https://github.com/user-attachments/assets/f99de6bb-4654-40e7-a7b7-028ca37ef8e5)
![Screenshot 2025-03-23 102546](https://github.com/user-attachments/assets/8e143b2e-68a3-4260-a1c2-06e6286b8f56)
![Screenshot 2025-03-23 102535](https://github.com/user-attachments/assets/be244ec2-d146-4772-a622-11efd626d5d7)



![Screenshot 2025-03-23 101209](https://github.com/user-attachments/assets/1d9232b0-c242-42f8-b076-82fea3a81fb0)



Overview

This project uses AI to detect humans in a room via a mobile phone camera (IP Webcam) and automates appliances using MQTT communication with an ESP32 microcontroller.
Features

    Human Detection: Uses YOLOv4 for real-time human detection.

    Automation: Turns appliances on when a human is detected, turns them off after 3 minutes of no activity.

    Remote Monitoring: Uses MQTT for real-time updates.

    Front-end UI: Developed with React and TypeScript .

Hardware & Software Requirements

    Hardware:

        ESP32

        Relay module

        Appliances (e.g., Fan, Lights)

    Software:

        Python (OpenCV, NumPy, paho-mqtt)

        React.js + TypeScript

        IP Webcam App (Android)

        HiveMQ/Mosquitto MQTT broker

Installation & Setup
1. Set Up IP Webcam on Mobile

    Install IP Webcam from the Play Store.

    Open the app, scroll down, and tap Start Server.

    Note your device’s IP address (e.g., 192.168.1.100:8080).
   

3. Run the Python Human Detection Script

    Install dependencies:

         pip install opencv-python numpy paho-mqtt

    Run the script and enter your mobile’s IP address when prompted:

           python human_detection.py

    Replace your MQTT URL inside human_detection.py:

           MQTT_BROKER = "your_mqtt_broker_url"
   
3. Set Up the Frontend (React + TypeScript + vite)

    Install : 
                 cd frontend  
                 npm install  

    and Replace your MQTT URL inside service/mqtt.ts

    Add MQTT functionality to React to display real-time detection status.
   

5. Deploy on ESP32

    Upload the ESP32 firmware (4Relay_hivemqtt_final.ino) using Arduino IDE.
   

Usage

    Start the IP Webcam app.

    Run human_detection.py to detect humans.

    Open the frontend UI to see real-time updates.

Future Improvements

    Enhance AI detection using TensorFlow.

    Integrate voice commands.




