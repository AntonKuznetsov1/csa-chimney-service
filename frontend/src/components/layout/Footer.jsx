import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h4 className="text-xl font-bold uppercase tracking-tight mb-3">
              CSA <span className="text-brand-orange">Chimney Service</span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              WETT Certified chimney inspection, cleaning, and maintenance serving Miramichi and North-Eastern New Brunswick.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-3">Contact Details</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-orange" />
                <a href="tel:5062512092" className="hover:text-brand-orange transition-colors">(506) 251-2092</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-orange" />
                <a href="mailto:csachimney@gmail.com" className="hover:text-brand-orange transition-colors">csachimney@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>Miramichi & Surrounding Areas (E1V 6R9)</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-3">Primary Service Towns</h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              Miramichi · Loggieville · Richibucto · Rogersville · Allardville · Sunny Corner · Bathurst · Blackville · Doaktown · Rexton · Tracadie · Millerton · Neguac · Renous
            </p>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} CSA Chimney Service. All rights reserved.
        </div>
      </div>
    </footer>
  );
}