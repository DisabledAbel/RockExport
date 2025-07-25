import React, { useState } from 'react';
import { RockUpload } from '@/components/RockUpload';
import { RockResults, RockData } from '@/components/RockResults';
import { GeologistChat } from '@/components/GeologistChat';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pickaxe, Mountain, Microscope } from 'lucide-react';

type AppState = 'upload' | 'results' | 'chat';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [currentRock, setCurrentRock] = useState<RockData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock rock identification service
  const identifyRock = async (image: File | null, description: string): Promise<RockData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock identification based on description keywords or return default granite
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('black') || lowerDesc.includes('dark') || lowerDesc.includes('volcanic')) {
      return {
        name: 'Basalt',
        type: 'igneous',
        confidence: 85,
        formation: 'Basalt forms when mafic lava flows from volcanic eruptions cool rapidly at or near the Earth\'s surface. The rapid cooling prevents large crystals from forming, resulting in a fine-grained texture with small, barely visible mineral crystals.',
        locations: ['Hawaiian Islands', 'Columbia River Plateau', 'Iceland', 'Mid-Ocean Ridges', 'Continental Flood Basalts'],
        composition: ['Plagioclase feldspar', 'Pyroxene', 'Olivine', 'Magnetite', 'Ilmenite'],
        uses: [
          'Construction aggregate and road base material',
          'Decorative stone for landscaping',
          'Railroad ballast',
          'Concrete production',
          'Stone tools in ancient cultures'
        ],
        classification: {
          group: 'Volcanic rocks',
          family: 'Mafic igneous',
          series: 'Basaltic'
        },
        funFacts: [
          'Basalt covers more of Earth\'s surface than any other rock type, forming the ocean floor',
          'The Moon\'s dark patches (maria) are ancient basalt flows',
          'Some basalt formations create distinctive columnar joints when cooling, like at Giant\'s Causeway'
        ]
      };
    }
    
    if (lowerDesc.includes('layer') || lowerDesc.includes('sand') || lowerDesc.includes('beach')) {
      return {
        name: 'Sandstone',
        type: 'sedimentary',
        confidence: 78,
        formation: 'Sandstone forms from the compression and cementation of sand-sized mineral particles, primarily quartz and feldspar. These particles accumulate in environments like beaches, deserts, and river channels, then are buried and lithified over millions of years.',
        locations: ['Colorado Plateau', 'Appalachian Mountains', 'Great Plains', 'Sahara Desert regions', 'Australian Outback'],
        composition: ['Quartz', 'Feldspar', 'Rock fragments', 'Mica', 'Clay minerals', 'Iron oxide cement'],
        uses: [
          'Building stone and architectural facades',
          'Grinding wheels and abrasives',
          'Glass manufacturing (high-quartz varieties)',
          'Landscaping and decorative stone',
          'Oil and gas reservoir rock'
        ],
        classification: {
          group: 'Clastic sedimentary rocks',
          family: 'Arenites',
          series: 'Quartz sandstone'
        },
        funFacts: [
          'The red color in many sandstones comes from iron oxide (rust) coating the grains',
          'Some sandstones are so pure they\'re used to make glass',
          'Sandstone formations can preserve ancient sand dune structures for millions of years'
        ]
      };
    }
    
    // Default to granite
    return {
      name: 'Granite',
      type: 'igneous',
      confidence: 92,
      formation: 'Granite forms deep within the Earth\'s crust as magma cools slowly over millions of years. This slow cooling process allows large crystals of quartz, feldspar, and mica to develop, creating granite\'s characteristic speckled appearance.',
      locations: ['Sierra Nevada Mountains', 'New Hampshire', 'Mount Rushmore', 'Scottish Highlands', 'Yosemite National Park'],
      composition: ['Quartz', 'Potassium feldspar', 'Plagioclase feldspar', 'Biotite mica', 'Muscovite mica', 'Hornblende'],
      uses: [
        'Countertops and building stone',
        'Monuments and sculptures',
        'Road construction aggregate',
        'Railroad ballast',
        'Decorative landscaping stone'
      ],
      classification: {
        group: 'Plutonic rocks',
        family: 'Felsic igneous',
        series: 'Granitic'
      },
      funFacts: [
        'Granite is one of the most abundant rocks in the continental crust',
        'The word "granite" comes from the Latin "granum" meaning grain',
        'Some granite formations are over 3 billion years old',
        'Granite often contains tiny amounts of radioactive elements like uranium'
      ]
    };
  };

  const handleAnalyze = async (image: File | null, description: string) => {
    setIsAnalyzing(true);
    try {
      const rockData = await identifyRock(image, description);
      setCurrentRock(rockData);
      setAppState('results');
    } catch (error) {
      console.error('Error identifying rock:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToUpload = () => {
    setAppState('upload');
    setCurrentRock(null);
  };

  const handleOpenChat = () => {
    setAppState('chat');
  };

  const handleBackToResults = () => {
    setAppState('results');
  };

  if (appState === 'chat' && currentRock) {
    return (
      <div className="min-h-screen bg-background p-4">
        <GeologistChat
          rockData={currentRock}
          onBack={handleBackToResults}
        />
      </div>
    );
  }

  if (appState === 'results' && currentRock) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <RockResults
            rockData={currentRock}
            onBack={handleBackToUpload}
            onAskQuestion={handleOpenChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-geological text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary-foreground/10 rounded-full">
                <Pickaxe className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">RockExpert</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Your AI-powered geological companion. Upload a photo or describe your rock specimen for instant identification and expert insights.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Mountain className="h-3 w-3 mr-1" />
                AI Rock Identification
              </Badge>
              <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Microscope className="h-3 w-3 mr-1" />
                Geological Database
              </Badge>
              <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Pickaxe className="h-3 w-3 mr-1" />
                Expert Consultation
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 -mt-8">
        <Card className="p-6 shadow-rock">
          <RockUpload 
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </Card>

        {/* How it works */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-center">How RockExpert Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-earth rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload & Describe</h3>
              <p className="text-sm text-muted-foreground">
                Take a photo of your rock and add any details about texture, location, or appearance.
              </p>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-geological rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes visual features and queries multiple geological databases.
              </p>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-mineral rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Results</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed identification with formation info, locations, and geological insights.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;