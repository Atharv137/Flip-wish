import React from "react";
import { Mail, Phone, MapPin, Globe, CreditCard, ShieldCheck, HelpCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172337] text-slate-300 text-xs font-light pt-10 pb-6 border-t border-[#2d3a4f]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        
        {/* Column 1 - About */}
        <div>
          <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-3">About</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">FlipWish Stories</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Press Releases</a></li>
          </ul>
        </div>

        {/* Column 2 - Help */}
        <div>
          <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-3">Help</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Payments</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Shipping</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Report Infringement</a></li>
          </ul>
        </div>

        {/* Column 3 - Consumer Policy */}
        <div>
          <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-3">Consumer Policy</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Return Policy</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Terms Of Use</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Security</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition-colors">Sitemap</a></li>
          </ul>
        </div>

        {/* Column 4 - Contact Info */}
        <div>
          <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-3">Office Location</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#FFE500] shrink-0" />
              <p className="leading-tight text-slate-400">
                FlipWish Internet Private Ltd,<br />
                Buildings Alyssa, Begonia & Clove Tech Village,<br />
                Outer Ring Road, Bengaluru, 560103, Karnataka, India
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#FFE500]" />
              <span>1800-208-9898</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FFE500]" />
              <span>support@flipwish.com</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 border-t border-[#24354f] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left indicators */}
        <div className="flex flex-wrap gap-6 items-center text-[#a4b5cf]">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
            <ShieldCheck className="w-4.5 h-4.5 text-[#FFE500]" />
            <span>100% Genuine Products</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
            <CreditCard className="w-4.5 h-4.5 text-[#FFE500]" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
            <HelpCircle className="w-4.5 h-4.5 text-[#FFE500]" />
            <span>24x7 Help Center</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-slate-500 font-normal">
          &copy; 2026 FlipWish.com. Inspired by Flipkart. All rights reserved.
        </div>

      </div>
    </footer>
  );
};
