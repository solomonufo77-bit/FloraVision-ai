import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Volume2, 
  History, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Leaf, 
  Info,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // Sample catalog data
  const plantCatalog = [
    {
      name: "Aloe Vera",
      scientificName: "Aloe barbadensis miller",
      uses: "Skin burns, wound healing, digestion, eczema relief.",
      preparation: "Extract fresh inner gel from leaf. Apply topically or dilute in juice.",
      toxicity: "Mild laxative if consumed in large quantities."
    },
    {
      name: "Peppermint",
      scientificName: "Mentha x piperita",
      uses: "IBS, acid reflux, headache relief, mental alertness.",
      preparation: "Steep fresh or dried leaves in boiling water for 5-10 mins for tea.",
      toxicity: "Safe for general use. Avoid high doses with GERD."
    },
    {
      name: "Chamomile",
      scientificName: "Matricaria chamomilla",
      uses: "Insomnia, anxiety reduction, digestive discomfort.",
      preparation: "Steep dried flower heads in hot water for 10 minutes before bedtime.",
      toxicity: "Avoid if severely allergic to ragweed or daisy family."
    }
  ];

  // Handle image upload / photo capture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      analyzePlant(file.name);
    }
  };

  // Simulate AI Identification Process
  const analyzePlant = (filename) => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const mockResult = {
        id: Date.now(),
        name: "Aloe Vera",
        scientificName: "Aloe barbadensis miller",
        confidence: "98.4%",
        date: new Date().toLocaleDateString(),
        description: "Aloe vera is a succulent plant species of the genus Aloe. An evergreen perennial, it originates from the Arabian Peninsula.",
        uses: [
          "Soothes sunburns and minor skin wounds",
          "Promotes skin hydration and collagen production",
          "Supports digestive health when consumed responsibly"
        ],
        preparation: "Cut an outer leaf near the base, slice open longitudinally, and scoop out the clear inner gel. Apply directly to skin or dilute for consumption.",
        warnings: "Do not apply deep into open surgical wounds. Pregnant individuals should avoid oral consumption of unrefined aloe latex."
      };

      setScanResult(mockResult);
      setHistory((prev) => [mockResult, ...prev]);
      setIsScanning(false);
    }, 2500);
  };

  // Text-to-Speech function
  const speakInfo = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported on this browser.");
    }
  };

  const filteredCatalog = plantCatalog.filter(plant => 
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.uses.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-emerald-900/80 backdrop-blur border-b border-emerald-700/50 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              FloraVision AI
            </h1>
            <p className="text-xs text-slate-400">Botanical & Remedy Scanner</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-24">
        {/* TAB 1: SCANNER */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Camera / Upload Box */}
            <div className="border-2 border-dashed border-emerald-500/40 bg-slate-800/60 rounded-2xl p-6 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Captured plant" 
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl" 
                />
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 inline-block">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Take a photo or upload leaf image</p>
                    <p className="text-xs text-slate-400">Identify species & natural remedies</p>
                  </div>
                </div>
              )}

              {/* Scanning Overlay Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-emerald-300">Analyzing plant & herbal properties...</p>
                </div>
              )}
            </div>

            {/* Hidden Input File */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Photo</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-3 px-4 rounded-xl transition active:scale-95"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Gallery</span>
              </button>
            </div>

            {/* Scan Result Details */}
            {scanResult && (
              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-700 pb-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Matched ({scanResult.confidence})</span>
                    <h2 className="text-xl font-bold text-white">{scanResult.name}</h2>
                    <p className="text-xs italic text-slate-400">{scanResult.scientificName}</p>
                  </div>
                  <button 
                    onClick={() => speakInfo(`${scanResult.name}. ${scanResult.description}. Key benefits include: ${scanResult.uses.join(', ')}`)}
                    className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl transition"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{scanResult.description}</p>

                {/* Benefits */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 mr-1 inline" /> Health Benefits & Uses
                  </h3>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {scanResult.uses.map((use, idx) => (
                      <li key={idx}>{use}</li>
                    ))}
                  </ul>
                </div>

                {/* Preparation */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Preparation Guide</h3>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 leading-relaxed">
                    {scanResult.preparation}
                  </p>
                </div>

                {/* Warning / Safety */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-2 text-amber-300 text-xs">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Safety Alert:</span>
                    {scanResult.warnings}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HERBAL CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Search plants or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-3">
              {filteredCatalog.map((plant, index) => (
                <div key={index} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-emerald-300">{plant.name}</h3>
                      <p className="text-xs italic text-slate-400">{plant.scientificName}</p>
                    </div>
                    <button 
                      onClick={() => speakInfo(`${plant.name}. Uses: ${plant.uses}`)}
                      className="text-slate-400 hover:text-emerald-400"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300"><strong className="text-slate-200">Uses:</strong> {plant.uses}</p>
                  <p className="text-xs text-slate-400"><strong className="text-slate-300">Prep:</strong> {plant.preparation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SCAN HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Past Scans</h2>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No scan history recorded yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.date} • Match: {item.confidence}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedImage(null); setScanResult(item); setActiveTab('scan'); }}
                    className="text-xs bg-emerald-600/30 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur border-t border-slate-800 py-2 px-6 flex justify-around items-center z-50 max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'scan' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-medium">Scanner</span>
        </button>

        <button 
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'catalog' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Catalog</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">History</span>
        </button>
      </nav>
    </div>
  );
  }
                                                     
