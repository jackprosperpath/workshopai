
import React from 'react';
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, LogOut, User as UserIcon, Loader2 } from "lucide-react";

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('last-workshop-id');
      }
    });
    
    const checkSession = async () => {
      try {
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    return () => subscription.unsubscribe();
  }, []);
  
  const handleSignOut = async () => {
    try {
      setLoading(true);
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("Successfully signed out");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold tracking-tight">teho.ai</div>
          </Link>
          
          {user && !loading && <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/workshop" className={navigationMenuTriggerStyle()}>
                    My Blueprints
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="#pricing" className={navigationMenuTriggerStyle()}>
                    Pricing
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>}
        </div>

        <nav className="flex items-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-5 w-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-md border shadow-lg rounded-md" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800" onClick={() => navigate("/workshop")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Blueprints</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <div className="hidden md:flex">
              <ul className="flex gap-8 font-medium items-center">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#community" className="hover:text-primary transition-colors">Community</a></li>
                <li>
                  <Link to="/auth">
                    <Button variant="outline" className="font-medium">Sign In</Button>
                  </Link>
                </li>
              </ul>
            </div>}
        </nav>
      </div>
    </header>;
};
