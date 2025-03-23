import { useState } from "react";
import { FileText } from "lucide-react";
import OCRExtractor from "./Components/OCRExtractor";
import "./App.css";

function App() {
  return (
    <div className="bg-[#1e1e1e] md:h-[100vh] h-[140vh]  flex flex-col items-center justify-center text-white px-4 ">
      <div className="flex items-center space-x-2 mt-4 ">
        <FileText className="text-blue-400" size={32} />
        <h2 className="text-3xl font-bold">OCR Text Extractor</h2>
      </div>
      <p className="text-gray-400 text-sm mb-8">Extract text from images or PDFs efficiently</p>
      <OCRExtractor />
    </div>
  );
}

export default App;
