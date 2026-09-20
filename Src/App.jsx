import React, { useEffect, useRef, useState } from 'react'
import {
  Camera,
  Upload,
  Leaf,
  History,
  X,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  Apple,
  Search,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { analyzePlantImage } from './services/plantApi.js'

const HISTORY_KEY = 'floravision_history_v1'
const MAX_HISTORY = 20

function readHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function makeHistoryItem(result, image) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    image,
    result,
  }
}

function getConfidenceLabel(score) {
  if (typeof score !== 'number') return 'Not available'
  if (score >= 85) return 'High'
  if (score >= 65) return 'Moderate'
  return 'Low'
}

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <span className="flex items-center gap-3 font-semibold text-white">
          <Icon size={20} className="text-emerald-400" />
          {title}
        </span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="border-t border-slate-700 p-4">{children}</div>}
    </div>
  )
}

function List({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-400">No information available.</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="flex gap-2 text-sm leading-6 text-slate-300"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(readHistory)
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('scanner')

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      // Storage may be unavailable or full.
    }
  }, [history])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraActive(false)
  }

  async function startCamera() {
    setError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not available on this device or browser.')
      return
    }

    try {
      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraActive(true)

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
    } catch (err) {
      if (err?.name === 'NotAllowedError') {
        setError('Camera permission was denied. Please allow camera access in your device settings.')
      } else if (err?.name === 'NotFoundError') {
        setError('No camera was found on this device.')
      } else {
        setError('Unable to start the camera. Please try again.')
      }

      setCameraActive(false)
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !cameraActive) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')

    const maxWidth = 1600
    const scale = Math.min(1, maxWidth / video.videoWidth)

    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)

    const context = canvas.getContext('2d')

    if (!context) {
      setError('Unable to capture the camera image.')
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.82)

    stopCamera()
    setImage(dataUrl)
    setResult(null)
    setError('')
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    if (file.size > 12 * 1024 * 1024) {
      setError('Please choose an image smaller than 12 MB.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result)
      setResult(null)
    }

    reader.onerror = () => {
      setError('Unable to read the selected image.')
    }

    reader.readAsDataURL(file)
  }

  async function identifyImage() {
    if (!image) {
      setError('Take a photo or select an image first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await analyzePlantImage(image)

      setResult(data)

      const historyItem = makeHistoryItem(data, image)

      setHistory((previous) =>
        [historyItem, ...previous].slice(0, MAX_HISTORY),
      )
    } catch (err) {
      setError(
        err?.message ||
          'The identification service could not process this image. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function resetScanner() {
    stopCamera()
    setImage(null)
    setResult(null)
    setError('')
  }

  function deleteHistoryItem(id) {
    setHistory((items) => items.filter((item) => item.id !== id))
  }

  function clearHistory() {
    if (window.confirm('Delete all saved scan history?')) {
      setHistory([])
    }
  }

  function openHistoryItem(item) {
    setActiveTab('scanner')
    setImage(item.image)
    setResult(item.result)
  }

  const isFood =
    result?.category === 'fruit' ||
    result?.category === 'vegetable' ||
    result?.category === 'food'

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-2">
              <Leaf className="text-emerald-400" size={25} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FloraVision AI</h1>
              <p className="text-xs text-slate-400">
                Plant, fruit & vegetable identifier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className="rounded-xl p-2 text-slate-300 hover:bg-slate-800"
            aria-label="Open scan history"
          >
            <History size={22} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        {activeTab === 'scanner' && (
          <>
            {!result && (
              <section className="mb-6">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10">
                    <Leaf size={42} className="text-emerald-400" />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    Identify what you see
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                    Identify plants, flowers, herbs, fruits and vegetables
                    and explore botanical, food, traditional-use and safety
                    information.
                  </p>
                </div>

                {cameraActive ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-700 bg-black">
                    <div className="relative aspect-[4/3]">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="absolute right-4 top-4 rounded-full bg-black/60 p-3 text-white"
                        aria-label="Close camera"
                      >
                        <X size={22} />
                      </button>
                    </div>

                    <div className="flex justify-center p-5">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-emerald-500 shadow-lg"
                        aria-label="Take photo"
                      >
                        <Camera size={28} className="text-white" />
                      </button>
                    </div>
                  </div>
                ) : image ? (
                  <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
                    <img
                      src={image}
                      alt="Selected plant or food"
                      className="max-h-[520px] w-full object-contain"
                    />

                    <button
                      type="button"
                      onClick={resetScanner}
                      className="absolute right-4 top-4 rounded-full bg-black/70 p-3 text-white"
                      aria-label="Remove image"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                      <Search className="text-emerald-400" size={30} />
                    </div>

                    <p className="text-sm text-slate-400">
                      Take a clear photo of the plant, fruit or vegetable.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-semibold text-white hover:bg-emerald-500"
                      >
                        <Camera size={20} />
                        Open Camera
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-slate-800 px-5 py-4 font-semibold text-white hover:bg-slate-700"
                      >
                        <Upload size={20} />
                        Choose Photo
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}

                {image && !cameraActive && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={identifyImage}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Search size={20} />
                      {loading ? 'Analyzing...' : 'Identify Image'}
                    </button>

                    <button
                      type="button"
                      onClick={resetScanner}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 font-semibold text-white disabled:opacity-50"
                    >
                      <RotateCcw size={19} />
                      New Scan
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
                    <p className="font-medium text-white">Analyzing image...</p>
                    <p className="mt-1 text-xs text-slate-400">
                      FloraVision AI is examining the visible features.
                    </p>
                  </div>
                )}
              </section>
            )}

            {error && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <p className="text-sm leading-6 text-red-200">{error}</p>
              </div>
            )}

            {result && (
              <section className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
                  {image && (
                    <img
                      src={image}
                      alt={result.commonName || 'Identified specimen'}
                      className="max-h-[380px] w-full object-contain bg-black"
                    />
                  )}

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold capitalize text-emerald-300">
                        {result.category || 'Specimen'}
                      </span>

                      {result.uncertainIdentification && (
                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                          Identification uncertain
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                      {result.commonName || 'Unknown specimen'}
                    </h2>

                    {result.scientificName && (
                      <p className="mt-1 italic text-slate-400">
                        {result.scientificName}
                      </p>
                    )}

                    {result.family && (
                      <p className="mt-1 text-xs text-slate-500">
                        Family: {result.family}
                      </p>
                    )}

                    {result.shortDescription && (
                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        {result.shortDescription}
                      </p>
                    )}

                    {typeof result.confidenceScore === 'number' && (
                      <div className="mt-5 rounded-2xl bg-slate-800 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            AI confidence estimate
                          </span>
                          <span className="font-semibold text-emerald-300">
                            {getConfidenceLabel(result.confidenceScore)}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, result.confidenceScore),
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-[11px] text-slate-500">
                          This is an AI estimate, not a laboratory or expert
                          botanical confirmation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {result.uncertainIdentification && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex gap-3">
                      <AlertTriangle
                        className="shrink-0 text-amber-400"
                        size={21}
                      />
                      <div>
                        <h3 className="font-semibold text-amber-200">
                          Identification warning
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-amber-100/80">
                          {result.uncertaintyNote ||
                            'The image may not contain enough information for a reliable identification. Do not consume an unknown plant based only on this result.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Section title="Botanical Features" icon={Leaf}>
                  <List items={result.botanicalFeatures} />
                </Section>

                <Section title="Medical & Traditional Uses" icon={HeartPulse}>
                  <div className="space-y-5">
                    <div>
                      <h4 className="mb-2 font-semibold text-white">Uses</h4>
                      <List items={result.medicinalUses} />
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        Conditions studied or traditionally associated
                      </h4>
                      <List
                        items={result.conditionsStudiedOrTraditionalUses}
                      />
                    </div>

                    {result.evidenceNotes && (
                      <div className="rounded-xl bg-slate-900 p-4">
                        <p className="text-sm leading-6 text-slate-300">
                          <strong className="text-white">
                            Evidence note:
                          </strong>{' '}
                          {result.evidenceNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>

                {isFood && (
                  <Section title="Food & Nutrition" icon={Apple}>
                    <div className="space-y-5">
                      <div>
                        <h4 className="mb-2 font-semibold text-white">
                          Nutritional highlights
                        </h4>
                        <List items={result.nutritionalHighlights} />
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold text-white">
                          Dietary benefits
                        </h4>
                        <List items={result.dietaryBenefits} />
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold text-white">
                          Food preparation & use
                        </h4>
                        <List items={result.preparationAndFoodUse} />
                      </div>
                    </div>
                  </Section>
                )}

                <Section title="Safety Information" icon={ShieldCheck}>
                  <div className="space-y-5">
                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        Safety warnings
                      </h4>
                      <List items={result.safetyWarnings} />
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        Possible drug interactions
                      </h4>
                      <List items={result.drugInteractions} />
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        Toxicity information
                      </h4>
                      <List items={result.toxicityInformation} />
                    </div>
                  </div>
                </Section>

                <Section title="Care Guide" icon={Leaf} defaultOpen={false}>
                  <List items={result.careGuide} />
                </Section>

                <Section
                  title="Possible Look-Alikes"
                  icon={Info}
                  defaultOpen={false}
                >
                  <List items={result.possibleLookAlikes} />
                </Section>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={21}
                      className="shrink-0 text-amber-400"
                    />
                    <p className="text-xs leading-6 text-amber-100/80">
                      FloraVision AI provides educational botanical,
                      nutritional and traditional-use information. AI
                      identification can be wrong. Never eat or use an
                      unidentified plant based only on this app. Medical
                      information is not a diagnosis or a substitute for
                      qualified medical advice.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetScanner}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-5 py-4 font-semibold text-white hover:bg-slate-700"
                >
                  <RotateCcw size={19} />
                  Scan Another
                </button>
              </section>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Scan History</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Saved locally on this device.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
                <History size={40} className="mx-auto mb-4 text-slate-600" />
                <p className="font-semibold text-white">No scans yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Your future identification results will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab('scanner')}
                  className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Start a Scan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3"
                  >
                    <button
                      type="button"
                      onClick={() => openHistoryItem(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {item.result?.commonName || 'Unknown specimen'}
                        </p>

                        <p className="mt-1 text-xs capitalize text-emerald-400">
                          {item.result?.category || 'Specimen'}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteHistoryItem(item.id)}
                      className="self-center rounded-xl p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete history item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center gap-1 px-4 py-3 text-xs ${
              activeTab === 'scanner'
                ? 'text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            <Camera size={21} />
            Scan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 px-4 py-3 text-xs ${
              activeTab === 'history'
                ? 'text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            <History size={21} />
            History
          </button>
        </div>
      </nav>
    </div>
  )
}
