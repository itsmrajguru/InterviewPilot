import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Sidebar({ role = "student" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (role === "student") {
      navigate("/login");
    } else {
      navigate("/company-login");
    }
  };

  const studentLinks = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
      )
    },
    {
      name: "My Interviews",
      path: "/student/interviews",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      )
    },
    {
      name: "Practice",
      path: "/student/practice",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
      )
    }
  ];

  const companyLinks = [
    {
      name: "Dashboard",
      path: "/company/dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
      )
    },
    {
      name: "All Candidates",
      path: "/company/interviews",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      )
    },
    {
      name: "Compare",
      path: "/company/compare",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
      )
    }
  ];

  const links = role === "student" ? studentLinks : companyLinks;

  return (
    <aside className={`ip-sidebar transition-all duration-300 ease-in-out !w-full md:!w-[224px] ${
      isOpen ? "!min-h-screen overflow-y-auto" : "!h-[84px] !min-h-[84px] md:!h-auto md:!min-h-screen overflow-hidden"
    }`}>
      {/* logo area at top of sidebar */}
      <div className="flex items-center justify-between px-3 mb-0 md:mb-8 mt-0 md:mt-2 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <img src="/logo.svg" alt="InterviewPilot" className="w-11 h-11 rounded-xl shadow-lg" />
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-[16px] tracking-tight">InterviewPilot</span>
            <span className="text-white/40 font-bold text-[10px] uppercase tracking-[0.16em] mt-1.5">
              AI Interviews
            </span>
          </div>
        </div>
        
        {/* Hamburger Menu Button (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white/70 hover:text-white p-2"
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      <div className={`flex-col flex-1 ${isOpen ? "flex mt-4" : "hidden md:flex"}`}>

      <span className="ip-sidebar-section !text-[12px] !tracking-[0.14em]">
        {role === "student" ? "Student" : "Recruiter"}
      </span>

      {/* sidebar navigation links */}
      {links.map((link) => {
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`ip-sidebar-item !text-[15px] !font-semibold !px-4 !py-3 [&_svg]:!w-[18px] [&_svg]:!h-[18px] ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            {link.icon}
            {link.name}
          </Link>
        );
      })}

      {/* spacer pushes logout to bottom */}
      <div className="flex-1" />

      <span className="ip-sidebar-section !text-[12px] !tracking-[0.14em]">Account</span>

      {/* logout button */}
      <button
        onClick={handleLogout}
        className="ip-sidebar-item w-full text-left !text-[15px] !font-semibold !px-4 !py-3 [&_svg]:!w-[18px] [&_svg]:!h-[18px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        Logout
      </button>
      </div>
    </aside>
  );
}
