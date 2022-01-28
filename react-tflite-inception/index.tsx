import "@tensorflow/tfjs"; // Tell tfjs to

import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Webcam from "react-webcam";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend, OutputValue } from "@hotg-ai/forge";

registerBackend(backend());

const forgeConfig: Parameters = {
    deploymentId: 36,
    apiKey: "3a2b6c45d78259514ad707f8516f2ab40eab1585",
    baseURL: "https://dev-forge.hotg.ai",
    telemetry: {
        baseURL: "https://dev-telemetry.hotg.ai",
    }
};

export default function App() {
    const [result, setResult] = useState<OutputValue[]>([]);
    const [image, setImage] = useState<string | undefined>();
    const forge = useForge(forgeConfig);
    const webcamRef = useRef<Webcam | null>(null);

    // We want to re-run the prediction every time our image or the forge object
    // updates.
    useEffect(() => {
        if (image && forge.state === "loaded") {
            const img: HTMLImageElement = new Image();

            img.onload = () => {
                try {
                    const result = forge.predict({ image: [img] });
                    console.log("[Predict]", result);
                    setResult(result);
                } catch (error) {
                    console.log(error);
                }
            }
            img.src = image;
        }
    }, [image, forge]);

    const videoConstraints = {
        width: 400,
        height: 300,
        facingMode: "user",
    };

    // A callback that gets fired whenever the webcam's <video> element fires
    // its "timeupdate" event - roughly every 15-250ms. This is about as close
    // to a "onnextframe" event as we can get.
    // https://stackoverflow.com/questions/17044567/get-frame-change-in-video-html5
    const onTimeUpdated = () => {
        if (forge.state != "loaded") {
            return;
        }
        const screenshot = webcamRef.current?.getCanvas();

        if (screenshot) {
            setImage(screenshot.toDataURL("image/jpeg"));
        }
    };

    const predictions = result.flatMap(v => [...v.elements])
        .map((p, i) => (<li key={i}>{p}</li>));

    return (
        <div className="App">
            <h1>Inception ({forge.state})</h1>
            <Webcam
                audio={false}
                height={videoConstraints.height}
                width={videoConstraints.width}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onTimeUpdate={onTimeUpdated}
            />
            <ul>{predictions}</ul>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
