import "core-js"; // we need to polyfill things like Array.at()

import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Webcam from "react-webcam";
import { layers, tidy, div, relu6, add, serialization, mul } from "@tensorflow/tfjs"
import backend from "@hotg-ai/rune-tfjs-v2";
import { Parameters, ForgeHook, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";



registerBackend(backend)

export class HardSigmoid extends layers.Layer {
    static get className() {
        return 'HardSigmoid';
    }
    call(input: any) {
        return tidy(() => div(relu6(add(input, 3.0)), 6.0));
    }
    computeOutputShape(inputShape: any) {
        return inputShape;
    }
}
serialization.registerClass(HardSigmoid);

export class HardSwish extends layers.Layer {
    static get className() {
        return 'hardSwish';
    }
    call(input: any) {
        return tidy(() => {
            const hardSig = new HardSigmoid();
            return mul(input, hardSig.call(input));
        });
    }
    computeOutputShape(inputShape: any) {
        return inputShape;
    }
}
serialization.registerClass(HardSwish);


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
    deploymentId: parseInt(deploymentId), // <--- Rune holds the model
    // onLoadCallback: () => {}  When there is update
    baseURL: "https://dev-enterprise-proxy.hotg.ai",
    telemetry: {
        baseURL: "https://dev-enterprise-proxy.hotg.ai",
    },
    backend: "enterprise"
};


export default function App() {
    const [result, setResult] = useState<OutputValue[] | undefined>();
    const [image, setImage] = useState<string | undefined>();
    const forge = useForge(forgeConfig);
    const webcamRef = useRef<Webcam | null>(null);

    // We want to re-run the prediction every time our image or the forge object
    // updates.
    useEffect(() => {

        if (image && forge.state === "loaded") {
            const img: HTMLImageElement = new Image();

            img.onload = () => {
                img.crossOrigin = "Anonymous";
                if (img.src) {

                    // Forge should also provide the model
                    try {
                        // debugger;
                        const result = forge.predict({ floatImage: [img] });

                        setResult(result);
                    } catch (error) {
                        console.log(error)
                    }
                }

            }
            img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Ford_Transit_Custom_300_Base_2.0_facelift.jpg/1920px-2018_Ford_Transit_Custom_300_Base_2.0_facelift.jpg";
            // 
            // 
        }
    }, [image, forge]);

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user",
    };

    // A callback that gets fired whenever the webcam's <video> element fires
    // its "timeupdate" event - roughly every 15-250ms. This is about as close
    // to a "onnextframe" event as we can get.
    // https://stackoverflow.com/questions/17044567/get-frame-change-in-video-html5
    const onTimeUpdated = () => {
        const screenshot = webcamRef.current?.getCanvas();

        if (screenshot) {
            setImage(screenshot.toDataURL("image/jpeg"));
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <Webcam
                    audio={false}
                    height={640}
                    width={800}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onTimeUpdate={onTimeUpdated}
                />

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
