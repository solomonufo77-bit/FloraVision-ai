import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Apple,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  History,
  Leaf,
  Loader2,
  Microscope,
  Search,
  ShieldAlert,
  Sparkles,
  Sprout,
  Stethoscope,
  Upload,
  Utensils,
  X,
} from 'lucide-react'

import { analyzePlantImage } from './services/plantApi.js'

const EXPLORE_ITEMS = [
  { id: 'plants', title: 'Plants', subtitle: 'Leaves, herbs & trees', emoji: '🌿', color: 'emerald' },
  { id: 'fruits', title: 'Fruits', subtitle: 'Explore edible fruits', emoji: '🍎', color: 'orange' },
  { id: 'vegetables', title: 'Vegetables', subtitle: 'Explore food plants', emoji: '🥕', color: 'amber' },
  { id: 'flowers', title: 'Flowers', subtitle: 'Discover flowering plants', emoji: '🌸', color: 'pink' },
]

const FEATURE_ITEMS = [
  { title: 'Scientific identification', description: 'Common name, scientific name, family and visible botanical features.', icon: Microscope },
  { title: 'Medical & traditional uses', description: 'Traditional uses and research information presented with appropriate caution.', icon: Stethoscope },
  { title: 'Conditions studied', description: 'Conditions associated with documented research or traditional use.', icon: FlaskConical },
  { title: 'Evidence notes', description: 'Understand when evidence is limited, mixed or mainly traditional.', icon: CheckCircle2 },
  { title: 'Safety & toxicity', description: 'Warnings, toxicity information, allergies and important cautions.', icon: ShieldAlert },
  { title: 'Nutrition', description: 'Nutritional highlights and food-use information for edible plants.', icon: Apple },
]

