import { FileText } from "lucide-react";
import OCRExtractor from "./Components/OCRExtractor";
import "./App.css";

function App() {
  return (
    <div className=" md:h-[100vh] h-[150vh]  flex flex-col items-center justify-center text-white px-6 py-4">
      <div className="flex flex-col items-center text-center space-y-2 mt-6 animate-fade-in mb-12">
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-400 drop-shadow-glow animate-bounce" size={42} />
          <h2 className="md:text-4xl text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            OCR Text Extractor
          </h2>
        </div>
        <p className="text-gray-400 text-base italic ">Extract text from images or PDFs effortlessly</p>
      </div>      
        <OCRExtractor />
    </div>
  );
}

export default App;
