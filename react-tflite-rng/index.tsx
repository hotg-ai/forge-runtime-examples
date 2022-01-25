import "core-js"; // we need to polyfill things like Array.at()

import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

import  "@tensorflow/tfjs-tflite"
import backend from "@hotg-ai/rune-tflite";
import { Parameters, ForgeHook, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";



registerBackend(backend())



const apiKey = process.env.REACT_APP_API_KEY;
if (!apiKey) {
    throw new Error(`The "REACT_APP_API_KEY" environment variable wasn't set`);
}
const deploymentId = process.env.REACT_APP_DEPLOYMENT_ID;
if (!deploymentId) {
    throw new Error(
        `The "REACT_APP_DEPLOYMENT_ID" environment variable wasn't set`,
    );
}


const forgeConfig: Parameters = {
    apiKey,
    deploymentId: parseInt(deploymentId),
    baseURL: "https://dev-forge.hotg.ai",
    telemetry: {
        baseURL: "https://dev-telemetry.hotg.ai",
    },
};


export default function App() {
    const [result, setResult] = useState<OutputValue[] | undefined>();
    const forge = useForge(forgeConfig);


    // We want to re-run the prediction every time our image or the forge object
    // updates. 
    setTimeout( () => {
        if (forge.state === "loaded") {
            
            const result = forge.predict({});

            setResult(result);
        }
    }, 300)

    return (
        <div className="App">
            <header className="App-header">

                <Body forge={forge} result={result} />
            </header>
        </div>
    );
}

type BodyProps = {
    forge: ForgeHook;
    result: OutputValue[] | undefined;
};

/**
 * Render a different body depending on whether Forge is loaded or not.
 */
function Body({ forge, result }: BodyProps) {
    switch (forge.state) {
        case "not-loaded":
        case "loading":
            return (
                <div>
                    <p>Loading...</p>
                </div>
            );

        case "loaded":
            const results = result?.map(r =>
                JSON.stringify(r.elements, null, 2),
            );
            return (
                <div>
                    <h3>Result</h3>
                    <pre style={{ textAlign: "left", width: "50vw" }}>
                        {results}
                    </pre>

                </div>
            );

        case "error":
            const { error } = forge;
            const msg = error
                ? `${error.name}: ${error.message}`
                : "An error occurred...";
            const stack = error
                ? `${error.stack}`
                : "Error stack unavailable";

            return (
                <div>
                    <p>{msg}</p>
                    <pre style={{ textAlign: "left", width: "50vw" }}>
                        {stack}
                    </pre>
                </div>
            );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
