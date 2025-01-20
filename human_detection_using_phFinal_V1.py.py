import cv2
import numpy as np
from threading import Thread
import paho.mqtt.client as mqtt
import time

# Threaded camera class
class VideoStream:
    def __init__(self, src=0):
        self.stream = cv2.VideoCapture(src)
        self.grabbed, self.frame = self.stream.read()
        self.stopped = False

    def start(self):
        Thread(target=self.update, args=(), daemon=True).start()
        return self

    def update(self):
        while not self.stopped:
            if not self.grabbed:
                self.stop()
            self.grabbed, self.frame = self.stream.read()

    def read(self):
        return self.frame

    def stop(self):
        self.stopped = True
        self.stream.release()

# MQTT details
MQTT_BROKER = "8a0a7fdd26ea49d9a68b562661833f05.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_TOPIC = "humans"
MQTT_USERNAME = "qwerty"
MQTT_PASSWORD = "Test@1234"

# TLS MQTT Configuration
MQTT_TLS = True

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

# Initialize MQTT client
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

if MQTT_TLS:
    mqtt_client.tls_set()

mqtt_client.on_connect = on_connect
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

# Load YOLO weights, config, and class labels
weights_path = "C:\\Users\\PKR\\Desktop\\detecting_people\\yolov4.weights"
config_path = "C:\\Users\\PKR\\Desktop\\detecting_people\\yolov4.cfg"
classes_path = "C:\\Users\\PKR\\Desktop\\detecting_people\\coco.names"

net = cv2.dnn.readNet(weights_path, config_path)

# Set backend and target
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

# Load COCO class labels
with open(classes_path, "r") as f:
    classes = [line.strip() for line in f.readlines()]

person_idx = classes.index("person")

# Initialize camera with phone IP Webcam
phone_camera_url = "http://192.168.137.76:8080/video"
cap = VideoStream(src=phone_camera_url).start()

# Confidence and NMS thresholds
CONFIDENCE_THRESHOLD = 0.6
NMS_THRESHOLD = 0.3

# Frame resizing for faster processing
TARGET_WIDTH = 640

# Variable to track the time of last human detection and human count
last_detection_time = None
human_detected = False
last_publish_time = 0

try:
    frame_skip = 2  # Process every 2nd frame
    frame_count = 0

    while True:
        frame = cap.read()
        if frame is None:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        # Resize frame
        height, width = frame.shape[:2]
        scale = TARGET_WIDTH / width
        resized_frame = cv2.resize(frame, (TARGET_WIDTH, int(height * scale)))

        # Prepare the frame for YOLO
        blob = cv2.dnn.blobFromImage(resized_frame, 1 / 255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)

        # Run inference
        layer_names = net.getLayerNames()
        output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
        detections = net.forward(output_layers)

        # Initialize human count and bounding boxes
        human_count = 0
        boxes = []
        confidences = []

        for output in detections:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]

                if class_id == person_idx and confidence > CONFIDENCE_THRESHOLD:
                    # Scale bounding box to resized frame
                    box = detection[0:4] * np.array([TARGET_WIDTH, resized_frame.shape[0], TARGET_WIDTH, resized_frame.shape[0]])
                    center_x, center_y, w, h = box.astype("int")
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)

                    boxes.append([x, y, int(w), int(h)])
                    confidences.append(float(confidence))

        # Apply non-maxima suppression
        indices = cv2.dnn.NMSBoxes(boxes, confidences, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
        if len(indices) > 0:
            for i in indices.flatten():
                x, y, w, h = boxes[i]
                confidence = confidences[i]
                cv2.rectangle(resized_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(resized_frame, f"{confidence:.2f}", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
                human_count += 1

        # Check if humans were detected
        current_time = time.time()
        if human_count > 0:
            if not human_detected:
                mqtt_client.publish(MQTT_TOPIC, "humans detected")
                human_detected = True
            last_detection_time = current_time
        else:
            if human_detected and last_detection_time and current_time - last_detection_time > 20:
                mqtt_client.publish(MQTT_TOPIC, "humans not detected")
                mqtt_client.publish(MQTT_TOPIC, "turn off all appliances")
                human_detected = False

        # Publish human count every 5 seconds
        if current_time - last_publish_time >= 5:
            mqtt_client.publish(MQTT_TOPIC, f"Human count: {human_count}")
            last_publish_time = current_time

        # Display human count
        cv2.putText(resized_frame, f"Humans Detected: {human_count}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # Show the frame
        cv2.imshow("Human Detection", resized_frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    print("Exiting program")

finally:
    cap.stop()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    cv2.destroyAllWindows()
