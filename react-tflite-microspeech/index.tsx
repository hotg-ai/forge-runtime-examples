import { useState } from "react";
import ReactDOM from "react-dom";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";

import 'react-voice-recorder/dist/index.css';

registerBackend(backend());

const forgeConfig: Parameters = {
    apiKey: "3a2b6c45d78259514ad707f8516f2ab40eab1585",
    deploymentId: 28,
    baseURL: "https://dev-forge.hotg.ai",
    telemetry: {
        baseURL: "https://dev-telemetry.hotg.ai",
    },
};

type RecordingData = {
    url: string,
    blob: Blob,
    chunks: Blob[],
    duration: { h: number, m: number, s: number, ms: number },
};

const ctx = new AudioContext({ sampleRate: 16000 });

export default function App() {
    const [result, setResult] = useState<OutputValue[] | undefined>();
    const [recording, setRecording] = useState(false);
    const forge = useForge(forgeConfig);

    const start = () => {
        
    }

    const handleStop = async (data: RecordingData) => {
        const buffer = await data.blob.arrayBuffer();
        const decoded = await ctx.decodeAudioData(buffer);
        console.log(decoded);
    };

    return (
        <div className="App">
            <button disabled={forge.state != "loaded"} onClick={() => start()}>Record</button>
            <p>Recording: {recording}</p>
            <p>Forge State: {forge.state}</p>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
