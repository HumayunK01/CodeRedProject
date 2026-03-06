import glob
import json
import os

import cv2
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models

# Configuration
IMG_SIZE = (64, 64) # Smaller size for the Gatekeeper (faster, focuses on global features)
BATCH_SIZE = 32
EPOCHS = 10
DATA_DIR = 'data/cell_images'
MODEL_SAVE_PATH = 'models/gatekeeper_autoencoder.h5'
METADATA_PATH = 'models/metadata.json'

print("="*60)
print("TRAINING GATEKEEPER MODEL (Autoencoder for OOD Detection)")
print("="*60)

def load_data(data_dir, img_size, max_images=4000):
    """Load a subset of the NIH dataset to train the autoencoder"""
    images = []

    # We load both classes, as both are "valid" blood smears
    for cls_name in ['Parasitized', 'Uninfected']:
        path = os.path.join(data_dir, cls_name)
        files = glob.glob(os.path.join(path, '*'))

        # Take a subset to make training lightning fast
        subset_files = files[:max_images // 2]
        print(f"Loading {len(subset_files)} images from {cls_name}...")

        for file_path in subset_files:
            try:
                img = cv2.imread(file_path)
                if img is None: continue
                img = cv2.resize(img, img_size)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = img.astype('float32') / 255.0
                images.append(img)
            except Exception:
                pass

    X = np.array(images, dtype=np.float32)
    np.random.shuffle(X)
    return X

# Load data
print("\n📁 Loading Data...")
X = load_data(DATA_DIR, IMG_SIZE)
print(f"✅ Loaded {len(X)} images into the Gatekeeper training pool.")

X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)

# Build the Autoencoder
# An autoencoder compresses the image into a small vector, then tries to reconstruct it.
# If we give it a random picture (like a cat), it will fail to compress/reconstruct it properly
# because it has only ever learned how to reconstruct pink blood cells.
print("\n🧠 Building the Gatekeeper Autoencoder...")

inputs = tf.keras.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))

# Encoder (Compress)
x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
x = layers.MaxPooling2D((2, 2), padding='same')(x)
x = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(x)
x = layers.MaxPooling2D((2, 2), padding='same')(x)

# Bottleneck (The compressed representation)
# Decoder (Reconstruct)
x = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(x)
x = layers.UpSampling2D((2, 2))(x)
x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(x)
x = layers.UpSampling2D((2, 2))(x)
outputs = layers.Conv2D(3, (3, 3), activation='sigmoid', padding='same')(x)

autoencoder = models.Model(inputs, outputs)
autoencoder.compile(optimizer='adam', loss='mse')

print("\n🚀 Training Gatekeeper on Valid NIH Blood Smears...")
# Note: In an autoencoder, the input (X_train) is also the target (X_train)
history = autoencoder.fit(
    X_train, X_train,
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    validation_data=(X_test, X_test),
    verbose=1
)

print("\n📊 Calculating the Rejection Threshold...")
# Predict on the valid validation set to see the typical error for REAL blood cells
reconstructions = autoencoder.predict(X_test)
# Calculate Mean Squared Error (MSE) for each image
mse = np.mean(np.square(X_test - reconstructions), axis=(1,2,3))

# We set the threshold to the 99th percentile of the validation error.
# Any image with an error higher than this is officially "Out of Distribution" (a random internet picture)
threshold = np.percentile(mse, 99)
print(f"✅ Normal Blood Smear MSE Loss is typically around: {np.mean(mse):.5f}")
print(f"🚧 STRICT GATEKEEPER THRESHOLD SET AT: {threshold:.5f} MSE")

# Save the model
autoencoder.save(MODEL_SAVE_PATH)
print(f"\n💾 Gatekeeper Model saved: {MODEL_SAVE_PATH}")

# Save metadata and the crucial threshold!
metadata = {}
if os.path.exists(METADATA_PATH):
    with open(METADATA_PATH) as f:
        metadata = json.load(f)

metadata['gatekeeper_model'] = {
    'filename': 'gatekeeper_autoencoder.h5',
    'mse_threshold': float(threshold),
    'description': 'Out-of-Distribution Autoencoder to reject random internet images',
    'img_size': IMG_SIZE
}

with open(METADATA_PATH, 'w') as f:
    json.dump(metadata, f, indent=4)
print(f"✅ Updated metadata: {METADATA_PATH}")

print("\n" + "="*60)
print("🎉 GATEKEEPER TRAINING COMPLETE!")
print(f"When a user uploads a photo, it will be rejected if its MSE > {threshold:.5f}")
print("="*60)
