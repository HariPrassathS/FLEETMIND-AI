'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Save,
  FileText,
  Camera,
} from 'lucide-react';
import { fleetMindStore } from '../../../lib/db/store';
import { UserAvatar } from '../../../components/brand/user-avatar';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh',
];

const SOUTH_INDIA_CITIES: Record<string, string[]> = {
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirupur', 'Karur', 'Erode', 'Vellore', 'Dindigul', 'Hosur', 'Namakkal', 'Kancheepuram', 'Cuddalore', 'Thanjavur'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum', 'Tumkur', 'Hosur', 'Davangere', 'Shivamogga', 'Udupi', 'Hassan', 'Bidar'],
  'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajamahendravaram', 'Tirupati'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Thane'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Okhla', 'Connaught Place'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Ghaziabad'],
  'West Bengal': ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Howrah'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Ambala', 'Panipat', 'Rohtak', 'Hisar'],
};

export default function CustomerProfilePage() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState('ABC Electronics India Pvt Ltd');
  const [contactName, setContactName] = useState(user?.full_name || 'Rajesh Kumar');
  const [email] = useState(user?.email || 'customer@fleetmind.ai');
  const [phone, setPhone] = useState('+91 98410 44556');
  const [gstin, setGstin] = useState('29ABCDE1234F1Z5');
  const [facilityType, setFacilityType] = useState('Central Warehouse / Fulfillment Center');
  const [defaultCity, setDefaultCity] = useState('Bengaluru');
  const [streetAddress, setStreetAddress] = useState('#42, 4th Cross, Peenya Industrial Area Phase II');
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru Urban');
  const [pincode, setPincode] = useState('560058');
  const [saved, setSaved] = useState(false);

  const citiesForState = SOUTH_INDIA_CITIES[selectedState] || ['Other'];

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const cities = SOUTH_INDIA_CITIES[state] || [];
    if (cities.length > 0) {
      setDefaultCity(cities[0]);
      setSelectedDistrict(cities[0]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      fleetMindStore.updateCustomerProfile(user.id, {
        contact_name: contactName,
        company_name: companyName,
        phone,
        default_city: defaultCity,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const avatarLetter = (user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'C').toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-heading">Shipper Account Profile</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Commercial entity credentials, facility dispatch addresses, and logistics preferences
        </p>
      </div>

      {/* Profile Avatar Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          <UserAvatar
            src={user?.avatar_url}
            name={user?.full_name || contactName}
            email={user?.email || email}
            size="xl"
          />
          <button
            type="button"
            className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-md transition"
            title="Update profile photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-black text-slate-900">{user?.full_name || contactName}</h2>
          <p className="text-xs text-slate-500 font-medium">{user?.email || email}</p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase">Customer / Shipper</span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified Account
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">{companyName} · {defaultCity}, {selectedState}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
        {saved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Shipper profile details and default dispatch address saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: BUSINESS IDENTITY */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Commercial Entity & Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Entity Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authorized Contact Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email (Account ID)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">GSTIN Number</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facility Classification</label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  <option>Central Warehouse / Fulfillment Center</option>
                  <option>Manufacturing &amp; Assembly Plant</option>
                  <option>CFS / Container Freight Station</option>
                  <option>Wholesale Distribution Depot</option>
                  <option>Retail / FMCG Distribution Hub</option>
                  <option>Cold Storage / Reefer Facility</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Primary Operating Hub &amp; Registered Address</span>
            </h3>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registered Facility / Street Address *
              </label>
              <textarea
                rows={2}
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Street name, building number, industrial phase..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City / District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / District *</label>
                <select
                  value={defaultCity}
                  onChange={(e) => { setDefaultCity(e.target.value); setSelectedDistrict(e.target.value); }}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  {citiesForState.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Other">Other (Type below)</option>
                </select>
                {defaultCity === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="mt-2 w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                )}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  placeholder="560058"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              💡 Your city will be automatically pre-filled as the dispatch origin when booking new loads.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Changes sync immediately to your consignment booking forms
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
