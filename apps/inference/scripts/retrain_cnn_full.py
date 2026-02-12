"""
CNN Model Retraining Script - Full Dataset with Augmentation
Uses all 27,558 NIH malaria cell images with proper augmentation
"""
import os
import numpy as np
import cv2
import glob
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import joblib

# Configuration
IMG_SIZE = (128, 128)
BATCH_SIZE = 32
EPOCHS = 12
DATA_DIR = 'data/cell_images'
MODEL_SAVE_PATH = 'models/malaria_cnn_full.h5'
METADATA_PATH = 'models/metadata.json'

print("="*60)
print("CNN RETRAINING - FULL DATASET")
print("="*60)
print(f"Image Size: {IMG_SIZE}")
print(f"Batch Size: {BATCH_SIZE}")
print(f"Epochs: {EPOCHS}")
print(f"Data Directory: {DATA_DIR}")
print("="*60)

# Load all images
def load_full_dataset(data_dir, img_size=(128,128)):
    """Load complete NIH malaria dataset (27,558 images)"""
    images = []
    labels = []
    classes = [('Parasitized', 1), ('Uninfected', 0)]
    
    for cls_name, label in classes:
        path = os.path.join(data_dir, cls_name)
        files = glob.glob(os.path.join(path, '*'))
        print(f"Loading {cls_name}: {len(files)} images...")
        
        for idx, file_path in enumerate(files):
            try:
                img = cv2.imread(file_path)
                if img is None:
                    continue
                img = cv2.resize(img, img_size)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = img.astype('float32') / 255.0
                images.append(img)
                labels.append(label)
                
                if (idx + 1) % 5000 == 0:
                    print(f"  Processed {idx + 1}/{len(files)} images")
            except Exception as e:
                print(f"  Error loading {file_path}: {e}")
                continue
    
    X = np.array(images, dtype=np.float32)
    y = np.array(labels, dtype=np.int32)
    
    # Shuffle dataset
    idx = np.random.permutation(len(X))
    X, y = X[idx], y[idx]
    
    return X, y

# Load full dataset
print("\n📁 Loading Full Dataset...")
X, y = load_full_dataset(DATA_DIR, IMG_SIZE)
print(f"✅ Loaded {len(X)} images")
print(f"   Shape: {X.shape}")
print(f"   Class Distribution: {np.bincount(y)}")

# Train/Test Split (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"\n📊 Dataset Split:")
print(f"   Training: {len(X_train)} images")
print(f"   Testing: {len(X_test)} images")

# Data Augmentation
print("\n🔄 Configuring Data Augmentation...")
train_datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

# No augmentation for test set
test_datagen = ImageDataGenerator()

# Create model
def create_malaria_cnn(input_shape=(128, 128, 3)):
    """Enhanced CNN architecture"""
    model = models.Sequential([
        layers.Conv2D(32, (3,3), activation='relu', padding='same', input_shape=input_shape),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2,2),
        
        layers.Conv2D(64, (3,3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2,2),
        
        layers.Conv2D(128, (3,3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2,2),
        
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid')
    ])
    return model

print("\n🧠 Building Enhanced CNN Model...")
model = create_malaria_cnn()
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)
model.summary()

# Callbacks
callbacks = [
    keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=3,
        restore_best_weights=True
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=2,
        min_lr=1e-6
    )
]

# Train with augmentation
print(f"\n🚀 Training for {EPOCHS} epochs with augmentation...")
history = model.fit(
    train_datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
    steps_per_epoch=len(X_train) // BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=(X_test, y_test),
    callbacks=callbacks,
    verbose=1
)

# Evaluate
print("\n📊 Evaluating Model...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"✅ Test Accuracy: {test_acc*100:.2f}%")
print(f"   Test Loss: {test_loss:.4f}")

# Predictions for metrics
y_pred_probs = model.predict(X_test, verbose=0)
y_pred = (y_pred_probs > 0.5).astype(int).flatten()

# Classification Report
print("\n📋 Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=['Uninfected', 'Parasitized'],
    digits=4
))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print("\n🔢 Confusion Matrix:")
print(cm)

# Calculate metrics
tn, fp, fn, tp = cm.ravel()
precision = tp / (tp + fp) if (tp + fp) > 0 else 0
recall = tp / (tp + fn) if (tp + fn) > 0 else 0
f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

print(f"\n📈 Detailed Metrics:")
print(f"   True Negatives:  {tn}")
print(f"   False Positives: {fp}")
print(f"   False Negatives: {fn}")
print(f"   True Positives:  {tp}")
print(f"   Precision: {precision:.4f}")
print(f"   Recall:    {recall:.4f}")
print(f"   F1-Score:  {f1:.4f}")

# Plot confusion matrix
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Uninfected', 'Parasitized'],
            yticklabels=['Uninfected', 'Parasitized'])
plt.title('Confusion Matrix - Malaria CNN (Full Dataset)')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.savefig('models/confusion_matrix_cnn.png', dpi=150)
print("\n💾 Saved confusion matrix plot: models/confusion_matrix_cnn.png")

# Plot training history
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Accuracy
ax1.plot(history.history['accuracy'], label='Train Accuracy')
ax1.plot(history.history['val_accuracy'], label='Val Accuracy')
ax1.set_title('Model Accuracy')
ax1.set_xlabel('Epoch')
ax1.set_ylabel('Accuracy')
ax1.legend()
ax1.grid(True)

# Loss
ax2.plot(history.history['loss'], label='Train Loss')
ax2.plot(history.history['val_loss'], label='Val Loss')
ax2.set_title('Model Loss')
ax2.set_xlabel('Epoch')
ax2.set_ylabel('Loss')
ax2.legend()
ax2.grid(True)

plt.tight_layout()
plt.savefig('models/training_history_cnn.png', dpi=150)
print("💾 Saved training history: models/training_history_cnn.png")

# Save model
model.save(MODEL_SAVE_PATH)
print(f"\n💾 Model saved: {MODEL_SAVE_PATH}")

# Update metadata
import json
metadata = {}
if os.path.exists(METADATA_PATH):
    with open(METADATA_PATH, 'r') as f:
        metadata = json.load(f)

metadata['cnn_model'] = {
    'filename': 'malaria_cnn_full.h5',
    'accuracy': f'{test_acc*100:.1f}%',
    'precision': f'{precision:.4f}',
    'recall': f'{recall:.4f}',
    'f1_score': f'{f1:.4f}',
    'description': f'Enhanced CNN trained on {len(X)} cell images with augmentation',
    'epochs_trained': len(history.history['accuracy']),
    'train_samples': len(X_train),
    'test_samples': len(X_test)
}

with open(METADATA_PATH, 'w') as f:
    json.dump(metadata, f, indent=4)
print(f"✅ Updated metadata: {METADATA_PATH}")

print("\n" + "="*60)
print("🎉 TRAINING COMPLETE!")
print("="*60)
print(f"Final Test Accuracy: {test_acc*100:.2f}%")
print(f"Model: {MODEL_SAVE_PATH}")
print("="*60)
