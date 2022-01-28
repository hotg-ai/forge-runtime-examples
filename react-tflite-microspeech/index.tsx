import "@tensorflow/tfjs"; // Register tfjs kernels

import { useEffect, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import ReactDOM from "react-dom";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";

// Tell forge to use the tflite model handler
registerBackend(backend());

const forgeConfig: Parameters = {
    apiKey: "c8b2fa8916040a0daea179b3c2a55edfa8d415c2",
    deploymentId: 4,
    baseURL: "https://stg-forge.hotg.ai",
    telemetry: {
        baseURL: "https://stg-telemetry.hotg.ai",
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

    let button = (status == "recording") ?
        <button onClick={stopRecording}>Stop Recording</button> :
        <button onClick={startRecording} disabled={forge.state != "loaded"}>Start Recording</button>;

    return (
        <div className="App">
            <p>Forge: {forge.state}</p>
            <p>Recorder: {status}</p>
            {button}
            <br />
            <pre>
                <code>{JSON.stringify(outputs, null, 2)}</code>
            </pre>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
