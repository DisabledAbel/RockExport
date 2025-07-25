import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MapPin, Atom, Pickaxe, Calendar, BookOpen, ArrowLeft } from 'lucide-react';

export interface RockData {
  name: string;
  type: 'igneous' | 'metamorphic' | 'sedimentary';
  confidence: number;
  formation: string;
  locations: string[];
  composition: string[];
  uses: string[];
  classification: {
    group: string;
    family?: string;
    series?: string;
  };
  funFacts: string[];
  image?: string;
}

interface RockResultsProps {
  rockData: RockData;
  onBack: () => void;
  onAskQuestion: () => void;
}

export const RockResults: React.FC<RockResultsProps> = ({ 
  rockData, 
  onBack, 
  onAskQuestion 
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'igneous': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'metamorphic': return 'bg-granite/10 text-granite border-granite/20';
      case 'sedimentary': return 'bg-sandstone/10 text-sandstone border-sandstone/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with identification */}
      <Card className="p-6 bg-gradient-earth">
        <div className="flex items-start justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`text-sm font-medium ${getConfidenceColor(rockData.confidence)}`}>
            {rockData.confidence}% confidence
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{rockData.name}</h1>
          <Badge variant="outline" className={getTypeColor(rockData.type)}>
            {rockData.type.toUpperCase()} ROCK
          </Badge>
          
          {rockData.image && (
            <div className="mt-6">
              <img
                src={rockData.image}
                alt={rockData.name}
                className="w-full max-w-sm mx-auto h-48 object-cover rounded-lg shadow-specimen"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Formation Process */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Formation Process</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">{rockData.formation}</p>
      </Card>

      {/* Locations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Typical Locations</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {rockData.locations.map((location, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {location}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Composition */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Atom className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Chemical Composition</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {rockData.composition.map((mineral, index) => (
            <div key={index} className="text-sm p-2 bg-muted rounded">
              {mineral}
            </div>
          ))}
        </div>
      </Card>

      {/* Uses */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Pickaxe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Uses & Applications</h2>
        </div>
        <ul className="space-y-2">
          {rockData.uses.map((use, index) => (
            <li key={index} className="text-muted-foreground flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
              {use}
            </li>
          ))}
        </ul>
      </Card>

      {/* Classification */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Scientific Classification</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Group:</span>
            <span className="text-muted-foreground">{rockData.classification.group}</span>
          </div>
          {rockData.classification.family && (
            <div className="flex justify-between">
              <span className="font-medium">Family:</span>
              <span className="text-muted-foreground">{rockData.classification.family}</span>
            </div>
          )}
          {rockData.classification.series && (
            <div className="flex justify-between">
              <span className="font-medium">Series:</span>
              <span className="text-muted-foreground">{rockData.classification.series}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Fun Facts */}
      {rockData.funFacts.length > 0 && (
        <Card className="p-6 bg-gradient-mineral">
          <h2 className="text-xl font-semibold mb-4">Did You Know?</h2>
          <div className="space-y-3">
            {rockData.funFacts.map((fact, index) => (
              <div key={index} className="text-sm leading-relaxed p-3 bg-card/80 rounded-lg">
                {fact}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ask Follow-up Questions */}
      <div className="flex justify-center pt-4">
        <Button variant="specimen" onClick={onAskQuestion} className="w-full max-w-md">
          Ask Questions About This Rock
        </Button>
      </div>
    </div>
  );
};