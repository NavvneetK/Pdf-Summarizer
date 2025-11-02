import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader, CheckCircle, Clipboard } from 'lucide-react';

// --- Helper Functions (Firestore integration not strictly needed here, but kept for context) ---
// Since this is a simple utility app without persistent storage needs, we'll focus purely on UI/API simulation.
// We'll omit Firebase imports and setup for brevity and focus on the core task.

/**
 * A utility function to simulate the API call and delayed processing.
 * In a real app, this would use 'fetch' to hit your backend API Gateway.
 */
const mockApiCall = (file, setStatus) => {
  return new Promise((resolve) => {
    setStatus('PROCESSING');

    // Simulate PDF extraction and ML inference time (1-5 seconds)
    const processingTime = 1000 + Math.random() * 4000;

    setTimeout(() => {
      // Mock data based on the uploaded file name
      const fileName = file.name;
      const originalText = `This is the mock extracted text from the PDF file named "${fileName}". This text would typically be hundreds of words long. We simulate the text extraction step which converts the structured content of the PDF into a single, cohesive block of text for the Machine Learning model. The ML model then takes this long block and produces the summary below.`;
      const summaryText = `The uploaded document, "${fileName}", was successfully processed. The AI summary focuses on the core points: centralized UI, dark mode aesthetics, clear status indicators, and decoupled backend architecture for scalability.`;

      setStatus('COMPLETE');
      resolve({ originalText, summaryText });
    }, processingTime);
  });
};

// --- Main App Component ---

const Home = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [originalText, setOriginalText] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, PROCESSING, COMPLETE

  // Handles drag over event
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-indigo-400', 'bg-gray-700');
  };

  // Handles drag leave event
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-400', 'bg-gray-700');
  };

  // Handles file drop and input change
  const handleFileChange = useCallback(async (newFile) => {
    if (newFile && newFile.type === 'application/pdf') {
      setFile(newFile);
      setSummary(null);
      setOriginalText(null);
      setStatus('UPLOADING');
      try {
        const result = await mockApiCall(newFile, setStatus);
        setOriginalText(result.originalText);
        setSummary(result.summaryText);
      } catch (error) {
        console.error("API Call failed:", error);
        setStatus('IDLE');
        // Handle error display here
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-400', 'bg-gray-700');
    if (status !== 'PROCESSING') {
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    }
  };

  const handleManualUpload = (e) => {
    if (status !== 'PROCESSING') {
        const uploadedFile = e.target.files[0];
        handleFileChange(uploadedFile);
    }
  };

  const handleCopy = (text) => {
    if (document.execCommand('copy')) {
      // Fallback for document.execCommand
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Summary copied to clipboard!');
    } else {
      // Basic alert if copy command fails
      alert('Could not copy text automatically. Please select and copy manually.');
    }
  };


  // Renders the main input/status area
  const renderInputArea = () => {
    if (status === 'PROCESSING' || status === 'UPLOADING') {
      const message = status === 'UPLOADING' ? 'Uploading PDF...' : 'Generating Summary (ML Model Running)...';
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-2xl shadow-xl border-2 border-indigo-600/50">
          <Loader className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="mt-4 text-xl font-semibold text-white">{message}</p>
          <p className="text-sm text-gray-400 mt-2">Processing {file?.name}...</p>
        </div>
      );
    }

    // Default Drop Zone
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-16 border-4 border-dashed rounded-2xl transition-colors duration-200
          ${file && status === 'IDLE' ? 'border-emerald-500 bg-gray-700/50' : 'border-gray-600 bg-gray-800 hover:border-indigo-500'}
          flex flex-col items-center cursor-pointer shadow-2xl`}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <Upload className="w-12 h-12 text-indigo-400 mb-4" />
        <p className="text-xl font-medium text-white">Drag & Drop Your PDF Here</p>
        <p className="text-sm text-gray-400 mt-1 mb-4">or click to browse. Max size 50MB.</p>
        {file && status === 'IDLE' && (
            <div className="mt-2 p-2 bg-emerald-700/30 rounded-lg flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                <span className="text-emerald-300 text-sm">{file.name} ready for processing.</span>
            </div>
        )}
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleManualUpload}
          className="hidden"
        />
      </div>
    );
  };

  // Renders the summary and original text
  const renderResults = () => {
    if (status === 'COMPLETE' && summary && originalText) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 w-full max-w-7xl">
          {/* Original Text Card (Scrollable) */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-gray-600 flex flex-col h-[500px]">
            <h3 className="text-xl font-bold text-gray-300 flex items-center mb-4">
              <FileText className="w-5 h-5 mr-2 text-gray-400" />
              Original Text ({file?.name})
            </h3>
            <div className="flex-grow overflow-y-auto text-gray-400 leading-relaxed custom-scrollbar">
              <p>{originalText}</p>
            </div>
          </div>

          {/* AI Summary Card (Prominent) */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-t-4 border-indigo-500 flex flex-col h-[500px]">
            <h3 className="text-2xl font-bold text-indigo-300 flex items-center mb-4">
              <CheckCircle className="w-6 h-6 mr-2 text-indigo-400" />
              AI Summary
            </h3>
            <div className="flex-grow overflow-y-auto text-white leading-relaxed text-lg custom-scrollbar">
              <p>{summary}</p>
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-gray-700 pt-4">
                <button
                    onClick={() => handleCopy(summary)}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition duration-150 shadow-md shadow-indigo-500/50"
                >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Copy Summary
                </button>
                <button
                    onClick={() => {
                        setFile(null);
                        setSummary(null);
                        setOriginalText(null);
                        setStatus('IDLE');
                    }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition duration-150"
                >
                    Process New PDF
                </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-12 mt-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400 mb-2">
          Document Insights
        </h1>
        <p className="text-lg text-gray-400">
          Upload any PDF to get an instant, AI-powered text summarization.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center">
        {renderInputArea()}
        {renderResults()}
      </main>

      {/* Custom Scrollbar CSS (for minimal, impressive look) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* gray-700 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5; /* indigo-600 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1; /* indigo-500 */
        }
      `}</style>
    </div>
  );
};

export default Home;