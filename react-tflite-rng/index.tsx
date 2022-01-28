import "@tensorflow/tfjs"; // Register tfjs kernels

import { useState } from "react";
import ReactDOM from "react-dom";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";

// Tell forge to use the tflite model handler
registerBackend(backend());

const forgeConfig: Parameters = {
    apiKey: "cfc0a93d40c8291d5eba8f372e8d04382ec600b7",
    deploymentId: 13,
    baseURL: "https://dev-forge.hotg.ai",
    telemetry: {
        baseURL: "https://dev-telemetry.hotg.ai",
    },
};

export default function App() {
    const [result, setResult] = useState<OutputValue[]>([]);
    const forge = useForge(forgeConfig);

    // re-run inference periodically
    setTimeout(() => {
        if (forge.state === "loaded") {
            // Note: no inputs required because it uses Rune's internal RNG
            setResult(forge.predict({}));
        }
    }, 300);

    const randomNumbers = result.flatMap(r => [...r.elements]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Random ({forge.state})</h1>
                <pre>
                    <code>{randomNumbers}</code>
                </pre>
            </header>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
