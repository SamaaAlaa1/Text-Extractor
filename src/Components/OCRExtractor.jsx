import React, { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.js?url";
import { Upload, Clipboard, Trash, Loader, Camera, StopCircle } from "lucide-react";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const OCRExtractor = () => {
    const [image, setImage] = useState(null);
    const [text, setText] = useState("Upload an image or PDF to extract text...");
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    let streamRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setText("Extracting text...");
        setLoading(true);

        if (file.type === "application/pdf") {
            await extractTextFromPDF(file);
            setImage(null);
        } else {
            const imageURL = URL.createObjectURL(file);
            setImage(imageURL);
            await extractTextFromImage(file);
        }

        setLoading(false);
    };


    const extractTextFromImage = async (file) => {
        const worker = await createWorker();
        try {
            await worker.load();
            await worker.loadLanguage("eng+ara+fr");
            await worker.initialize("eng+ara+fr");

            const {
                data: { text },
            } = await worker.recognize(file);

            setText(text || "No text found.");
        } catch (error) {
            setText(`❌ Error extracting image text: ${error.message}`);
        } finally {
            await worker.terminate();
        }
    };

    const extractTextFromPDF = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => item.str).join(" ");
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }

            setText(fullText || "No text found in PDF.");
        } catch (error) {
            setText(`❌ Error extracting PDF text: ${error.message}`);
        }
    };

    const openCamera = async () => {
        try {
            console.log("Checking camera support...");

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not supported on this device.");
            }

            console.log("Requesting camera access...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                },
            });

            if (!videoRef.current) {
                console.warn("videoRef not available, retrying in 500ms...");
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        console.log("Camera stream started after retry");
                    }
                }, 500);
            } else {
                videoRef.current.srcObject = stream;
                console.log("Camera stream started");
            }

            streamRef.current = stream;
            setIsCameraOn(true);
        } catch (error) {
            console.error("Camera access error:", error);
            alert(
                `Camera access denied. Ensure: 
                1️⃣ You're using HTTPS
                2️⃣ You allowed camera access in settings
                3️⃣ Your browser supports getUserMedia`
            );
        }
    };



    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setLoading(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL("image/png");
        setImage(imageDataUrl);

        const imageFile = dataURLtoFile(imageDataUrl, "captured-image.png");

        await extractTextFromImage(imageFile);

        setLoading(false);

        closeCamera();
    };




    const dataURLtoFile = (dataUrl, filename) => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full mt-6 px-4">
            <div className="flex flex-col items-center space-y-4 justify-center w-full md:w-1/2">
                {image ? (
                    <img src={image} alt="Captured" className="w-[600px] rounded-lg shadow-lg border border-gray-600" />
                ) : isCameraOn ? (
                    <div className="flex flex-col items-center">
                        <video ref={videoRef} autoPlay className="w-[500px] border border-gray-400 rounded-lg"></video>
                        <button onClick={captureImage} className="mt-3 bg-blue-600 text-white py-2 px-2 rounded-lg shadow-md hover:bg-blue-900 transition flex">
                            <Camera className="mr-2" size={18} /> Capture Image
                        </button>
                        <button onClick={closeCamera} className="mt-2 bg-[#ffffff11]  py-2 px-4 rounded-lg shadow-md hover:bg-[#6b6a6a11] text-red-500 transition flex items-center">
                            <StopCircle className="mr-2" size={18} /> Stop
                        </button>
                    </div>
                ) : (
                    <button onClick={openCamera} className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-900  transition">
                        <Camera className="mr-2" size={18} /> Open Camera
                    </button>
                )}

                <canvas ref={canvasRef} style={{ display: "none" }} />

                <label className="cursor-pointer flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition">
                    <Upload className="mr-2" size={18} />
                    Upload File
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                </label>
            </div>


            <div className="w-full md:w-1/2 flex flex-col items-center justify-center mt-4 md:mt-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center">
                        <Loader className="animate-spin text-blue-600" size={40} />
                        <p className="mt-2 text-blue-600 font-semibold">Processing...</p>
                    </div>
                ) : (
                    <textarea
                        value={text}
                        readOnly
                        rows="14"
                        className="w-[90%] p-3 border rounded-lg shadow-sm bg-gray-100 text-gray-700 resize-none"
                    />
                )}

                <div className="flex justify-center space-x-4 mt-3">
                    <button
                        onClick={() => navigator.clipboard.writeText(text)}
                        disabled={loading || !text}
                        className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-900 transition disabled:opacity-50"
                    >
                        <Clipboard className="mr-2" size={18} />
                        Copy Text
                    </button>

                    <button
                        onClick={() => {
                            setImage(null);
                            setText("Upload an image or PDF to extract text...");
                        }}
                        disabled={loading}
                        className="flex items-center bg-[#ffffff11]  py-2 px-4 rounded-lg shadow-md  hover:bg-[#6b6a6a11] text-red-500 transition disabled:opacity-50"
                    >
                        <Trash className="mr-2" size={18} />
                        Clear
                    </button>
                </div>
            </div>

        </div>
    );
};

export default OCRExtractor;