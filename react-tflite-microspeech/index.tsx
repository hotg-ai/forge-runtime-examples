import "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import ReactDOM from "react-dom";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";

registerBackend(backend());

const forgeConfig: Parameters = {
    apiKey: "3a2b6c45d78259514ad707f8516f2ab40eab1585",
    deploymentId: 28,
    baseURL: "https://dev-forge.hotg.ai",
    telemetry: {
        baseURL: "https://dev-telemetry.hotg.ai",
    },
};

export default function App() {
    const forge = useForge(forgeConfig);
    const {
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
    } = useReactMediaRecorder({ audio: true });
    const [outputs, setOutputs] = useState<OutputValue[]>([]);

    useEffect(() => {
        if (forge.state == "loaded") {
            fetch(mediaBlobUrl)
                .then(r => r.arrayBuffer())
                .then(buffer => new AudioContext().decodeAudioData(buffer))
                .then(source => {
                    // The Microspeech rune expects 1000ms of audio at 16kHz
                    // so we need to resample it.
                    const ctx = new OfflineAudioContext(source.numberOfChannels, 16000, 16000);
                    var offlineSource = ctx.createBufferSource();
                    offlineSource.buffer = source;
                    offlineSource.connect(ctx.destination);
                    offlineSource.start();
                    return ctx.startRendering();
                })
                .then(audio => {
                    const outputs = forge.predict({ audio: [audio] });
                    setOutputs(outputs);
                });
        }
    }, [mediaBlobUrl]);

    let button;

    if (status == "recording") {
        button = (
            <button onClick={stopRecording}>Stop Recording</button>
        );
    } else {
        button = (
            <button onClick={startRecording} disabled={forge.state != "loaded"}>Start Recording</button>
        );
    }

    return (
        <div className="App">
            <p>Forge: {forge.state}</p>
            <p>Recorder: {status}</p>
            {button}
            <br />
            <pre>
                <code>
                    {JSON.stringify(outputs, null, 2)}
                </code>
            </pre>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
