import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from collections import deque
import time
import os
import generated.sign_language_pb2 as signlanguage_pb2

try:
    from tensorflow.keras import mixed_precision
    mixed_precision.set_global_policy('mixed_float16')
    print("Mixed precision enabled.")
except ImportError:
    print("Mixed precision not available.")

class RecognitionService:
    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.sequence = deque(maxlen=30)
        self.sentence = []
        self.threshold = 0.8
        self.previous_action = None
        self.actions = np.array(['hello', 'father', 'mother', 'deaf', 'no', 'love', "help", "please", "more", "thankyou"])
        self.model = self.load_model()

    def load_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Conv1D(64, kernel_size=3, activation='relu', padding='same', input_shape=(30, 1662)),
            tf.keras.layers.MaxPooling1D(pool_size=2),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.Conv1D(128, kernel_size=3, activation='relu', padding='same'),
            tf.keras.layers.MaxPooling1D(pool_size=2),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation('relu'),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.Bidirectional(tf.keras.layers.GRU(256, return_sequences=True)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation('relu'),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(512, return_sequences=True)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation('relu'),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.LSTM(256, return_sequences=True),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation('relu'),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.LSTM(128, return_sequences=False),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation('relu'),
            tf.keras.layers.Dropout(0.3),

            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(self.actions.shape[0], activation='softmax')
        ])

        # Compile the model
        model.compile(optimizer='adam',
                    loss='categorical_crossentropy',
                    metrics=['accuracy'])

        # Load the weights
        model.load_weights('./models/LSTM_refined2.h5')
        return model
    
    def RecognizeSignLanguage(self, frame):
        """
        Recognize actions from a single frame (numpy array).
        Returns a string representing the recognized action.
        """
        try:
            # Mediapipe processing
            with self.mp_holistic.Holistic(min_detection_confidence=0.8, min_tracking_confidence=0.95) as holistic:
                _, results = self.mediapipe_detection(frame, holistic)
                keypoints = self.extract_keypoints(results)
                self.sequence.append(keypoints)
                self.sequence = self.sequence[-30:]  # Keep only the last 30 frames

                # Predict when we have a complete sequence
                if len(self.sequence) == 30:
                    res = self.model.predict(np.expand_dims(self.sequence, axis=0))[0]
                    action = self.get_action(res)
                    return action

            return "No action detected."
        except Exception as e:
            return f"Error: {str(e)}"
    
    def UploadVideo(self, request_iterator, context):
        upload_dir = "uploads"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        file_name = f"uploaded_video_{int(time.time())}.mp4"
        video_path = os.path.join(upload_dir, file_name)
        client_id = None  

        with open(video_path, "wb") as video_file:
            for request in request_iterator:
                video_file.write(request.data)
                client_id = request.client_id

        print(f"Video saved at {video_path}")
        print(f"Client ID: {client_id}")

        txtPath = self.process_video(video_path)
        print(txtPath)

        with open(txtPath, "rb") as f:
            txt_chunk = f.read()
            
        os.remove(txtPath)

        return signlanguage_pb2.RecognitionFileResult(
            client_id=client_id,  # Trả lại client_id đã nhận
            txt_chunk=txt_chunk  # Gửi kết quả dạng bytes
        )

    def process_video(self, video_path):
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print("Error: Could not open video.")
            exit()

        # Set target FPS
        target_fps = 5
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = max(int(video_fps / target_fps), 1)
        frame_count = 0

        # Verify GPU usage
        print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))

        # Define TensorFlow prediction function with @tf.function for optimization
        @tf.function
        def predict_action(input_sequence):
            return self.model(input_sequence, training=False)

        # Open file to write predictions
        fileName = f"predictions_{int(time.time())}.txt"
        pathFile = os.path.join("uploads", fileName)
        with open(pathFile, 'w') as f:
            with self.mp_holistic.Holistic(min_detection_confidence=0.8, min_tracking_confidence=0.8, static_image_mode=False) as holistic:
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break

                    if frame_count % frame_interval != 0:
                        frame_count += 1
                        continue

                    frame = cv2.resize(frame, (640, 360))
                    image, results = self.mediapipe_detection(frame, holistic)

                    # Extract keypoints
                    keypoints = self.extract_keypoints(results)
                    self.sequence.append(keypoints)

                    if len(self.sequence) == 30:
                        # Convert sequence to numpy array and expand dimensions for batch
                        input_sequence = np.expand_dims(np.array(self.sequence), axis=0).astype(np.float16)  # Use float16 if mixed precision

                        # Make prediction
                        res = predict_action(input_sequence)[0].numpy()

                        # Decode prediction
                        action = self.actions[np.argmax(res)]
                        confidence = res[np.argmax(res)]

                        if confidence > self.threshold and action != self.previous_action:
                            current_frame = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
                            f.write(f"Frame {current_frame}: {action}, Confidence: {confidence}\n")
                            previous_action = action

                            if not self.sentence or action != self.sentence[-1]:
                                self.sentence.append(action)

                        if len(self.sentence) > 5:
                            self.sentence = self.sentence[-5:]

                    frame_count += 1

        cap.release()
        cv2.destroyAllWindows()
        os.remove(video_path)
        return pathFile

    def mediapipe_detection(self, image, model):
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
        image.flags.writeable = False                   # Improve performance
        results = model.process(image)                  # Make prediction
        image.flags.writeable = True                    # Restore image
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) # Convert back to BGR
        return image, results

    def extract_keypoints(self, results):
        pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33 * 4)
        face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468 * 3)
        lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)
        rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)
        return np.concatenate([pose, face, lh, rh])

    def get_action(self, predictions):
        """
        Predict action based on model output and return a string result.
        """
        if predictions[np.argmax(predictions)] > self.threshold:
            return self.actions[np.argmax(predictions)]
        return "Unknown"