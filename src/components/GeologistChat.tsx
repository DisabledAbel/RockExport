import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, Pickaxe } from 'lucide-react';
import { RockData } from './RockResults';

interface Message {
  id: string;
  type: 'user' | 'geologist';
  content: string;
  timestamp: Date;
}

interface GeologistChatProps {
  rockData: RockData;
  onBack: () => void;
}

export const GeologistChat: React.FC<GeologistChatProps> = ({ rockData, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'geologist',
      content: `Hello! I'm your geological expert. I see you've identified ${rockData.name}, a fascinating ${rockData.type} rock! I have access to comprehensive geological databases and can answer any questions about this specimen or geology in general. What would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getGeologistResponse = async (userQuestion: string): Promise<string> => {
    try {
      // First try to get real geological data from APIs
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('geological-data', {
        body: {
          rockName: rockData.name,
          rockType: rockData.type,
          query: 'scientific_data'
        }
      });

      if (!error && data?.scientificData) {
        return generateResponseFromData(userQuestion, data.scientificData);
      }
    } catch (error) {
      console.warn('Could not fetch real-time geological data:', error);
    }

    // Fallback to rule-based responses
    return simulateGeologistResponse(userQuestion);
  };

  const generateResponseFromData = (question: string, scientificData: any): string => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('how') && (lowerQ.includes('form') || lowerQ.includes('creat'))) {
      return `Based on current geological research: ${scientificData.summary || rockData.formation} 
      
For more detailed information, you can explore: ${scientificData.pageUrl || 'geological databases'}`;
    }
    
    if (lowerQ.includes('where') && (lowerQ.includes('find') || lowerQ.includes('locat'))) {
      return `According to geological surveys, ${rockData.name} can be found in various locations worldwide. 
      
The scientific literature indicates: ${scientificData.summary?.substring(0, 200) || rockData.formation}...
      
For current geological feature locations, I recommend checking local geological surveys.`;
    }
    
    return `Based on geological databases: ${scientificData.summary || `${rockData.name} is a ${rockData.type} rock with unique properties.`}
    
${scientificData.pageUrl ? `Learn more: ${scientificData.pageUrl}` : ''}`;
  };

  const simulateGeologistResponse = (userQuestion: string): string => {
    const lowerQ = userQuestion.toLowerCase();
    
    // Sample responses based on common geological questions
    if (lowerQ.includes('how') && (lowerQ.includes('form') || lowerQ.includes('creat'))) {
      return `Great question about ${rockData.name} formation! ${rockData.formation} This process typically occurs over millions of years under specific temperature and pressure conditions. The minerals present in ${rockData.name} - ${rockData.composition.slice(0, 3).join(', ')} - crystallized during this formation process.`;
    }
    
    if (lowerQ.includes('where') && (lowerQ.includes('find') || lowerQ.includes('locat'))) {
      return `You can commonly find ${rockData.name} in these locations: ${rockData.locations.slice(0, 3).join(', ')}. These areas have the right geological conditions for ${rockData.type} rock formation. Look for outcrops in areas with ${rockData.type === 'igneous' ? 'volcanic activity or plutonic intrusions' : rockData.type === 'metamorphic' ? 'mountain-building events or contact zones' : 'sedimentary basins and depositional environments'}.`;
    }
    
    if (lowerQ.includes('age') || lowerQ.includes('old')) {
      const ageInfo = rockData.type === 'igneous' ? 'from recent volcanic activity to billions of years old' : 
                     rockData.type === 'metamorphic' ? 'typically very ancient, often Precambrian' : 
                     'ranging from recent deposits to hundreds of millions of years old';
      return `${rockData.name} specimens can vary in age ${ageInfo}. The age depends on when the specific geological processes occurred in that location. Dating techniques like radiometric dating of zircon crystals or stratigraphic relationships help determine precise ages.`;
    }
    
    if (lowerQ.includes('mineral') || lowerQ.includes('composition')) {
      return `The mineral composition of ${rockData.name} includes: ${rockData.composition.join(', ')}. Each mineral contributes to the rock's properties - hardness, color, cleavage patterns, and weathering resistance. The proportion and arrangement of these minerals determine the rock's texture and appearance.`;
    }
    
    if (lowerQ.includes('use') || lowerQ.includes('purpose')) {
      return `${rockData.name} has several important applications: ${rockData.uses.join('; ')}. Its physical and chemical properties make it valuable for these purposes. The durability and composition are key factors in determining its commercial uses.`;
    }
    
    // Default response
    return `That's an interesting question about ${rockData.name}! As a ${rockData.type} rock, it has unique characteristics. Based on current geological understanding and database information, I'd need to query specific geological surveys for detailed information about your question. Would you like me to elaborate on any particular aspect of this rock's formation, composition, or geological significance?`;
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Get real geological response
    try {
      const response = await getGeologistResponse(currentMessage);
      const geologistMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'geologist',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, geologistMessage]);
    } catch (error) {
      console.error('Error getting geologist response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'geologist',
        content: 'I apologize, but I\'m having trouble accessing geological databases right now. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "How was this rock formed?",
    "Where can I find more specimens?",
    "What makes this rock unique?",
    "How old might this specimen be?"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Pickaxe className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">Geological Expert</h2>
              <p className="text-xs text-muted-foreground">Discussing {rockData.name}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className="p-4 h-96">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'geologist' && (
                  <Avatar className="h-8 w-8 bg-gradient-geological">
                    <AvatarFallback className="text-xs text-primary-foreground">GE</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8 bg-gradient-earth">
                    <AvatarFallback className="text-xs">YU</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-gradient-geological">
                  <AvatarFallback className="text-xs text-primary-foreground">GE</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Suggested Questions:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start h-auto p-2 text-left"
                onClick={() => setCurrentMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Message Input */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about formation, age, composition, locations..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isTyping}
            variant="geological"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};