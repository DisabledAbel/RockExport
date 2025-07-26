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
    crystalSize: 'unknown'
  }

  if (description) {
    const desc = description.toLowerCase()
    
    // Texture analysis
    if (desc.includes('coarse') || desc.includes('rough')) characteristics.texture = 'coarse'
    if (desc.includes('fine') || desc.includes('smooth')) characteristics.texture = 'fine'
    if (desc.includes('glassy') || desc.includes('glass')) characteristics.texture = 'glassy'
    if (desc.includes('porous') || desc.includes('holes')) characteristics.texture = 'vesicular'
    
    // Color analysis
    if (desc.includes('dark') || desc.includes('black')) characteristics.color = 'dark'
    if (desc.includes('light') || desc.includes('white')) characteristics.color = 'light'
    if (desc.includes('red') || desc.includes('pink')) characteristics.color = 'red'
    if (desc.includes('green')) characteristics.color = 'green'
    if (desc.includes('gray') || desc.includes('grey')) characteristics.color = 'gray'
    
    // Hardness indicators
    if (desc.includes('hard') || desc.includes('difficult to scratch')) characteristics.hardness = 'hard'
    if (desc.includes('soft') || desc.includes('easy to scratch')) characteristics.hardness = 'soft'
    
    // Luster
    if (desc.includes('shiny') || desc.includes('metallic')) characteristics.luster = 'metallic'
    if (desc.includes('dull') || desc.includes('earthy')) characteristics.luster = 'dull'
    if (desc.includes('glassy') || desc.includes('vitreous')) characteristics.luster = 'vitreous'
  }

  if (imageAnalysis?.colors) {
    characteristics.dominantColors = imageAnalysis.colors
  }

  return characteristics
}

function classifyRock(characteristics: any) {
  // Simplified rock classification based on geological principles
  
  // Igneous rocks
  if (characteristics.texture === 'glassy') {
    return {
      name: 'Obsidian',
      type: 'igneous' as const,
      confidence: 85,
      formation: 'Formed from rapid cooling of volcanic glass, preventing crystal formation',
      subtype: 'volcanic',
      textureType: 'glassy'
    }
  }
  
  if (characteristics.texture === 'vesicular' || characteristics.texture === 'porous') {
    if (characteristics.color === 'light') {
      return {
        name: 'Pumice',
        type: 'igneous' as const,
        confidence: 80,
        formation: 'Formed from gas-filled volcanic eruptions that create a frothy, lightweight rock',
        subtype: 'volcanic',
        textureType: 'vesicular'
      }
    } else {
      return {
        name: 'Scoria',
        type: 'igneous' as const,
        confidence: 75,
        formation: 'Formed from basaltic or andesitic magma during Strombolian eruptions',
        subtype: 'volcanic',
        textureType: 'vesicular'
      }
    }
  }
  
  if (characteristics.texture === 'coarse' && characteristics.color === 'light') {
    return {
      name: 'Granite',
      type: 'igneous' as const,
      confidence: 82,
      formation: 'Formed from slow cooling of felsic magma deep within the Earth\'s crust',
      subtype: 'plutonic',
      textureType: 'phaneritic'
    }
  }
  
  if (characteristics.texture === 'fine' && characteristics.color === 'dark') {
    return {
      name: 'Basalt',
      type: 'igneous' as const,
      confidence: 78,
      formation: 'Formed from rapid cooling of mafic lava flows on the Earth\'s surface',
      subtype: 'volcanic',
      textureType: 'aphanitic'
    }
  }
  
  // Sedimentary rocks
  if (characteristics.texture === 'fine' && characteristics.hardness === 'soft') {
    if (characteristics.color === 'light') {
      return {
        name: 'Limestone',
        type: 'sedimentary' as const,
        confidence: 75,
        formation: 'Formed from accumulation of marine organisms and chemical precipitation in warm, shallow seas',
        subtype: 'chemical',
        textureType: 'crystalline'
      }
    } else {
      return {
        name: 'Shale',
        type: 'sedimentary' as const,
        confidence: 70,
        formation: 'Formed from compaction of clay and silt particles in quiet water environments',
        subtype: 'clastic',
        textureType: 'fine-grained'
      }
    }
  }
  
  if (characteristics.texture === 'coarse' && (characteristics.hardness === 'hard' || characteristics.hardness === 'unknown')) {
    return {
      name: 'Sandstone',
      type: 'sedimentary' as const,
      confidence: 72,
      formation: 'Formed from cementation of sand-sized mineral particles, primarily quartz',
      subtype: 'clastic',
      textureType: 'medium-grained'
    }
  }
  
  // Metamorphic rocks
  if (characteristics.luster === 'metallic' || characteristics.color === 'dark') {
    return {
      name: 'Schist',
      type: 'metamorphic' as const,
      confidence: 68,
      formation: 'Formed from medium-grade metamorphism of shale or other fine-grained rocks',
      subtype: 'foliated',
      textureType: 'schistose'
    }
  }
  
  if (characteristics.hardness === 'hard' && characteristics.color === 'light') {
    return {
      name: 'Quartzite',
      type: 'metamorphic' as const,
      confidence: 74,
      formation: 'Formed from metamorphism of sandstone under high pressure and temperature',
      subtype: 'non-foliated',
      textureType: 'granoblastic'
    }
  }
  
  // Default fallback
  return {
    name: 'Unknown Rock',
    type: 'igneous' as const,
    confidence: 30,
    formation: 'Unable to determine formation process from available characteristics',
    subtype: 'unknown',
    textureType: 'unknown'
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