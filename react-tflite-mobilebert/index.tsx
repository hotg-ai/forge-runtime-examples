import "@tensorflow/tfjs"; // Register tfjs kernels

import { useState } from "react";
import ReactDOM from "react-dom";
import backend from "@hotg-ai/rune-tflite";
import { Parameters, useForge, registerBackend } from "@hotg-ai/forge";

// Tell forge to use the tflite model handler
registerBackend(backend());

const forgeConfig: Parameters = {
    deploymentId: "dcf48f0b-8bec-44bc-bd9f-76a3dca36889",
    apiKey: "dd8af06aa9b215b5ebfd49eedef7f12731133919",
    baseURL: "https://prd-us-east-1-forge.hotg.ai",
    telemetry: {
        baseURL: "https://prd-us-east-1-telemetry.hotg.ai",
    },
};

const defaultQuestion = "Who is the CEO of Google?";
const defaultParagraph = `Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware. It is considered one of the Big Four technology companies, alongside Amazon, Apple, and Facebook.

Google was founded in September 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in California. Together they own about 14 percent of its shares and control 56 percent of the stockholder voting power through supervoting stock. They incorporated Google as a California privately held company on September 4, 1998, in California. Google was then reincorporated in Delaware on October 22, 2002. An initial public offering (IPO) took place on August 19, 2004, and Google moved to its headquarters in Mountain View, California, nicknamed the Googleplex. In August 2015, Google announced plans to reorganize its various interests as a conglomerate called Alphabet Inc. Google is Alphabet's leading subsidiary and will continue to be the umbrella company for Alphabet's Internet interests. Sundar Pichai was appointed CEO of Google, replacing Larry Page who became the CEO of Alphabet.`;

export default function App() {
    const forge = useForge(forgeConfig);
    const [paragraph, setParagraph] = useState(defaultParagraph);
    const [question, setQuestion] = useState(defaultQuestion);
    const [answer, setAnswer] = useState("");

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (forge.state !== "loaded") { return; }

        const [result] = forge.predict({ text: [question, paragraph] });
        setAnswer(result.elements.join("\n"));
    };

    return (
        <div className="App">
            <p>Mobilebert ({forge.state})</p>
            <form>
                <fieldset>
                    <label>
                        <p>Paragraph</p>
                        <textarea
                            name="paragraph"
                            value={paragraph}
                            onChange={e => setParagraph(e.target.value)}
                            style={{ width: "100%" }}
                            rows={10}
                        />
                    </label>
                </fieldset>
                <fieldset>
                    <label>
                        <p>Question</p>
                        <textarea
                            name="question"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </label>
                </fieldset>
                <button type="submit" disabled={forge.state !== "loaded"} onClick={onClick}>Submit</button>
            </form>
            <div>
                <h3>Answer</h3>
                <p>{answer}</p>
            </div>
        </div >
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
