import cv2
import numpy as np

# Load YOLO weights and config
weights_path = "C:\\Users\\PKR\\Desktop\\detecting_people\\yolov4.weights"  # Path to yolov4.weights file
config_path = "C:\\Users\\PKR\\Desktop\\detecting_people\\yolov4.cfg"      # Path to yolov4.cfg file
classes_path = "C:\\Users\\PKR\\Desktop\\detecting_people\\coco.names"    # Path to coco.names file

net = cv2.dnn.readNet(weights_path, config_path)

# Set backend and target
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

# Load COCO class labels
with open(classes_path, "r") as f:
    classes = [line.strip() for line in f.readlines()]

# Get the index of the "person" class
person_idx = classes.index("person")

# Initialize camera
cap = cv2.VideoCapture(0)  # 0 indicates the default camera

# Check if the camera is accessible
if not cap.isOpened():
    print("Error: Unable to access the camera.")
    exit()

# Confidence and NMS thresholds
CONFIDENCE_THRESHOLD = 0.6
NMS_THRESHOLD = 0.3

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Prepare the frame for YOLO
        height, width = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)

        # Run inference
        layer_names = net.getLayerNames()
        output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
        detections = net.forward(output_layers)

        # Initialize human count and bounding boxes
        human_count = 0
        boxes = []
        confidences = []

        # Process detections
        for output in detections:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]

                if class_id == person_idx and confidence > CONFIDENCE_THRESHOLD:  # Confidence threshold
                    # Scale bounding box to original frame size
                    box = detection[0:4] * np.array([width, height, width, height])
                    center_x, center_y, w, h = box.astype("int")
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)

                    boxes.append([x, y, int(w), int(h)])
                    confidences.append(float(confidence))
        
        # Apply non-maxima suppression to remove overlapping boxes
        indices = cv2.dnn.NMSBoxes(boxes, confidences, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
        if len(indices) > 0:
            for i in indices.flatten():
                x, y, w, h = boxes[i]
                confidence = confidences[i]
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, f"{confidence:.2f}", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
                human_count += 1

        # Display human count on the frame
        cv2.putText(frame, f"Humans Detected: {human_count}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # Show the frame
        cv2.imshow("Human Detection", frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    print("Exiting program")

finally:
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
