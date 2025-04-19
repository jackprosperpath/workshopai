
import { Button } from "./ui/button";

export const Navbar = () => {
  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
      <div className="text-2xl font-bold tracking-tight">Converge.ai</div>
      <nav className="hidden md:block">
        <ul className="flex gap-8 font-medium">
          <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
          <li><a href="#integrations" className="hover:text-primary transition-colors">Integrations</a></li>
          <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
          <li><a href="#community" className="hover:text-primary transition-colors">Community</a></li>
          <li><Button variant="outline" className="font-medium">Sign Up</Button></li>
        </ul>
      </nav>
    </header>
  );
};
