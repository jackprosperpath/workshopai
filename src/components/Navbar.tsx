
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
      <div className="text-2xl font-bold tracking-tight">WorkshopAI</div>
      <nav className="hidden md:block">
        <ul className="flex gap-8 font-medium items-center">
          <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
          <li><a href="#integrations" className="hover:text-primary transition-colors">Integrations</a></li>
          <li><a href="#workshop" className="hover:text-primary transition-colors">Workshop</a></li>
          <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
          <li><a href="#community" className="hover:text-primary transition-colors">Community</a></li>
          {user ? (
            <li>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </li>
          ) : (
            <li>
              <Link to="/auth">
                <Button variant="outline" className="font-medium">Sign Up</Button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};
