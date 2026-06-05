//Har Har Mahadev

import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen ip-bg-page flex flex-col items-center justify-center p-6 animate-fade-up">

        
        {/* main container of the 404 page...
        designed this block to match the clean and modern card aesthetics 
        of the careersync platform */}
        <div className="ip-card max-w-lg w-full text-center p-12 relative overflow-hidden">
          
          {/* background glow effect to maintain the premium feel */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-neutral-400/5 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            {/* icon representing the error state...
            used the searchX icon from lucide react icons set */}
            <div className="w-20 h-20 ip-bg-subtle ip-border rounded-2xl flex items-center justify-center text-4xl mb-4">
              🔍
            </div>

            <span className="ip-badge ip-badge-danger">Error 404</span>
            <h1 className="text-[36px] font-display font-black ip-text-primary tracking-[-2px] leading-tight">
              Lost in <span className="ip-text-accent">Space?</span>
            </h1>
            
            <p className="ip-text-secondary text-[14px] max-w-[300px] leading-relaxed lowercase">
              the page you are looking for does not exist or has been moved to a different coordinate.
            </p>

            {/* navigation buttons for the user...
            added two options for better user experience to go back or home */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
              <button 
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                ← Go Back
              </button>
              
              <button 
                onClick={() => navigate("/login")}
                className="btn-primary"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>

        {/* small strategic footer as seen in other pages... */}
        <div className="mt-12">
          <p className="text-[11px] ip-text-muted font-bold uppercase tracking-widest italic opacity-50">
            "InterviewPilot — The interview infrastructure."
          </p>
        </div>
      </div>
  );
}
