import cv2
import mediapipe as mp

# Initialize Mediapipe Pose detector
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# Open the camera (0 for laptop's built-in camera)
cap = cv2.VideoCapture(0)

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Convert the frame to RGB (Mediapipe requires RGB format)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame for human pose detection
        results = pose.process(rgb_frame)

        # Initialize human count
        human_count = 0

        # Check if pose landmarks are detected (indicating a human)
        if results.pose_landmarks:
            human_count = 1  # Mediapipe Pose can detect one person per instance
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # Add human count text to the frame
        cv2.putText(frame, f"Humans Detected: {human_count}", (10, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # Display the frame with pose landmarks if any
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
