import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  Search, 
  Sparkles, 
  FileCheck 
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import DottedBackground from '../../components/ui/DottedBackground';
import Button from '../../components/ui/Button';
import CertTicker from '../../components/ui/CertTicker';

const serviceAreas = [
  "Miramichi", "Bathurst", "Tracadie", "Doaktown", "Rogersville", 
  "Neguac", "Loggieville", "Richibucto", "Blackville", "Rexton", 
  "Sunny Corner", "Renous", "Allardville", "Millerton"
];

const detailedServices = [
  {
    icon: ShieldCheck,
    title: "WETT Certified Inspections",
    desc: "Official WETT-certified evaluations required for insurance compliance, home buying, selling, or code validation."
  },
  {
    icon: Search,
    title: "Chimney & Wood Stove Inspections",
    desc: "Thorough structural and safety evaluations of your complete chimney system, fireplaces, and wood-burning stoves."
  },
  {
    icon: Sparkles,
    title: "Professional Chimney Cleaning",
    desc: "Complete removal of soot, ash, and creosote build-up to maintain optimal draft and maximize heating efficiency."
  },
  {
    icon: Flame,
    title: "Flue & Stove Pipe Checks",
    desc: "Detailed inspection of connecting pipes, clearances, dampers, and flue liners to ensure safe operation."
  },
  {
    icon: FileCheck,
    title: "Creosote & Safety Assessment",
    desc: "Identification of dangerous creosote glaze accumulation, blockage hazards, and fire prevention risks."
  },
  {
    icon: CheckCircle2,
    title: "Reliable & Professional Service",
    desc: "Dependable scheduling, clean workspace protection, and expert advice for long-term hearth safety."
  }
];

export default function LandingPage() {
  return (
    <DottedBackground>
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-center text-center">
        <div className="inline-block mb-4 px-4 py-1 bg-brand-orange/10 text-brand-orange font-semibold rounded-full text-sm uppercase tracking-wide">
          WETT Certified & Insured Specialists
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-brand-black tracking-tight mb-6">
          Expert Chimney <br className="hidden md:block" />
          <span className="text-brand-orange">Service & Sweeping</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
          WETT inspections, wood stove checks, creosote removal, and professional chimney sweeping across Miramichi and North-Eastern New Brunswick.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
          {/* Add w-full to the Link wrapper and flex settings to the Button */}
          <Link to="/book" className="w-full sm:w-auto flex">
            <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center">
              Book Your Service <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center"
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Get a Free Quote
          </Button>
        </div>
      </section>

      <CertTicker />

      {/* Services Section */}
      <section id="services" className="py-24 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-orange font-bold text-sm tracking-widest uppercase">Our Expertise</span>
            <h2 className="text-4xl font-bold text-brand-black mt-2">Comprehensive Hearth & Chimney Services</h2>
            <div className="h-1.5 w-24 bg-brand-orange mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Detailed Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {detailedServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden group flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-orange transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <div>
                    <div className="w-14 h-14 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-orange transition-colors duration-300">
                      <Icon className="w-7 h-7 text-brand-orange group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-black mb-3">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {service.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      </section>

      {/* Contact & Service Areas Section */}
      <section id="contact" className="py-24 bg-brand-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            
            {/* Contact Info Sidebar */}
            <div className="bg-gray-50 p-8 sm:p-12 lg:w-5/12 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-brand-black mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-8">Reach out directly for service inquiries, quotes, or scheduling support.</p>
                
                <div className="space-y-6">
                  <a href="tel:5062512092" className="flex items-start group">
                    <Phone className="w-6 h-6 text-brand-orange mt-1 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-brand-black">Phone</p>
                      <p className="text-gray-600 hover:text-brand-orange transition-colors">(506) 251-2092</p>
                    </div>
                  </a>

                  <a href="mailto:csachimney@gmail.com" className="flex items-start group">
                    <Mail className="w-6 h-6 text-brand-orange mt-1 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-brand-black">Email</p>
                      <p className="text-gray-600 hover:text-brand-orange transition-colors">csachimney@gmail.com</p>
                    </div>
                  </a>

                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-brand-orange mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-brand-black">Base Location</p>
                      <p className="text-gray-600">Miramichi, NB (Postal Code: E1V 6R9)</p>
                    </div>
                  </div>
                </div>

                {/* Service Regions Grid */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <p className="font-bold text-brand-black mb-3 text-sm uppercase tracking-wider">Service Coverage Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {serviceAreas.map((area, idx) => (
                      <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        {area}, NB
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 sm:p-12 lg:w-7/12">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-brand-black mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-colors" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-black mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-black mb-2">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-colors" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-black mb-2">Service Required</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-colors">
                    <option>WETT Certified Inspection</option>
                    <option>Chimney Cleaning / Sweeping</option>
                    <option>Wood Stove Inspection</option>
                    <option>Flue & Stove Pipe Check</option>
                    <option>Creosote & Safety Assessment</option>
                    <option>General Inquiry / Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-black mb-2">Message</label>
                  <textarea rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-colors resize-none" placeholder="Describe your hearth setup or specific request..."></textarea>
                </div>
                <Button variant="primary" className="w-full py-4 text-lg" type="button">
                  Send Message
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </DottedBackground>
  );
}