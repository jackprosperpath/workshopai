
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, Copy, ExternalLink, Mail, Users, Calendar, Clock } from 'lucide-react';
import { ConciseBlueprint } from '@/types/blueprint'; // Using the new client-side type
import { toast } from '@/components/ui/use-toast'; // Corrected import path for use-toast

const fetchBlueprint = async (shareId: string | undefined): Promise<ConciseBlueprint | null> => {
  if (!shareId) {
    return null;
  }
  
  console.log("Fetching blueprint with share_id:", shareId);
  
  const { data, error } = await supabase
    .from('generated_blueprints')
    .select('blueprint_data')
    .eq('share_id', shareId)
    .maybeSingle(); // Use maybeSingle to handle no data found gracefully

  if (error) {
    console.error('Error fetching blueprint:', error);
    throw new Error(error.message);
  }

  if (!data || !data.blueprint_data) {
    console.log("No blueprint found for share_id:", shareId);
    return null; // Blueprint not found or blueprint_data is null
  }
  
  console.log("Blueprint found:", data.blueprint_data);
  
  // The blueprint_data from the DB should match ConciseBlueprint structure
  // Cast to unknown first, then to ConciseBlueprint to satisfy TypeScript
  return data.blueprint_data as unknown as ConciseBlueprint;
};

const BlueprintViewer: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  
  console.log("BlueprintViewer rendering with shareId:", shareId);
  
  const { data: blueprint, isLoading, error } = useQuery<ConciseBlueprint | null>({
    queryKey: ['blueprint', shareId],
    queryFn: () => fetchBlueprint(shareId),
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "The blueprint link has been copied to your clipboard.",
    });
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
        <Card className="w-full max-w-lg bg-white shadow-xl">
          <CardHeader>
            <CardTitle>Blueprint Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested blueprint could not be found. Please check the link and try again.</p>
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
          <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto">
            <a href={mailtoLink}>
              <Mail className="mr-2 h-4 w-4" /> Try teho.ai for your next meeting!
            </a>
          </Button>
          <Button variant="outline" asChild size="lg" className="text-sky-400 border-sky-500 hover:bg-sky-500/10 hover:text-sky-300 w-full sm:w-auto">
            <a href="/">
              <ExternalLink className="mr-2 h-4 w-4" /> Open in teho.ai
            </a>
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
