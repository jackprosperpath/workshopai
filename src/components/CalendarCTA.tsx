
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function CalendarCTA() {
  return (
    <section className="py-16 bg-blue-50 dark:bg-blue-950">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Get AI-Powered Meeting Blueprints
        </h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
          Simply add <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">agenda@teho.ai</span> to your calendar invite and receive an AI-generated meeting blueprint within minutes.
        </p>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-3">How It Works:</h3>
          <ol className="text-left space-y-4 mb-6">
            <li className="flex gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center text-blue-700 dark:text-blue-300 flex-shrink-0">1</span>
              <span>Add <span className="font-mono font-semibold">agenda@teho.ai</span> as an attendee to your next meeting</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center text-blue-700 dark:text-blue-300 flex-shrink-0">2</span>
              <span>Our AI analyzes your meeting description and creates a blueprint with clear agenda, timeline, and objectives</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center text-blue-700 dark:text-blue-300 flex-shrink-0">3</span>
              <span>Receive your blueprint via email that you can share with all participants</span>
            </li>
          </ol>
          
          <Button className="w-full sm:w-auto px-8" size="lg">
            <Mail className="mr-2 h-4 w-4" />
            Try it in your next meeting
          </Button>
        </div>
      </div>
    </section>
  );
}
