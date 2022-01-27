# CartoonGan Example

Flutter Implementation of Cartoongan rune for iOS/Android/Web

![Screenshot](screenshot.jpg?raw=true "Screenshot")

## Running the app

### Web
```
    flutter run -d Chrome --release
```

### iOS (Runtime not supported for XCode Simulator on x86)
```
    flutter run -d <connected ios device> --release
```

### Android 
```
    flutter run -d <connected android device or simulator> --release
```

## Getting Started

### This project started from a clean flutter boilerplate

```
    flutter create project example
```

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://flutter.dev/docs/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://flutter.dev/docs/cookbook)

For help getting started with Flutter, view our
[online documentation](https://flutter.dev/docs), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

### Add the rune/forge dependency to pubspec.yaml under dependencies

pubspec.yaml 

```
    dependencies:
        flutter:
            sdk: flutter
        runevm_fl: ^0.3.0
```

and run 

```
    flutter pub get
```

#### for Web, add the runevm cdn to your web/index.html head section:
```html
  <title>example</title>
  <link rel="manifest" href="manifest.json">
  <script src="https://rune-registry.web.app/vm/runevm.js"></script>
</head>
```

#### for iOS bump the minimum version of iOS to 12.1

Minimum iOS version should be at least 12.1 to be compatible with the plugin:

Set this in XCode > Runner > General > Deployment info

### init Forge with a deployed Rune

First step is to initialise Forge and deploy model

```dart

import 'package:runevm_fl/runevm_fl.dart';

void loadForge() async {
  final answer = await Forge.forge({
    "deploymentId": "26", //insert  deploymentId here
    "apiKey": "{apiKey from forge}", //insert  apiKey here
    "baseURL": "https://dev-forge.hotg.ai", //insert  url here
    "telemetry": {
      "baseURL": "https://dev-telemetry.hotg.ai", //insert  url here
    }
  });
  setState(() {
    _capabilities = answer;
  });
}

```

To run inference imply provide to output to Forge.predict(Uint8List input)
```dart

  void _runInference() async {
    Uint8List inputData = getInputData();
    final data = await Forge.predict([inputData]);
    final out = (data is String) ? json.decode(data) : data;
    doSomethingWithOutput(out);
  }

```

