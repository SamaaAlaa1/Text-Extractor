import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker";

GlobalWorkerOptions.workerSrc = pdfjsWorker;
