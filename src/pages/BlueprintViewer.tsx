import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, Copy, ExternalLink, Mail, Users, Calendar, Clock } from 'lucide-react';
import { ConciseBlueprint } from '@/types/blueprint';
import { toast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import type { Blueprint as FullBlueprintType } from '@/components/workshop/types/workshop'; // Alias to avoid conflict

const fetchBlueprint = async (shareId: string | undefined): Promise<ConciseBlueprint | null> => {
  if (!shareId) {
    return null;
  }
  
  console.log("Fetching blueprint with share_id:", shareId);
  
  // First, try to find in workshops table by share_id
  const { data: workshopData, error: workshopError } = await supabase
    .from('workshops')
    .select('generated_blueprint, share_id, name') // Added name for title fallback
    .eq('share_id', shareId)
    .maybeSingle();
    
  if (workshopError) {
    console.error('Error fetching workshop by share_id:', workshopError);
    // Don't throw yet, try generated_blueprints table
  }
  
  if (workshopData && workshopData.generated_blueprint) {
    console.log("Blueprint found in workshops table via share_id:", workshopData.generated_blueprint);
    const fullBlueprint = workshopData.generated_blueprint as unknown as FullBlueprintType; // Cast to FullBlueprintType
    
    const conciseBlueprint: ConciseBlueprint = {
      workshopTitle: fullBlueprint.title || workshopData.name || "Untitled Meeting",
      objectives: (typeof fullBlueprint.objective === 'string' ? [fullBlueprint.objective] : fullBlueprint.objective) || (fullBlueprint as any).objectives || [], // Handle both single objective and objectives array
      agendaItems: fullBlueprint.agenda || (fullBlueprint as any).steps?.map((s: any) => s.name) || [],
      attendeesList: fullBlueprint.attendees ? fullBlueprint.attendees.map(a => a.name || a.email || "Unknown Attendee") : [],
      basicTimeline: (fullBlueprint.steps || []).map(step => ({
        activity: step.name,
        durationEstimate: `${step.duration || 'N/A'}` // Ensure duration is string
      })),
      meetingContext: fullBlueprint.description
    };
    return conciseBlueprint;
  }

  // If not found in workshops or no generated_blueprint, try generated_blueprints table
  console.log("No blueprint in workshop or workshop not found by share_id, checking generated_blueprints table...");
  const { data, error } = await supabase
    .from('generated_blueprints')
    .select('blueprint_data, share_id')
    .eq('share_id', shareId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching blueprint from generated_blueprints:', error);
    throw new Error(error.message); // Throw if error here, as it's the last resort
  }

  if (!data || !data.blueprint_data) {
    console.log("No blueprint found for share_id:", shareId, "in generated_blueprints table either.");
    return null; 
  }
  
  console.log("Blueprint found in generated_blueprints table:", data.blueprint_data);
  return data.blueprint_data as unknown as ConciseBlueprint;
};

const BlueprintViewer: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  
  console.log("BlueprintViewer rendering with shareId:", shareId);
  
  const { data: blueprint, isLoading, error } = useQuery<ConciseBlueprint | null>({
    queryKey: ['blueprintViewer', shareId], // Changed queryKey to avoid conflict with other useQuery for 'blueprint'
    queryFn: () => fetchBlueprint(shareId),
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "The blueprint link has been copied to your clipboard.",
    });
  };

  const handleOpenInApp = () => {
    // Navigate to the main workshop page with the ID (which could be a share_id)
    if (shareId) {
      navigate(`/workshop?id=${shareId}`);
    } else {
      // Fallback if somehow shareId is not available, though unlikely here
      navigate('/workshop'); 
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Loading Blueprint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
        <Card className="w-full max-w-lg bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Blueprint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">We couldn't load the blueprint. It might have been moved or deleted.</p>
            <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Navbar /> {/* Added Navbar here for consistency */}
        <Card className="w-full max-w-lg bg-white shadow-xl mt-8">
          <CardHeader>
            <CardTitle>Blueprint Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested blueprint could not be found. Please check the link and try again.</p>
            <Button onClick={() => navigate('/workshop')} className="mt-4">Go to My Blueprints</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mailtoLink = `mailto:agenda@teho.ai?subject=Regarding Teho.ai Blueprint for: ${encodeURIComponent(blueprint.workshopTitle)}&body=Hi Teho.ai team,%0D%0A%0D%0AI'd like to try teho.ai for my next meeting. Here's the context from the blueprint:%0D%0A%0D%0AWorkshop Title: ${encodeURIComponent(blueprint.workshopTitle)}%0D%0AObjectives: ${blueprint.objectives.map(obj => `- ${encodeURIComponent(obj)}`).join('%0D%0A')}%0D%0A%0D%0ALooking forward to hearing from you!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <header className="text-center mb-8">
        <a href="/" className="inline-block">
          <img src="/logo-teho-light.svg" alt="teho.ai Logo" className="h-10 w-auto mx-auto" />
        </a>
        <p className="text-sm text-slate-400 mt-1">Blueprint by teho.ai</p>
      </header>

      <Card className="w-full max-w-3xl mx-auto bg-slate-800 shadow-2xl border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="secondary" className="mb-2 bg-sky-500 text-white border-sky-500">Meeting Blueprint</Badge>
              <CardTitle className="text-3xl font-bold text-sky-400">{blueprint.workshopTitle}</CardTitle>
            </div>
            <Button variant="outline" onClick={handleCopyLink} size="sm" className="ml-auto text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white">
              <Copy className="mr-2 h-4 w-4" /> Copy Link
            </Button>
          </div>
          {blueprint.meetingContext && (
            <CardDescription className="mt-2 text-slate-400">{blueprint.meetingContext}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-sky-300 flex items-center"><List className="mr-2 h-5 w-5 text-sky-400" />Objectives</h3>
            <ul className="list-disc list-inside pl-5 space-y-1 text-slate-300">
              {blueprint.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2 text-sky-300 flex items-center"><Calendar className="mr-2 h-5 w-5 text-sky-400" />Agenda Items</h3>
            <ul className="list-decimal list-inside pl-5 space-y-1 text-slate-300">
              {blueprint.agendaItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {blueprint.attendeesList && blueprint.attendeesList.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-sky-300 flex items-center"><Users className="mr-2 h-5 w-5 text-sky-400" />Attendees</h3>
              <div className="flex flex-wrap gap-2">
                {blueprint.attendeesList.map((attendee, index) => (
                  <Badge key={index} variant="outline" className="bg-slate-700 border-slate-600 text-slate-300">{attendee}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-2 text-sky-300 flex items-center"><Clock className="mr-2 h-5 w-5 text-sky-400" />Basic Timeline</h3>
            <ul className="space-y-2">
              {blueprint.basicTimeline.map((step, index) => (
                <li key={index} className="flex justify-between p-2 bg-slate-700/50 rounded-md">
                  <span>{step.activity}</span>
                  <Badge variant="secondary" className="bg-slate-600 text-slate-200 border-slate-500">{step.durationEstimate}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-slate-700">
          <Button variant="default" onClick={handleOpenInApp} size="lg" className="bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto">
            <ExternalLink className="mr-2 h-4 w-4" /> Open in teho.ai App
          </Button>
        </CardFooter>
      </Card>
      <footer className="text-center mt-12 text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} teho.ai. All rights reserved.
      </footer>
    </div>
  );
};

export default BlueprintViewer;