const SAMPLE_PLANTS = [
  {
    name: 'Aloe vera',
    scientificName: 'Aloe vera (L.) Burm.f.',
    wikiTitle: 'Aloe vera',
    type: 'Plant',
    identification: 'A stemless succulent with thick, fleshy, pointed grey-green leaves arranged in a rosette.',
    information: 'Widely cultivated for its clear leaf gel and used in cosmetic, food and traditional preparations.',
    safety: 'The yellow latex beneath the leaf skin has different properties from the inner gel and can be harmful when taken internally.',
  },
  {
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    wikiTitle: 'Azadirachta indica',
    type: 'Plant',
    identification: 'An evergreen tree with compound leaves made of many narrow, serrated leaflets and small fragrant flowers.',
    information: 'Common in tropical regions and widely represented in traditional practices, including some skin and oral-care preparations.',
    safety: 'Concentrated neem preparations can be harmful if misused; traditional use does not establish safety or effectiveness for every purpose.',
  },
  {
    name: 'Ginger',
    scientificName: 'Zingiber officinale',
    wikiTitle: 'Zingiber officinale',
    type: 'Herb',
    identification: 'A leafy flowering herb recognized by upright stems and a knobby underground rhizome.',
    information: 'A major culinary spice used fresh, dried or prepared as a beverage and also found in traditional preparations.',
    safety: 'Large supplemental amounts can interact with some medicines; ordinary food use is different from concentrated extracts.',
  },
  {
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    wikiTitle: 'Ocimum basilicum',
    type: 'Herb',
    identification: 'An aromatic herb with soft green leaves, square stems and small flowers arranged on spikes.',
    information: 'A popular culinary herb used fresh or dried in foods and represented in traditional preparations.',
    safety: 'Food quantities are different from concentrated essential oils or supplements.',
  },
  {
    name: 'Mango',
    scientificName: 'Mangifera indica',
    wikiTitle: 'Mango',
    type: 'Fruit',
    identification: 'A tropical evergreen tree producing oval fruit with smooth skin and yellow-orange flesh when ripe.',
    information: 'An edible fruit providing carbohydrates, fibre, vitamin C and carotenoid compounds.',
    safety: 'People with mango or related plant allergies should take appropriate precautions.',
  },
  {
    name: 'Banana',
    scientificName: 'Musa spp.',
    wikiTitle: 'Banana',
    type: 'Fruit',
    identification: 'An elongated fruit growing in clusters from a large herbaceous plant with broad leaves.',
    information: 'A common food fruit containing carbohydrates, fibre and minerals including potassium.',
    safety: 'People with specific dietary restrictions or medical conditions may need individualized dietary advice.',
  },
  {
    name: 'Papaya',
    scientificName: 'Carica papaya',
    wikiTitle: 'Papaya',
    type: 'Fruit',
    identification: 'A soft, oval tropical fruit with orange flesh and a central cavity containing many black seeds.',
    information: 'Edible fruit containing vitamin C, carotenoids and fibre and commonly eaten ripe.',
    safety: 'Unripe fruit and papaya latex differ from ripe fruit and may have different effects.',
  },
  {
    name: 'Orange',
    scientificName: 'Citrus sinensis',
    wikiTitle: 'Orange (fruit)',
    type: 'Fruit',
    identification: 'A round citrus fruit with orange peel and juicy segments inside.',
    information: 'Provides vitamin C, water and fibre and is commonly eaten fresh or used for juice.',
    safety: 'Citrus products can interact with some medicines depending on the specific fruit, product and drug.',
  },
  {
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    wikiTitle: 'Tomato',
    type: 'Vegetable',
    identification: 'A fleshy, round fruit with seeds in chambers, commonly prepared as a vegetable.',
    information: 'Provides vitamin C, potassium and carotenoid pigments including lycopene.',
    safety: 'Tomato is botanically a fruit even though it is commonly prepared as a vegetable.',
  },
  {
    name: 'Okra',
    scientificName: 'Abelmoschus esculentus',
    wikiTitle: 'Okra',
    type: 'Vegetable',
    identification: 'A green ridged pod containing round seeds and a naturally mucilaginous interior.',
    information: 'An edible vegetable commonly used in soups and stews and providing fibre and several micronutrients.',
    safety: 'Wash and handle fresh produce appropriately before preparation.',
  },
  {
    name: 'Carrot',
    scientificName: 'Daucus carota subsp. sativus',
    wikiTitle: 'Carrot',
    type: 'Vegetable',
    identification: 'A root vegetable with a tapered orange root and finely divided green leaves.',
    information: 'Provides beta-carotene and fibre and is commonly eaten raw or cooked.',
    safety: 'Normal food portions are different from concentrated supplements.',
  },
  {
    name: 'Spinach',
    scientificName: 'Spinacia oleracea',
    wikiTitle: 'Spinach',
    type: 'Vegetable',
    identification: 'A leafy green vegetable with broad tender leaves growing close to the ground.',
    information: 'Provides folate, vitamin K, carotenoids and other nutrients.',
    safety: 'People taking vitamin-K-sensitive medicines may need consistent dietary intake and professional advice.',
  },
  {
    name: 'Hibiscus',
    scientificName: 'Hibiscus sabdariffa',
    wikiTitle: 'Hibiscus sabdariffa',
    type: 'Flower',
    identification: 'A flowering plant with showy flowers and red fleshy calyces commonly used in beverages.',
    information: 'Roselle calyces are traditionally used to make tart drinks and food preparations.',
    safety: 'Research on blood pressure and other effects does not make hibiscus a substitute for medical treatment.',
  },
  {
    name: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    wikiTitle: 'Lavandula angustifolia',
    type: 'Flower',
    identification: 'An aromatic plant with narrow grey-green leaves and spikes of purple flowers.',
    information: 'Known for its fragrance and used in culinary, cosmetic and traditional preparations.',
    safety: 'Essential oil is highly concentrated and should not be treated like ordinary food.',
  },
  {
    name: 'Rose',
    scientificName: 'Rosa spp.',
    wikiTitle: 'Rose',
    type: 'Flower',
    identification: 'A flowering shrub recognized by layered petals and often thorny stems.',
    information: 'Rose petals and hips have culinary, cosmetic and traditional uses in different cultures.',
    safety: 'Only correctly identified and appropriately prepared plant material should be consumed.',
  },
  {
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    wikiTitle: 'Helianthus annuus',
    type: 'Flower',
    identification: 'A tall plant with a large flower head made of many small florets and broad leaves.',
    information: 'Sunflower seeds are an edible food source containing fats, protein and minerals.',
    safety: 'Seeds should be prepared as food; ornamental plant material is not automatically edible.',
  },
]

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Recent scan'
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.readAsDataURL(file)
  })
}

