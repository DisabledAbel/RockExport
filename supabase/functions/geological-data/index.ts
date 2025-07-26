import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEONAMES_USERNAME = 'demo' // Using demo account for free tier
const WIKIPEDIA_API_BASE_URL = 'https://en.wikipedia.org/api/rest_v1'
const WIKIMEDIA_COMMONS_API = 'https://commons.wikimedia.org/w/api.php'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rockName, rockType, query } = await req.json()

    let response
    
    if (query === 'geological_features') {
      response = await fetchGeologicalFeatures(rockName)
    } else if (query === 'rock_images') {
      response = await fetchRockImages(rockName)
    } else if (query === 'scientific_data') {
      response = await fetchScientificData(rockName, rockType)
    } else {
      response = await fetchGeneralGeologicalData(rockName, rockType)
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error fetching geological data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch geological data' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function fetchGeologicalFeatures(rockName: string) {
  try {
    // Query GeoNames for geological features related to the rock
    const response = await fetch(
      `http://api.geonames.org/searchJSON?q=${encodeURIComponent(rockName)}&featureClass=T&username=${GEONAMES_USERNAME}&maxRows=10`
    )
    
    if (response.ok) {
      const data = await response.json()
      return {
        features: data.geonames || [],
        locations: data.geonames?.map((feature: any) => ({
          name: feature.name,
          country: feature.countryName,
          coordinates: [feature.lat, feature.lng],
          type: feature.fclName
        })) || []
      }
    }
  } catch (error) {
    console.error('GeoNames API error:', error)
  }
  
  return { features: [], locations: [] }
}

async function fetchRockImages(rockName: string) {
  try {
    // Search Wikimedia Commons for rock images
    const searchResponse = await fetch(
      `${WIKIMEDIA_COMMONS_API}?action=query&list=search&srsearch=${encodeURIComponent(rockName + ' rock geology')}&format=json&origin=*&srlimit=5`
    )
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      const images = []
      
      for (const result of searchData.query?.search || []) {
        if (result.title.includes('File:') && (result.title.toLowerCase().includes('.jpg') || result.title.toLowerCase().includes('.png'))) {
          try {
            const imageInfoResponse = await fetch(
              `${WIKIMEDIA_COMMONS_API}?action=query&titles=${encodeURIComponent(result.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`
            )
            
            if (imageInfoResponse.ok) {
              const imageData = await imageInfoResponse.json()
              const page = Object.values(imageData.query.pages)[0] as any
              if (page.imageinfo?.[0]?.url) {
                images.push({
                  url: page.imageinfo[0].url,
                  title: result.title.replace('File:', ''),
                  description: result.snippet
                })
              }
            }
          } catch (error) {
            console.error('Error fetching image info:', error)
          }
        }
      }
      
      return { images }
    }
  } catch (error) {
    console.error('Wikimedia Commons API error:', error)
  }
  
  return { images: [] }
}

async function fetchScientificData(rockName: string, rockType: string) {
  try {
    // Fetch detailed Wikipedia data
    const wikiResponse = await fetch(
      `${WIKIPEDIA_API_BASE_URL}/page/summary/${encodeURIComponent(rockName)}`
    )
    
    let wikiData = null
    if (wikiResponse.ok) {
      wikiData = await wikiResponse.json()
    }
    
    // Get related articles
    const relatedResponse = await fetch(
      `${WIKIPEDIA_API_BASE_URL}/page/related/${encodeURIComponent(rockName)}`
    )
    
    let relatedData = null
    if (relatedResponse.ok) {
      relatedData = await relatedResponse.json()
    }
    
    return {
      summary: wikiData?.extract || `${rockName} is a ${rockType} rock with unique geological characteristics.`,
      fullText: wikiData?.extract_html || '',
      image: wikiData?.thumbnail?.source,
      relatedTopics: relatedData?.pages?.slice(0, 5)?.map((page: any) => ({
        title: page.title,
        description: page.description,
        url: page.content_urls?.desktop?.page
      })) || [],
      lastModified: wikiData?.timestamp,
      pageUrl: wikiData?.content_urls?.desktop?.page
    }
  } catch (error) {
    console.error('Error fetching scientific data:', error)
  }
  
  return {
    summary: `${rockName} is a ${rockType} rock.`,
    relatedTopics: []
  }
}

async function fetchGeneralGeologicalData(rockName: string, rockType: string) {
  // Combine all data sources
  const [features, images, scientific] = await Promise.all([
    fetchGeologicalFeatures(rockName),
    fetchRockImages(rockName),
    fetchScientificData(rockName, rockType)
  ])
  
  return {
    geologicalFeatures: features,
    images: images.images || [],
    scientificData: scientific,
    metadata: {
      dataSource: 'Multiple geological databases',
      lastUpdated: new Date().toISOString(),
      confidence: 'varies by source'
    }
  }
}