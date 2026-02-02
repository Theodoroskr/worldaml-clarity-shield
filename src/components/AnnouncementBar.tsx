import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-[60] bg-navy text-white py-2 px-4 relative">
      <div className="container-enterprise flex items-center justify-center gap-2 text-body-sm">
        <span className="hidden sm:inline">Ready to streamline your compliance screening?</span>
        <Link 
          to="/contact-sales" 
          className="font-semibold text-teal-light hover:text-white transition-colors inline-flex items-center gap-1"
        >
          Request a Demo
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;