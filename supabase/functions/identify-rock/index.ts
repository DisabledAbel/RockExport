import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1'
const GEONAMES_BASE_URL = 'http://api.geonames.org'
const WIKIPEDIA_API_BASE_URL = 'https://en.wikipedia.org/api/rest_v1'

interface RockIdentificationRequest {
  description?: string
  imageAnalysis?: {
    colors: string[]
    texture: string
    patterns: string[]
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { description, imageAnalysis }: RockIdentificationRequest = await req.json()

    // Analyze rock based on description and image features
    const rockData = await identifyRock(description, imageAnalysis)
    
    // Fetch additional geological data
    const enhancedData = await enhanceRockData(rockData)

    return new Response(
      JSON.stringify(enhancedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in rock identification:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to identify rock' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function identifyRock(description?: string, imageAnalysis?: any) {
  // Rock identification logic based on geological characteristics
  const characteristics = parseCharacteristics(description, imageAnalysis)
  
  // Simple rule-based identification system using geological knowledge
  const identification = classifyRock(characteristics)
  
  return identification
}

function parseCharacteristics(description?: string, imageAnalysis?: any) {
  const characteristics: any = {
    texture: 'unknown',
    color: 'unknown',
    hardness: 'unknown',
    luster: 'unknown',
    crystalSize: 'unknown',
    keywords: []
  }

  if (description) {
    const desc = description.toLowerCase()
    console.log('Parsing description:', desc)
    
    // Store all keywords for broader matching
    characteristics.keywords = desc.split(/\s+/)
    
    // Texture analysis - more comprehensive
    if (desc.match(/coarse|rough|bumpy|granular|grainy/)) characteristics.texture = 'coarse'
    if (desc.match(/fine|smooth|silky|powdery/)) characteristics.texture = 'fine'
    if (desc.match(/glassy|glass|shiny|reflective/)) characteristics.texture = 'glassy'
    if (desc.match(/porous|holes|bubbles|foam|vesicular|pumice/)) characteristics.texture = 'vesicular'
    if (desc.match(/layered|layers|banded|striped|sediment/)) characteristics.texture = 'layered'
    if (desc.match(/foliated|flaky|scaly|sheet/)) characteristics.texture = 'foliated'
    if (desc.match(/crystalline|crystal|sparkl/)) characteristics.texture = 'crystalline'
    
    // Color analysis - expanded
    if (desc.match(/dark|black|charcoal|deep/)) characteristics.color = 'dark'
    if (desc.match(/light|white|pale|cream|beige/)) characteristics.color = 'light'
    if (desc.match(/red|pink|reddish|rust|brick/)) characteristics.color = 'red'
    if (desc.match(/green|olive|emerald/)) characteristics.color = 'green'
    if (desc.match(/gray|grey|silver/)) characteristics.color = 'gray'
    if (desc.match(/brown|tan|beige|chocolate/)) characteristics.color = 'brown'
    if (desc.match(/yellow|golden|amber/)) characteristics.color = 'yellow'
    if (desc.match(/blue|azure/)) characteristics.color = 'blue'
    
    // Hardness indicators
    if (desc.match(/hard|difficult.*(scratch|break)|tough|solid/)) characteristics.hardness = 'hard'
    if (desc.match(/soft|easy.*(scratch|break)|crumbl|chalk/)) characteristics.hardness = 'soft'
    if (desc.match(/medium|moderate/)) characteristics.hardness = 'medium'
    
    // Luster
    if (desc.match(/shiny|metallic|mirror|reflective/)) characteristics.luster = 'metallic'
    if (desc.match(/dull|earthy|matte|chalky/)) characteristics.luster = 'dull'
    if (desc.match(/glassy|vitreous|glass/)) characteristics.luster = 'vitreous'
    if (desc.match(/pearly|silk/)) characteristics.luster = 'pearly'
    
    // Crystal size
    if (desc.match(/large.*(crystal|grain)|coarse/)) characteristics.crystalSize = 'large'
    if (desc.match(/small.*(crystal|grain)|fine/)) characteristics.crystalSize = 'small'
    if (desc.match(/no.*crystal|glass/)) characteristics.crystalSize = 'none'
    
    console.log('Parsed characteristics:', characteristics)
  }

  if (imageAnalysis?.colors) {
    characteristics.dominantColors = imageAnalysis.colors
  }

  return characteristics
}

function classifyRock(characteristics: any) {
  console.log('Classifying rock with characteristics:', characteristics)
  
  // Check for keyword-based identification first (more reliable)
  const keywords = characteristics.keywords || []
  const keywordString = keywords.join(' ')
  
  // Direct rock name mentions
  if (keywordString.match(/granite/)) {
    return createRockData('Granite', 'igneous', 88, 'Formed from slow cooling of felsic magma deep within the Earth\'s crust', 'plutonic', 'phaneritic')
  }
  if (keywordString.match(/basalt/)) {
    return createRockData('Basalt', 'igneous', 85, 'Formed from rapid cooling of mafic lava flows on the Earth\'s surface', 'volcanic', 'aphanitic')
  }
  if (keywordString.match(/limestone|lime/)) {
    return createRockData('Limestone', 'sedimentary', 82, 'Formed from accumulation of marine organisms and chemical precipitation in warm, shallow seas', 'chemical', 'crystalline')
  }
  if (keywordString.match(/sandstone|sand/)) {
    return createRockData('Sandstone', 'sedimentary', 80, 'Formed from cementation of sand-sized mineral particles, primarily quartz', 'clastic', 'medium-grained')
  }
  if (keywordString.match(/marble/)) {
    return createRockData('Marble', 'metamorphic', 85, 'Formed from metamorphism of limestone or dolomite under heat and pressure', 'non-foliated', 'crystalline')
  }
  if (keywordString.match(/slate/)) {
    return createRockData('Slate', 'metamorphic', 83, 'Formed from low-grade metamorphism of shale or mudstone', 'foliated', 'fine-grained')
  }
  if (keywordString.match(/quartzite|quartz/)) {
    return createRockData('Quartzite', 'metamorphic', 81, 'Formed from metamorphism of sandstone under high pressure and temperature', 'non-foliated', 'granoblastic')
  }
  if (keywordString.match(/obsidian/)) {
    return createRockData('Obsidian', 'igneous', 90, 'Formed from rapid cooling of volcanic glass, preventing crystal formation', 'volcanic', 'glassy')
  }
  if (keywordString.match(/pumice/)) {
    return createRockData('Pumice', 'igneous', 87, 'Formed from gas-filled volcanic eruptions that create a frothy, lightweight rock', 'volcanic', 'vesicular')
  }
  
  // Characteristic-based classification
  
  // Igneous rocks - texture-based
  if (characteristics.texture === 'glassy') {
    return createRockData('Obsidian', 'igneous', 85, 'Formed from rapid cooling of volcanic glass, preventing crystal formation', 'volcanic', 'glassy')
  }
  
  if (characteristics.texture === 'vesicular' || characteristics.texture === 'porous') {
    if (characteristics.color === 'light') {
      return createRockData('Pumice', 'igneous', 80, 'Formed from gas-filled volcanic eruptions that create a frothy, lightweight rock', 'volcanic', 'vesicular')
    } else {
      return createRockData('Scoria', 'igneous', 75, 'Formed from basaltic or andesitic magma during Strombolian eruptions', 'volcanic', 'vesicular')
    }
  }
  
  if (characteristics.texture === 'coarse' || characteristics.crystalSize === 'large') {
    if (characteristics.color === 'light' || characteristics.color === 'gray') {
      return createRockData('Granite', 'igneous', 82, 'Formed from slow cooling of felsic magma deep within the Earth\'s crust', 'plutonic', 'phaneritic')
    } else if (characteristics.color === 'dark') {
      return createRockData('Gabbro', 'igneous', 78, 'Formed from slow cooling of mafic magma deep within the Earth\'s crust', 'plutonic', 'phaneritic')
    }
  }
  
  if (characteristics.texture === 'fine' && (characteristics.color === 'dark' || characteristics.color === 'black')) {
    return createRockData('Basalt', 'igneous', 78, 'Formed from rapid cooling of mafic lava flows on the Earth\'s surface', 'volcanic', 'aphanitic')
  }
  
  // Sedimentary rocks
  if (characteristics.texture === 'layered' || keywordString.match(/layer|bed|strat/)) {
    if (characteristics.hardness === 'soft' || keywordString.match(/clay|mud/)) {
      return createRockData('Shale', 'sedimentary', 75, 'Formed from compaction of clay and silt particles in quiet water environments', 'clastic', 'fine-grained')
    } else {
      return createRockData('Sandstone', 'sedimentary', 72, 'Formed from cementation of sand-sized mineral particles, primarily quartz', 'clastic', 'medium-grained')
    }
  }
  
  if (characteristics.hardness === 'soft' && (characteristics.color === 'light' || characteristics.color === 'white')) {
    return createRockData('Limestone', 'sedimentary', 75, 'Formed from accumulation of marine organisms and chemical precipitation in warm, shallow seas', 'chemical', 'crystalline')
  }
  
  if (keywordString.match(/sand|grain/) || characteristics.texture === 'coarse') {
    return createRockData('Sandstone', 'sedimentary', 72, 'Formed from cementation of sand-sized mineral particles, primarily quartz', 'clastic', 'medium-grained')
  }
  
  // Metamorphic rocks
  if (characteristics.texture === 'foliated' || keywordString.match(/flaky|sheet|split/)) {
    if (characteristics.hardness === 'soft') {
      return createRockData('Slate', 'metamorphic', 70, 'Formed from low-grade metamorphism of shale or mudstone', 'foliated', 'fine-grained')
    } else {
      return createRockData('Schist', 'metamorphic', 68, 'Formed from medium-grade metamorphism of shale or other fine-grained rocks', 'foliated', 'schistose')
    }
  }
  
  if (characteristics.texture === 'crystalline' || characteristics.luster === 'vitreous') {
    if (characteristics.color === 'light' || characteristics.color === 'white') {
      return createRockData('Marble', 'metamorphic', 76, 'Formed from metamorphism of limestone or dolomite under heat and pressure', 'non-foliated', 'crystalline')
    } else {
      return createRockData('Quartzite', 'metamorphic', 74, 'Formed from metamorphism of sandstone under high pressure and temperature', 'non-foliated', 'granoblastic')
    }
  }
  
  // Default fallbacks based on broad characteristics
  if (characteristics.color === 'dark' || characteristics.color === 'black') {
    return createRockData('Basalt', 'igneous', 65, 'Formed from rapid cooling of mafic lava flows on the Earth\'s surface', 'volcanic', 'aphanitic')
  }
  
  if (characteristics.color === 'light' || characteristics.color === 'gray') {
    return createRockData('Granite', 'igneous', 65, 'Formed from slow cooling of felsic magma deep within the Earth\'s crust', 'plutonic', 'phaneritic')
  }
  
  if (characteristics.hardness === 'soft') {
    return createRockData('Limestone', 'sedimentary', 60, 'Formed from accumulation of marine organisms and chemical precipitation in warm, shallow seas', 'chemical', 'crystalline')
  }
  
  // Final fallback - granite is most common
  console.log('Using final fallback - Granite')
  return createRockData('Granite', 'igneous', 55, 'Common igneous rock formed from cooling magma - identification needs more specific details', 'plutonic', 'phaneritic')
}

function createRockData(name: string, type: 'igneous' | 'metamorphic' | 'sedimentary', confidence: number, formation: string, subtype: string, textureType: string) {
  return {
    name,
    type,
    confidence,
    formation,
    subtype,
    textureType
  }
}

async function enhanceRockData(basicData: any) {
  try {
    // Get Wikipedia data for the rock
    const wikipediaData = await fetchWikipediaData(basicData.name)
    
    // Get geological location data
    const locationData = await fetchLocationData(basicData.name)
    
    return {
      ...basicData,
      locations: locationData.locations || getDefaultLocations(basicData.type),
      composition: getComposition(basicData.name),
      uses: getUses(basicData.name),
      classification: getClassification(basicData.name, basicData.type),
      funFacts: wikipediaData.funFacts || getDefaultFunFacts(basicData.name),
      image: wikipediaData.image
    }
  } catch (error) {
    console.error('Error enhancing rock data:', error)
    return {
      ...basicData,
      locations: getDefaultLocations(basicData.type),
      composition: getComposition(basicData.name),
      uses: getUses(basicData.name),
      classification: getClassification(basicData.name, basicData.type),
      funFacts: getDefaultFunFacts(basicData.name)
    }
  }
}

async function fetchWikipediaData(rockName: string) {
  try {
    const searchResponse = await fetch(
      `${WIKIPEDIA_API_BASE_URL}/page/summary/${encodeURIComponent(rockName)}`
    )
    
    if (searchResponse.ok) {
      const data = await searchResponse.json()
      return {
        funFacts: [data.extract || `${rockName} is a type of rock with unique geological properties.`],
        image: data.thumbnail?.source
      }
    }
  } catch (error) {
    console.error('Wikipedia API error:', error)
  }
  
  return { funFacts: [], image: null }
}

async function fetchLocationData(rockName: string) {
  // This would typically query geological databases
  // For now, returning based on rock type knowledge
  return { locations: [] }
}

function getDefaultLocations(rockType: string): string[] {
  const locationMap: Record<string, string[]> = {
    'igneous': ['Volcanic regions', 'Mountain ranges', 'Oceanic islands', 'Continental margins'],
    'sedimentary': ['River valleys', 'Ocean floors', 'Desert basins', 'Coastal plains'],
    'metamorphic': ['Mountain cores', 'Continental shields', 'Collision zones', 'Deep crustal regions']
  }
  
  return locationMap[rockType] || ['Worldwide distribution']
}

function getComposition(rockName: string): string[] {
  const compositionMap: Record<string, string[]> = {
    'Granite': ['Quartz (25-35%)', 'Feldspar (50-60%)', 'Mica (5-15%)', 'Hornblende'],
    'Basalt': ['Plagioclase feldspar', 'Pyroxene', 'Olivine', 'Magnetite'],
    'Limestone': ['Calcite (CaCO₃)', 'Aragonite', 'Dolomite', 'Fossil fragments'],
    'Sandstone': ['Quartz (dominant)', 'Feldspar', 'Rock fragments', 'Clay minerals'],
    'Shale': ['Clay minerals', 'Quartz', 'Feldspar', 'Organic matter'],
    'Schist': ['Mica', 'Quartz', 'Feldspar', 'Garnet', 'Staurolite'],
    'Quartzite': ['Quartz (>95%)', 'Minor feldspar', 'Mica traces'],
    'Obsidian': ['Volcanic glass', 'Silica (70-75%)', 'Minimal crystals'],
    'Pumice': ['Volcanic glass', 'Silica', 'Gas bubbles (vesicles)'],
    'Scoria': ['Basaltic glass', 'Pyroxene', 'Plagioclase', 'Olivine']
  }
  
  return compositionMap[rockName] || ['Mineral composition varies']
}

function getUses(rockName: string): string[] {
  const usesMap: Record<string, string[]> = {
    'Granite': ['Construction material', 'Countertops', 'Monuments', 'Road aggregate'],
    'Basalt': ['Road construction', 'Railroad ballast', 'Concrete aggregate', 'Stone tools'],
    'Limestone': ['Cement production', 'Building stone', 'Agricultural lime', 'Steel production'],
    'Sandstone': ['Building stone', 'Paving material', 'Glass manufacturing', 'Filtration'],
    'Shale': ['Brick manufacturing', 'Ceramic production', 'Oil and gas extraction'],
    'Schist': ['Roofing material', 'Decorative stone', 'Road construction'],
    'Quartzite': ['Construction aggregate', 'Railroad ballast', 'Roofing granules'],
    'Obsidian': ['Surgical instruments', 'Decorative objects', 'Archaeological tools'],
    'Pumice': ['Abrasive material', 'Concrete aggregate', 'Horticulture', 'Personal care'],
    'Scoria': ['Landscaping', 'Construction aggregate', 'Drainage material']
  }
  
  return usesMap[rockName] || ['Various industrial and construction applications']
}

function getClassification(rockName: string, rockType: string) {
  const classificationMap: Record<string, any> = {
    'Granite': { group: 'Felsic Intrusive', family: 'Granitoid', series: 'Alkali Feldspar' },
    'Basalt': { group: 'Mafic Extrusive', family: 'Basaltic', series: 'Tholeiitic' },
    'Limestone': { group: 'Carbonate', family: 'Calcitic' },
    'Sandstone': { group: 'Clastic', family: 'Arenaceous' },
    'Shale': { group: 'Clastic', family: 'Argillaceous' },
    'Schist': { group: 'Foliated', family: 'Regional Metamorphic' },
    'Quartzite': { group: 'Non-foliated', family: 'Contact Metamorphic' }
  }
  
  return classificationMap[rockName] || { group: `${rockType} rock` }
}

function getDefaultFunFacts(rockName: string): string[] {
  const funFactsMap: Record<string, string[]> = {
    'Granite': [
      'Granite makes up about 70-80% of the Earth\'s continental crust',
      'The word "granite" comes from the Latin "granum" meaning grain',
      'Some granite formations are over 3 billion years old'
    ],
    'Basalt': [
      'Basalt covers about 70% of the Earth\'s surface, mostly on ocean floors',
      'The dark side of the Moon is primarily basaltic rock',
      'Basalt can form hexagonal columns when cooling slowly'
    ],
    'Limestone': [
      'The Great Pyramid of Giza is built primarily from limestone blocks',
      'Limestone can contain fossils of ancient marine life',
      'Acid rain can dissolve limestone, forming caves and sinkholes'
    ]
  }
  
  return funFactsMap[rockName] || [`${rockName} has unique geological properties that make it scientifically interesting.`]
}