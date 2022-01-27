import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:example/labels.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:runevm_fl/forge.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as ImageLib;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn't reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Forge demo'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  //Load forge

  const MyHomePage({Key? key, required this.title}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  dynamic _capabilities = {};
  dynamic _output = "";
  Uint8List? inputData;
  Uint8List? outputData;

  void _runInference() async {
    Uint8List inputImageData = convertImage(inputData!, _capabilities[0]);
    final data = await Forge.predict([inputImageData]);
    final out = (data is String) ? json.decode(data) : data;
    List<int> scores = List<int>.from(out["elements"]);
    _output = getTop5(scores);

    setState(() {
      // This call to setState tells the Flutter framework that something has
      // changed in this State, which causes it to rerun the build method below
      // so that the display can reflect the updated values. If we changed
      // _counter without calling setState(), then the build method would not be
      // called again, and so nothing would appear to happen.
    });
  }

  @override
  void initState() {
    super.initState();
    loadForge();
    loadInputImage();
  }

  void loadForge() async {
    final answer = await Forge.forge({
      "deploymentId": "29",
      "apiKey": "9cdee7a1aa490f9846314b16bdbbb42430d435f9",
      "baseURL": "https://dev-forge.hotg.ai",
      "telemetry": {
        "baseURL": "https://dev-telemetry.hotg.ai",
      }
    });
    setState(() {
      _capabilities = answer;
    });
  }

  loadInputImage() async {
    final client = http.Client();
    final response = await client.get(Uri.parse(
        "https://images.unsplash.com/photo-1602241628512-459cdd3234fe?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=512&q=80"));
    client.close();
    setState(() {
      inputData = response.bodyBytes;
    });
  }

  static Uint8List convertImage(Uint8List data, dynamic parameters) {
    ImageLib.Image decodedImage = ImageLib.copyResizeCropSquare(
        ImageLib.decodeImage(data)!, parameters["width"]);

    List<int> thumb = ImageLib.writePng(decodedImage);

    //remove alpha channel & int to float
    List<int> input = [];
    int c = 0;
    if (parameters["pixel_format"] == 2) {
      Uint8List bytes = decodedImage.getBytes();
      for (int c = 0; c < bytes.lengthInBytes; c += 4) {
        input.add(((bytes[c] + bytes[c + 1] + bytes[c + 2]) / 3).round());
      }
    } else {
      for (int b in decodedImage.getBytes()) {
        c++;
        if (c % 4 != 0) {
          input.add(b);
        }
      }
    }
    return Uint8List.fromList(input);
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: (!Forge.loaded)
            ? const CircularProgressIndicator()
            : ListView(
                // Column is also a layout widget. It takes a list of children and
                // arranges them vertically. By default, it sizes itself to fit its
                // children horizontally, and tries to be as tall as its parent.
                //
                // Invoke "debug painting" (press "p" in the console, choose the
                // "Toggle Debug Paint" action from the Flutter Inspector in Android
                // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
                // to see the wireframe for each widget.
                //
                // Column has various properties to control how it sizes itself and
                // how it positions its children. Here we use mainAxisAlignment to
                // center the children vertically; the main axis here is the vertical
                // axis because Columns are vertical (the cross axis would be
                // horizontal).

                children: <Widget>[
                  Text(
                    'Rune capabilities: $_capabilities',
                  ),
                  (inputData != null)
                      ? Image.memory(inputData!)
                      : const Text("Loading input image"),
                  const Text(
                    'Rune output:',
                  ),
                  (_output != null)
                      ? Text("$_output")
                      : const Text("No output"),
                  Container(
                    height: 20,
                  ),
                  TextButton(
                      style: ButtonStyle(
                          backgroundColor:
                              MaterialStateProperty.all<Color>(Colors.blue)),
                      onPressed: () {
                        _runInference();
                      },
                      child: const Text(
                        "Run",
                        style: TextStyle(color: Colors.white),
                      ))
                ],
              ),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
