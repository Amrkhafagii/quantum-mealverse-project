
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Info, MessageSquare, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-quantum-black border-t border-quantum-cyan/20 pt-12 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-quantum-cyan mb-4">HEALTH<span className="text-quantum-purple">ANDFIX</span></h3>
            <p className="text-gray-400 mb-4">
              The future of wellness, personalized for you. Our health solutions 
              adapt to your needs for optimal health and performance.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Twitter className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Instagram className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-quantum-cyan mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/customer">Order Food</FooterLink>
              <FooterLink href="/fitness">Fitness</FooterLink>
              <FooterLink href="/workouts">Workouts</FooterLink>
              <FooterLink href="/orders">Track Orders</FooterLink>
              <FooterLink href="/cart">Cart</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-quantum-cyan mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-quantum-purple mr-3 mt-0.5" />
                <span className="text-gray-400">123 Health Street, Wellness City, WC 75001</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-quantum-purple mr-3" />
                <span className="text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-quantum-purple mr-3" />
                <span className="text-gray-400">contact@healthandfix.com</span>
              </li>
              <li className="mt-4">
                <Link to="/contact" className="flex items-center text-gray-400 hover:text-quantum-cyan">
                  <MessageSquare className="w-5 h-5 text-quantum-purple mr-3" />
                  <span>Contact Page</span>
                </Link>
              </li>
              <li className="mt-2">
                <Link to="/about" className="flex items-center text-gray-400 hover:text-quantum-cyan">
                  <Info className="w-5 h-5 text-quantum-purple mr-3" />
                  <span>About Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-quantum-cyan mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest health innovations and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-quantum-darkBlue border border-quantum-cyan/30 text-gray-300 py-2 px-4 rounded-l-md focus:outline-none focus:ring-1 focus:ring-quantum-cyan w-full"
              />
              <button className="bg-quantum-purple hover:bg-quantum-darkPurple transition-colors duration-300 text-white py-2 px-4 rounded-r-md">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-quantum-cyan/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} HealthAndFix. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-quantum-cyan text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-quantum-cyan text-sm">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-quantum-cyan text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  icon: React.ReactNode;
  href: string;
}

const SocialIcon = ({ icon, href }: SocialIconProps) => {
  return (
    <a
      href={href}
      className="bg-quantum-darkBlue hover:bg-quantum-purple transition-colors duration-300 text-quantum-cyan hover:text-white h-9 w-9 rounded-full flex items-center justify-center"
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink = ({ href, children }: FooterLinkProps) => {
  return (
    <li>
      <Link
        to={href}
        className="text-gray-400 hover:text-quantum-cyan transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  );
};

export default Footer;
