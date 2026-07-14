// Server Component — no hooks, plain Links → next/link

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { SOCIAL } from "@/lib/seo/site";

// SVG Icons
const MapPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--gold)] shrink-0 mt-0.5">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Mail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--gold)] shrink-0">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Phone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--gold)] shrink-0">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Instagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0d213b]">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WavyLine = () => (
  <svg width="40" height="6" viewBox="0 0 40 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1 mb-5">
    <path d="M0 3C2.5 3 2.5 1 5 1C7.5 1 7.5 3 10 3C12.5 3 12.5 5 15 5C17.5 5 17.5 3 20 3C22.5 3 22.5 1 25 1C27.5 1 27.5 3 30 3C32.5 3 32.5 5 35 5C37.5 5 37.5 3 40 3" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function SiteFooter() {
  const addressString = "Kila Kothi, Satna, Madhya\nPradesh, 485666.";
  const emailString = "team@kilatheheritagepalace.com";
  const phoneString = "+91 9898203503";

  return (
    <footer className="relative bg-[#0d213b] text-white overflow-hidden border-t-[6px] border-[var(--gold)]" style={{
      backgroundImage: "linear-gradient(rgba(13, 33, 59, 0.85), rgba(13, 33, 59, 0.85)), url('/Hero screen/image4.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-10 pb-24 md:pb-6 relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 mb-8">

          {/* Column 1: Logo & Socials */}
          <div className="flex flex-col items-start">
            <img src="/logo (1).svg" alt="Kila" className="h-16 w-auto mb-3" />
            <h2 className="text-2xl font-serif font-bold text-white mb-1">Kila</h2>
            <p className="text-[13px] text-gray-300 font-light tracking-wide mb-5">The Heritage Palace</p>
            <div className="flex gap-4">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Instagram />
              </a>
            </div>
          </div>

          {/* Column 2: Contact */}
          <div className="lg:pl-8">
            <h3 className="text-[16px] font-medium text-white tracking-wide">Contact</h3>
            <WavyLine />
            <div className="flex flex-col gap-4 text-[14px] text-gray-300">
              <div className="flex gap-3 items-start">
                <MapPin />
                <span className="leading-snug whitespace-pre-line">{addressString}</span>
              </div>
              <div className="flex gap-3 items-center">
                <Mail />
                <span>{emailString}</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone />
                <span>{phoneString}</span>
              </div>
            </div>
          </div>

          {/* Column 3 & 4: Links (Grouped for mobile) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-10 lg:gap-6">
            {/* Column 3: Quick Link */}
            <div className="lg:pl-8">
              <h3 className="text-[16px] font-medium text-white tracking-wide">Quick Link</h3>
              <WavyLine />
              <div className="flex flex-col gap-3 text-[14px] text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/about" className="hover:text-white transition-colors">
                  Heritage
                </Link>
                <Link href="/reserve" className="hover:text-white transition-colors">
                  Booking
                </Link>
                <Link href="/reserve?tab=wedding" className="hover:text-white transition-colors">
                  Enquire Now
                </Link>
              </div>
            </div>

            {/* Column 4: More */}
            <div className="lg:pl-8">
              <h3 className="text-[16px] font-medium text-white tracking-wide">More</h3>
              <WavyLine />
              <div className="flex flex-col gap-3 text-[14px] text-gray-300">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Services
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/30 pt-4 text-center">
          <p className="text-[12px] text-gray-300 font-light">© 2023 Kila The Heritage Palace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
