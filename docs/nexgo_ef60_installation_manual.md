# Installation Manual: Shopro POS on NEXGO EF60 Terminal

This manual provides step-by-step instructions for deploying the Shopro POS application onto a physical **NEXGO EF60** dual-screen terminal.

## Prerequisites
- **POS Source Code**: Access to the `shopro-pos-flutter` directory.
- **Hardware**: Physical NEXGO EF60 terminal + USB-C data cable.
- **Tools**: Flutter SDK + Android SDK Platform Tools (`adb`) installed on a Linux development machine.

---

## 1. Generating the Application Package (APK)
Before installation, you must build a signed or release version of the application.

1. Navigate to the project root:
   ```bash
   cd shopro-pos-flutter
   ```
2. Build the release APK:
   ```bash
   flutter build apk --release
   ```
3. Locate the build artifact at:  
   `build/app/outputs/flutter-apk/app-release.apk`

---

## 2. Preparing the NEXGO Terminal
Hardware terminals are typically locked down. You must enable Developer Options to allow sideloading via ADB.

1. On the terminal, navigate to **Settings** > **About Terminal**.
2. Locate the **Build Number** and tap it **7 times** quickly. 
   - *Message: "You are now a developer!" should appear.*
3. Go back one level to **System** > **Developer Options**.
4. Toggle **USB Debugging** to **ON**.

---

## 3. Physical Installation via ADB (Linux)
1. Connect the NEXGO EF60 to your Linux machine via the side-mounted **USB-C port**.
2. Open a terminal on your machine and verify the device is detected:
   ```bash
   adb devices
   ```
   - *Accept the "Allow USB Debugging" prompt on the terminal screen if it appears.*
3. Install the APK:
   ```bash
   adb install -r build/app/outputs/flutter-apk/app-release.apk
   ```
   - *The `-r` flag ensures existing data is preserved and the app is updated safely.*

---

## 4. Hardware Post-Installation Verification
Once installed, the Shopro POS needs to communicate with the inboard components (Printer & Cutter).

### Printer Initialization
The application uses the **NEXGO Device Service** (internal). Upon first launch:
- Accept any permission requests for **Hardware Access**.
- If the printer does not initialize, ensure no other application is currently holding the "Device Engine" lock.

### Troubleshooting Hardware
To monitor hardware-level communication for the printer and cutter in real-time:
```bash
adb logcat -s NEXGO
```
Look for these log signatures:
- `NEXGO: Printer initialized: true`
- `NEXGO: Print Job Sent...`

---

## 5. Summary of Automated Features
After successful installation, the following hardware actions will occur automatically:
- **Receipt Printing**: Triggered instantly after any successful Payment (Card, Cash, MiPay).
- **Paper Cutting**: Automatic physical cut at the end of every receipt print.
- **Dual Screen Support**: The customer display (480x480) will automatically mirror pertinent transaction data for guest transparency.
