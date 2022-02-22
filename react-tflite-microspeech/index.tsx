import "@tensorflow/tfjs"; // Register tfjs kernels

import { useEffect, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import ReactDOM from "react-dom";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";

// Tell forge to use the tflite model handler
registerBackend(backend());

const forgeConfig: Parameters = {
    deploymentId: "8c3f4d0f-3ba3-4666-9b55-d56997d4c666",
    apiKey: "3f9ba92084b788c6fff42f8720ee86124c5f3034",
    baseURL: "https://prd-us-east-1-forge.hotg.ai",
    telemetry: {
        baseURL: "https://prd-us-east-1-telemetry.hotg.ai",
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
            <p>Press record and stop recording after saying your phrase :)</p>
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
