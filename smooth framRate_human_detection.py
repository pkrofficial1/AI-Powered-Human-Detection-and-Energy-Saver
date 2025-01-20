import cv2
import numpy as np
from threading import Thread

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

# Initialize camera
cap = VideoStream(src=0).start()

# Confidence and NMS thresholds
CONFIDENCE_THRESHOLD = 0.6
NMS_THRESHOLD = 0.3

# Frame resizing for faster processing
TARGET_WIDTH = 640

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
    cv2.destroyAllWindows()