function resizeImage(dataUrl, maxDimension = 1600, quality = 0.86) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        resolve(dataUrl)
        return
      }
      context.drawImage(image, 0, 0, width, height)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch {
        resolve(dataUrl)
      }
    }
    image.onerror = () => reject(new Error('The selected image could not be processed.'))
    image.src = dataUrl
  })
}

function getHistory() {
  try {
    const raw = localStorage.getItem('floraVisionHistory')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem('floraVisionHistory', JSON.stringify(items.slice(0, 20)))
  } catch {}
}

function SpecimenImage({ plant, className = '', alt }) {
  const [image, setImage] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadImage() {
      setImage('')
      setSourceUrl('')
      setFailed(false)

      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|info&inprop=url&titles=${encodeURIComponent(
          plant.wikiTitle || plant.name,
        )}&pithumbsize=900&format=json&origin=*`

        const response = await fetch(url)
        if (!response.ok) throw new Error('Image lookup failed')

        const data = await response.json()
        const pages = data?.query?.pages || {}
        const page = Object.values(pages)[0]
        const thumbnail = page?.thumbnail?.source || ''
        const canonicalUrl = page?.fullurl || ''

        if (!cancelled && thumbnail) {
          setImage(thumbnail)
          setSourceUrl(canonicalUrl)
        } else if (!cancelled) {
          setFailed(true)
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    loadImage()
    return () => { cancelled = true }
  }, [plant.wikiTitle, plant.name])

  if (image && !failed) {
    return (
      <div className={`fv-specimen-image-wrap ${className}`}>
        <img
          src={image}
          alt={alt || `${plant.name} plant`}
          className="fv-specimen-image"
          loading="lazy"
          onError={() => setFailed(true)}
        />
        {sourceUrl ? (
          <a
            className="fv-image-source"
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Wikimedia / Wikipedia
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`fv-specimen-image-wrap fv-image-fallback ${className}`} aria-label={`${plant.name} image unavailable`}>
      <Leaf size={34} />
      <span>{plant.name}</span>
    </div>
  )
}

function SectionHeading({ eyebrow, title, action, onAction }) {
  return (
    <div className="fv-section-heading">
      <div>
        {eyebrow ? <p className="fv-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {action ? (
        <button type="button" className="fv-text-button" onClick={onAction}>
          {action}<ChevronRight size={17} />
        </button>
      ) : null}
    </div>
  )
}

function ResultList({ title, items, icon: Icon }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <section className="fv-result-card">
      <div className="fv-result-title"><Icon size={19} /><h3>{title}</h3></div>
      <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
    </section>
  )
}

function ResultView({ result, image, onClose, onNewScan }) {
  return (
    <div className="fv-result-view">
      <div className="fv-result-topbar">
        <button type="button" className="fv-icon-button" onClick={onClose} aria-label="Close result"><X size={22} /></button>
        <div><p className="fv-eyebrow">AI IDENTIFICATION</p><h2>{result.commonName || 'Identification result'}</h2></div>
      </div>

      {image ? <div className="fv-result-image-wrap"><img src={image} alt={result.commonName || 'Scanned specimen'} className="fv-result-image" /></div> : null}

      <div className="fv-result-summary">
        <div><span className="fv-result-label">Scientific name</span><strong>{result.scientificName || 'Not available'}</strong></div>
        <div><span className="fv-result-label">Family</span><strong>{result.family || 'Not available'}</strong></div>
        {result.confidenceScore !== null ? <div><span className="fv-result-label">AI confidence</span><strong>{Math.round(result.confidenceScore)}%</strong></div> : null}
      </div>

      {result.uncertainIdentification ? (
        <div className="fv-warning-card">
          <ShieldAlert size={21} />
          <div><strong>Identification is uncertain</strong><p>{result.uncertaintyNote || 'Try a clearer image or compare this result with a reliable botanical source.'}</p></div>
        </div>
      ) : null}

      {result.shortDescription ? (
        <section className="fv-result-card">
          <div className="fv-result-title"><Leaf size={19} /><h3>About this specimen</h3></div>
          <p>{result.shortDescription}</p>
        </section>
      ) : null}

      <ResultList title="Medical & traditional uses" items={result.medicinalUses} icon={Stethoscope} />
      <ResultList title="Conditions studied or traditionally associated" items={result.conditionsStudiedOrTraditionalUses} icon={FlaskConical} />

      {result.evidenceNotes ? (
        <section className="fv-result-card">
          <div className="fv-result-title"><CheckCircle2 size={19} /><h3>Evidence notes</h3></div>
          <p>{result.evidenceNotes}</p>
        </section>
      ) : null}

      <ResultList title="Nutritional highlights" items={result.nutritionalHighlights} icon={Apple} />
      <ResultList title="Dietary benefits" items={result.dietaryBenefits} icon={Utensils} />
      <ResultList title="Food preparation & use" items={result.preparationAndFoodUse} icon={Utensils} />
      <ResultList title="Safety warnings" items={result.safetyWarnings} icon={ShieldAlert} />
      <ResultList title="Drug interactions" items={result.drugInteractions} icon={ShieldAlert} />
      <ResultList title="Toxicity information" items={result.toxicityInformation} icon={ShieldAlert} />
      <ResultList title="Botanical features" items={result.botanicalFeatures} icon={Microscope} />
      <ResultList title="Care guide" items={result.careGuide} icon={Sprout} />
      <ResultList title="Possible look-alikes" items={result.possibleLookAlikes} icon={Search} />

      <div className="fv-medical-note">
        <ShieldAlert size={18} />
        <p>FloraVision AI provides educational botanical and traditional-use information. It does not diagnose conditions or replace advice from a qualified healthcare professional.</p>
      </div>

      <button type="button" className="fv-primary-button fv-full-button" onClick={onNewScan}>
        <Camera size={20} />Scan another specimen
      </button>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(getHistory)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecimen, setSelectedSpecimen] = useState(null)

  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const filteredPlants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return SAMPLE_PLANTS
    return SAMPLE_PLANTS.filter(
      (plant) => [plant.name, plant.scientificName, plant.type, plant.identification].some((value) => value.toLowerCase().includes(term)),
    )
  }, [searchTerm])

  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [result])

  function openCamera() {
    setError('')
    cameraInputRef.current?.click()
  }

  function openGallery() {
    setError('')
    galleryInputRef.current?.click()
  }

  async function handleFile(file) {
    if (!file) return
    setError('')
    setResult(null)
    setSelectedFileName(file.name || 'Selected image')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    try {
      const original = await readFileAsDataUrl(file)
      const resized = await resizeImage(original)
      setSelectedImage(resized)
      setActiveTab('scan')
    } catch (scanError) {
      setError(scanError?.message || 'Could not prepare the selected image.')
    }
  }

  function handleCameraChange(event) {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleGalleryChange(event) {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  async function identifyImage() {
    if (!selectedImage) {
      setError('Choose or capture a plant, fruit, vegetable or flower image first.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const data = await analyzePlantImage(selectedImage)
      setResult(data)

      const entry = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        image: selectedImage,
        result: data,
      }

      const nextHistory = [entry, ...history.filter((item) => item.id !== entry.id)].slice(0, 20)
      setHistory(nextHistory)
      saveHistory(nextHistory)
    } catch (scanError) {
      const message = scanError?.message || 'The AI identification service is unavailable.'
      const friendlyMessage = /api key|api_key|key not valid|invalid key/i.test(message)
        ? 'The Gemini AI service key is not configured correctly yet. The image is ready, but the secure Cloudflare AI service must be configured before identification will work.'
        : message
      setError(friendlyMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function resetScan() {
    setSelectedImage('')
    setSelectedFileName('')
    setResult(null)
    setError('')
    setActiveTab('home')
  }

  function openHistoryItem(item) {
    setSelectedImage(item.image || '')
    setSelectedFileName('Saved scan')
    setResult(item.result)
    setActiveTab('scan')
  }

  function clearHistory() {
    setHistory([])
    saveHistory([])
  }

  if (result) {
    return (
      <div className="fv-app">
        <ResultView result={result} image={selectedImage} onClose={() => setResult(null)} onNewScan={resetScan} />
      </div>
    )
  }

  return (
    <div className="fv-app">
      <header className="fv-header">
        <div className="fv-brand">
          <div className="fv-logo"><img src="/logo.svg" alt="FloraVision AI" /></div>
          <div><h1>FloraVision AI</h1><p>Explore. Identify. Learn.</p></div>
        </div>

        <button type="button" className="fv-history-button" onClick={() => setActiveTab('history')} aria-label="Open scan history">
          <History size={22} />
          {history.length > 0 ? <span>{history.length}</span> : null}
        </button>
      </header>

      <main>
        {activeTab === 'home' ? (
          <>
            <section className="fv-hero">
              <div className="fv-hero-copy">
                <span className="fv-ai-pill"><Sparkles size={15} />Gemini-powered plant intelligence</span>
                <h2>Discover the world of plants.</h2>
                <p>Identify plants, fruits, vegetables and flowers, then explore botanical, nutritional, traditional-use and safety information.</p>

                <div className="fv-hero-actions">
                  <button type="button" className="fv-primary-button" onClick={openCamera}><Camera size={20} />Scan with camera</button>
                  <button type="button" className="fv-secondary-button" onClick={openGallery}><Upload size={19} />Choose photo</button>
                </div>
              </div>

              <div className="fv-hero-art" aria-hidden="true">
                <div className="fv-orbit orbit-one" />
                <div className="fv-orbit orbit-two" />
                <div className="fv-hero-leaf">🌿</div>
                <Sparkles className="fv-hero-sparkle" size={28} />
              </div>
            </section>

            <section className="fv-section">
              <SectionHeading eyebrow="EXPLORE" title="What do you want to discover?" action="See all" onAction={() => setActiveTab('explore')} />
              <div className="fv-explore-grid">
                {EXPLORE_ITEMS.map((item) => (
                  <button type="button" className={`fv-explore-card ${item.color}`} key={item.id} onClick={() => setActiveTab('explore')}>
                    <span className="fv-explore-icon">{item.emoji}</span>
                    <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </section>

            <section className="fv-section">
              <SectionHeading eyebrow="FLORAVISION AI" title="Everything you can explore" />
              <div className="fv-feature-grid">
                {FEATURE_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <article className="fv-feature-card" key={item.title}>
                      <div className="fv-feature-icon"><Icon size={20} /></div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="fv-section">
              <SectionHeading eyebrow="DISCOVER" title="Learn about popular specimens" action="See all" onAction={() => setActiveTab('explore')} />
              <div className="fv-specimen-row">
                {SAMPLE_PLANTS.slice(0, 6).map((plant) => (
                  <button type="button" className="fv-specimen-card fv-specimen-card-rich" key={plant.name} onClick={() => setSelectedSpecimen(plant)}>
                    <SpecimenImage plant={plant} className="fv-card-image" alt={`${plant.name} specimen`} />
                    <strong>{plant.name}</strong>
                    <small><em>{plant.scientificName}</em></small>
                    <p>{plant.identification}</p>
                    <span className="fv-identify-link">View information <ArrowRight size={15} /></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="fv-ai-card">
              <div className="fv-ai-icon"><Sparkles size={25} /></div>
              <div>
                <span className="fv-eyebrow">AI BOTANICAL ASSISTANT</span>
                <h2>Have a plant in front of you?</h2>
                <p>Let FloraVision analyze an image and organize useful botanical information for you.</p>
              </div>
              <button type="button" className="fv-round-arrow" onClick={openCamera} aria-label="Start AI scan"><ArrowRight size={21} /></button>
            </section>
          </>
        ) : null}

        {activeTab === 'explore' ? (
          <section className="fv-page-section">
            <div className="fv-page-title">
              <span className="fv-eyebrow">EXPLORE FLORAVISION</span>
              <h2>Plants, fruits, vegetables & flowers</h2>
              <p>Browse categories and use AI scanning whenever you want detailed identification.</p>
            </div>

            <div className="fv-search"><Search size={19} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search examples..." aria-label="Search specimens" /></div>

            <div className="fv-specimen-grid">
              {filteredPlants.map((plant) => (
                <button type="button" className="fv-large-specimen fv-large-specimen-rich" key={plant.name} onClick={() => setSelectedSpecimen(plant)}>
                  <SpecimenImage plant={plant} className="fv-large-card-image" alt={`${plant.name} specimen`} />
                  <strong>{plant.name}</strong>
                  <small><em>{plant.scientificName}</em></small>
                  <span className="fv-category-label">{plant.type}</span>
                  <p>{plant.identification}</p>
                  <p className="fv-card-info">{plant.information}</p>
                  <span className="fv-identify-link">View full information<ArrowRight size={15} /></span>
                </button>
              ))}
            </div>

            <div className="fv-info-banner">
              <Microscope size={22} />
              <div><strong>Scientific + practical information</strong><p>Results can include botanical features, traditional uses, evidence notes, food information, safety warnings, drug interactions and toxicity information when relevant.</p></div>
            </div>
          </section>
        ) : null}

        {activeTab === 'scan' ? (
          <section className="fv-page-section">
            <div className="fv-page-title">
              <span className="fv-eyebrow">AI IDENTIFICATION</span>
              <h2>Scan a specimen</h2>
              <p>Use your camera or choose an image from your gallery.</p>
            </div>

            <div className={`fv-scan-box ${selectedImage ? 'has-image' : ''}`}>
              {selectedImage ? (
                <>
                  <button type="button" className="fv-image-close" onClick={() => { setSelectedImage(''); setSelectedFileName('') }} aria-label="Remove image"><X size={19} /></button>
                  <img src={selectedImage} alt="Selected plant specimen" />
                  <div className="fv-file-name">{selectedFileName}</div>
                </>
              ) : (
                <div className="fv-empty-scan">
                  <div className="fv-scan-icon"><Camera size={32} /></div>
                  <h3>Ready to identify</h3>
                  <p>Take a clear photo of leaves, flowers, fruits, vegetables or other plant parts.</p>
                </div>
              )}
            </div>

            <div className="fv-scan-actions">
              <button type="button" className="fv-primary-button" onClick={openCamera}><Camera size={20} />Open camera</button>
              <button type="button" className="fv-secondary-button" onClick={openGallery}><Upload size={19} />Choose photo</button>
            </div>

            {selectedImage ? (
              <button type="button" className="fv-identify-button" onClick={identifyImage} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 size={22} className="fv-spin" /> : <Sparkles size={21} />}
                {isAnalyzing ? 'Analyzing specimen...' : 'Identify with Gemini AI'}
              </button>
            ) : null}

            {error ? (
              <div className="fv-error-card" role="alert">
                <ShieldAlert size={20} /><div><strong>Scan service message</strong><p>{error}</p></div>
              </div>
            ) : null}

            <div className="fv-privacy-card">
              <span>🔐</span>
              <div><strong>Your Gemini key stays out of the app</strong><p>The Android app sends images to the secure server function. The Gemini secret is not bundled into the Android app.</p></div>
            </div>
          </section>
        ) : null}

        {activeTab === 'history' ? (
          <section className="fv-page-section">
            <div className="fv-page-title">
              <span className="fv-eyebrow">YOUR LIBRARY</span>
              <h2>Scan history</h2>
              <p>Your recent scan records are kept locally on this device.</p>
            </div>

            {history.length === 0 ? (
              <div className="fv-empty-history">
                <Clock3 size={34} /><h3>No scans yet</h3><p>Your identified plants will appear here after your first successful scan.</p>
                <button type="button" className="fv-primary-button" onClick={openCamera}><Camera size={19} />Start first scan</button>
              </div>
            ) : (
              <>
                <div className="fv-history-list">
                  {history.map((item) => (
                    <button type="button" className="fv-history-item" key={item.id} onClick={() => openHistoryItem(item)}>
                      <div className="fv-history-thumb">{item.image ? <img src={item.image} alt="" /> : <Leaf size={24} />}</div>
                      <div className="fv-history-content">
                        <strong>{item.result?.commonName || 'Unknown specimen'}</strong>
                        <span>{item.result?.scientificName || 'Scientific name unavailable'}</span>
                        <small>{formatDate(item.createdAt)}</small>
                      </div>
                      <ChevronRight size={19} />
                    </button>
                  ))}
                </div>
                <button type="button" className="fv-clear-button" onClick={clearHistory}>Clear local history</button>
              </>
            )}
          </section>
        ) : null}
      </main>

      {selectedSpecimen ? (
        <div className="fv-modal-backdrop" role="presentation" onClick={() => setSelectedSpecimen(null)}>
          <article className="fv-specimen-modal" role="dialog" aria-modal="true" aria-label={`${selectedSpecimen.name} information`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="fv-modal-close" onClick={() => setSelectedSpecimen(null)} aria-label="Close information"><X size={21} /></button>
            <SpecimenImage plant={selectedSpecimen} className="fv-modal-image" alt={`${selectedSpecimen.name} specimen`} />
            <span className="fv-eyebrow">{selectedSpecimen.type.toUpperCase()}</span>
            <h2>{selectedSpecimen.name}</h2>
            <p className="fv-scientific-name"><em>{selectedSpecimen.scientificName}</em></p>
            <div className="fv-modal-section"><strong>Identification</strong><p>{selectedSpecimen.identification}</p></div>
            <div className="fv-modal-section"><strong>Information & uses</strong><p>{selectedSpecimen.information}</p></div>
            <div className="fv-modal-section fv-safety-box"><strong>Safety note</strong><p>{selectedSpecimen.safety}</p></div>
            <button type="button" className="fv-primary-button fv-full-button" onClick={() => { setSelectedSpecimen(null); openCamera() }}><Camera size={19} />Identify a specimen with AI</button>
          </article>
        </div>
      ) : null}

      <nav className="fv-bottom-nav" aria-label="Primary navigation">
        <button type="button" className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}><Leaf size={21} /><span>Home</span></button>
        <button type="button" className={activeTab === 'explore' ? 'active' : ''} onClick={() => setActiveTab('explore')}><Search size={21} /><span>Explore</span></button>
        <button type="button" className="scan-main" onClick={() => { setResult(null); setActiveTab('scan') }}><Camera size={24} /><span>Scan</span></button>
        <button type="button" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}><History size={21} /><span>History</span></button>
      </nav>

      <input ref={cameraInputRef} className="fv-hidden-input" type="file" accept="image/*" capture="environment" onChange={handleCameraChange} />
      <input ref={galleryInputRef} className="fv-hidden-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleGalleryChange} />

      <footer className="fv-footer">
        <div><strong>FloraVision AI</strong><span>Explore plants with care.</span></div>
        <span className="fv-secure-badge"><ShieldAlert size={14} />Educational information</span>
      </footer>
    </div>
  )
}

export default App
