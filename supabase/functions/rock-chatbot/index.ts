import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Data sources for geological information
const DATA_SOURCES = {
  usgs: {
    name: "United States Geological Survey",
    url: "https://www.usgs.gov/",
    description: "Official geological data and mineral information from the US government"
  },
  mindat: {
    name: "Mindat.org",
    url: "https://www.mindat.org/",
    description: "Comprehensive mineral database with detailed properties and locations"
  },
  geonames: {
    name: "GeoNames",
    url: "https://www.geonames.org/",
    description: "Geographical database with rock formation locations"
  },
  wikipedia: {
    name: "Wikipedia",
    url: "https://en.wikipedia.org/",
    description: "Open encyclopedia with geological articles"
  },
  dataGov: {
    name: "Data.gov Geospatial Datasets",
    url: "https://catalog.data.gov/dataset/?metadata_type=geospatial",
    description: "US government open geospatial datasets including geological surveys"
  }
};

async function fetchGeologicalData(query: string) {
  const sources = [];
  
  try {
    // Search Wikipedia for geological information
    const wikiResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query + " geology")}`
    );
    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json();
      sources.push({
        source: DATA_SOURCES.wikipedia,
        title: wikiData.title,
        summary: wikiData.extract,
        url: wikiData.content_urls?.desktop?.page
      });
    }
  } catch (error) {
    console.log("Wikipedia search failed:", error);
  }

  // Add Data.gov geospatial reference
  sources.push({
    source: DATA_SOURCES.dataGov,
    title: "US Geospatial Datasets",
    summary: "Access comprehensive geological and geospatial datasets from US government agencies, including mineral surveys, geological formations, and environmental data.",
    url: DATA_SOURCES.dataGov.url
  });

  return sources;
}

async function callHuggingFaceAPI(prompt: string, context: string) {
  const hfToken = Deno.env.get('HUGGING_FACE_TOKEN');
  if (!hfToken) {
    throw new Error('Hugging Face token not configured');
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
    {
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `Context: ${context}\n\nQuestion: ${prompt}\n\nAs a geological expert, I'll provide detailed information about rocks, minerals, and geological processes. Here's what I know:`,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      }),
    }
  );

  if (!response.ok) {
    // Fallback to local geological knowledge
    return generateGeologicalResponse(prompt, context);
  }

  const result = await response.json();
  return result[0]?.generated_text || generateGeologicalResponse(prompt, context);
}

function generateGeologicalResponse(prompt: string, context: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('igneous')) {
    return "Igneous rocks form from the cooling and solidification of magma or lava. Examples include granite (intrusive) and basalt (extrusive). These rocks are characterized by their crystalline structure and mineral composition.";
  }
  
  if (lowerPrompt.includes('sedimentary')) {
    return "Sedimentary rocks form from the accumulation and cementation of sediments. Common types include sandstone, limestone, and shale. They often contain fossils and show layered structures called strata.";
  }
  
  if (lowerPrompt.includes('metamorphic')) {
    return "Metamorphic rocks form when existing rocks are subjected to high pressure and temperature. Examples include marble (from limestone) and gneiss (from granite). They show foliation and mineral recrystallization.";
  }
  
  if (lowerPrompt.includes('mineral')) {
    return "Minerals are naturally occurring inorganic substances with specific chemical compositions and crystal structures. They're the building blocks of rocks and can be identified by properties like hardness, color, and luster.";
  }
  
  return `Based on geological knowledge and available data sources, I can help you understand rocks and minerals. ${context ? 'From the provided sources: ' + context : 'I recommend checking the referenced sources for detailed information.'}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, rockData } = await req.json();
    
    console.log("Processing chatbot request:", message);
    
    // Fetch relevant geological data
    const sources = await fetchGeologicalData(message);
    
    // Create context from sources
    const context = sources.map(source => 
      `${source.source.name}: ${source.summary}`
    ).join('\n\n');
    
    // Get AI response
    const aiResponse = await callHuggingFaceAPI(message, context);
    
    // Prepare response with sources
    const response = {
      message: aiResponse,
      sources: sources,
      timestamp: new Date().toISOString(),
      rockContext: rockData || null
    };
    
    console.log("Chatbot response generated");
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in rock-chatbot function:', error);
    
    // Fallback response
    const fallbackResponse = {
      message: "I'm here to help with geological questions! I can provide information about rocks, minerals, formations, and geological processes. What would you like to know?",
      sources: [
        {
          source: DATA_SOURCES.dataGov,
          title: "US Geological Datasets",
          summary: "Comprehensive geological and geospatial data from US government sources",
          url: DATA_SOURCES.dataGov.url
        }
      ],
      timestamp: new Date().toISOString(),
      rockContext: null
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});