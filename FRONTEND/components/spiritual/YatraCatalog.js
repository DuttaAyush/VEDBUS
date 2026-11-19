'use client';

import { useState, useEffect } from 'react';
import PackageDetailModal from '@/components/site/PackageDetailModal';

const yatraPackages = [
  {
    id: 'ayodhya-yatra',
    category: 'ayodhya north',
    title: 'Ayodhya – Shri Ram Janmabhoomi Yatra',
    duration: '4 Days / 3 Nights',
    destinations: 'Ram Lalla Mandir • Hanuman Garhi • Saryu River',
    image: '/images/ayodhya_ram_mandir.jpg',
    badge: 'VIP Ram Lalla & Saryu Aarti Pass',
    description: 'Direct pilgrimage from Nagpur to Ayodhya Dham. Experience guided darshan of Ram Lalla, Hanuman Garhi, Kanak Bhawan, and the divine evening Saryu Maha Aarti at Ram Ki Paidi.',
    tags: ['3★ AC Hotel', 'Saryu River Aarti', 'Ram Lalla Darshan'],
    price: '₹54,999'
  },
  {
    id: 'varanasi-kashi',
    category: 'jyotirlinga north',
    title: 'Varanasi – Kashi Vishwanath Darshan',
    duration: '4 Days / 3 Nights',
    destinations: 'Kashi Vishwanath • Dashashwamedh Ghat • Annapurna Mandir',
    image: '/images/varanasi_kashi_aarti.jpg',
    badge: 'Sugam Darshan & Boat Aarti Pass',
    description: 'Complete sacred pilgrimage from Nagpur to Kashi. Includes AC Sleeper coach transit, verified stays near Vishwanath Corridor, morning Subah-e-Banaras boat ride, and reserved evening Ganga Aarti.',
    tags: ['Ganga Boat Included', 'Sugam Darshan', 'Satvik Banarasi Food'],
    price: '₹54,999'
  },
  {
    id: 'tirupati-yatra',
    category: 'south',
    title: 'Tirupati Balaji Darshan Yatra',
    duration: '6 Days / 5 Nights',
    destinations: 'Tirumala Balaji • Padmavathi Temple • Kapil Teertham',
    image: '/images/tirupati_balaji.jpg',
    badge: 'Special Entry ₹300 Darshan Included',
    description: 'Comfortable multi-axle AC coach yatra ex-Nagpur. Features pre-booked ₹300 Seeghra Darshan pass, guaranteed 2 original Srivari Laddus per passenger, and dedicated uphill transit to Tirumala Hills.',
    tags: ['₹300 Seeghra Pass', '2 Srivari Laddus', 'Uphill AC Transit'],
    price: '₹56,999'
  },
  {
    id: 'somnath-yatra',
    category: 'jyotirlinga',
    title: 'Somnath & Dwarka Coastal Circuit',
    duration: '7 Days / 6 Nights',
    destinations: 'Somnath Jyotirlinga • Dwarkadhish • Bet Dwarka • Porbandar',
    image: '/images/somnath_dwarka.jpg',
    badge: 'Sound & Light Show + Ferry Included',
    description: 'Arabian seaside pilgrimage from Nagpur to Saurashtra. Attend Somnath Temple evening laser show, Bet Dwarka island ferry cruise, Nageshwar Jyotirlinga Abhishek, and Porbandar Kirti Mandir.',
    tags: ['Seafront Stay', 'Gujarati Satvik Thali', 'Bet Dwarka Ferry'],
    price: '₹52,499'
  },
  {
    id: 'vaishnodevi-yatra',
    category: 'himalayas north',
    title: 'Maa Vaishno Devi Katra Yatra',
    duration: '8 Days / 7 Nights',
    destinations: 'Maa Vaishno Devi Bhawan • Katra • Ardhkuwari • Bhairon Ghati',
    image: '/images/vaishno_devi.jpg',
    badge: 'Yatra RFID Pass & Trek Assist',
    description: 'Holy Himalayan journey from Nagpur to Katra base camp. Features AC Sleeper coach travel with dual drivers, hotel stay in Katra, RFID tracking pass assistance, and battery car / pony coordination.',
    tags: ['Katra 3★ Stay', 'RFID Registration', 'Pony / Helicopter Assist'],
    price: '₹64,999'
  },
  {
    id: 'haridwar-rishikesh-yatra',
    category: 'himalayas north',
    title: 'Haridwar – Rishikesh Ganga Darshan Yatra',
    duration: '6 Days / 5 Nights',
    destinations: 'Har Ki Pauri • Mansa Devi • Ram Jhula • Parmarth Niketan',
    image: '/images/haridwar_rishikesh.jpg',
    badge: 'Reserved Ganga Aarti & Cable Car',
    description: 'Rejuvenating spiritual tour connecting Nagpur to Haridwar and Rishikesh. Features riverside stays, reserved Har Ki Pauri Ganga Aarti access, Mansa Devi ropeway tickets, and Parmarth Niketan evening Aarti.',
    tags: ['Riverside Hotel', 'Ropeway Cable Car', 'Pure Satvik Dining'],
    price: '₹74,999'
  }
];

export default function YatraCatalog() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalPkg, setModalPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const packages = yatraPackages;

  const filteredPackages = packages.filter(pkg => {
    if (activeFilter === 'all') return true;
    return String(pkg.category || '').toLowerCase().includes(activeFilter) || String(pkg.title || '').toLowerCase().includes(activeFilter);
  });

  const handleOpenModal = (pkg) => {
    setModalPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <section className="w-full py-16 bg-white border-y border-amber-200/60" id="spiritualPackages">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
            <span className="material-symbols-outlined text-[16px] text-brand-scarlet">temple_hindu</span>
            DEVSTHAN & TEERTH YATRA CATALOG
          </div>
          <h2 className="text-3xl md:text-4xl text-slate-900 tracking-tight font-spiritual font-normal not-italic">Curated Spiritual Darshan Circuits</h2>
          <p className="text-sm text-slate-600 mt-2">Multi-day hassle-free devotional yatras with AC coach transfers, verified stays within 500m of temple sanctums, pre-booked VIP lines, and Satvik cuisine.</p>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { label: 'All Sacred Circuits', key: 'all' },
              { label: '12 Jyotirlingas', key: 'jyotirlinga' },
              { label: 'Ayodhya & North Devsthan', key: 'ayodhya' },
              { label: 'Himalayas & Sacred Rivers', key: 'himalayas' },
              { label: 'South Divya Desam', key: 'south' },
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => setActiveFilter(btn.key)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeFilter === btn.key
                    ? 'bg-brand-scarlet text-white shadow-sm'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yatra Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => handleOpenModal(pkg)}
              className="bg-[#FFFDF9] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-amber-200 transition-all flex flex-col group cursor-pointer"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={pkg.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-scarlet text-white font-bold text-xs shadow-sm">
                  {pkg.duration}
                </span>
                <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] font-semibold truncate">
                  {pkg.destinations}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-brand-scarlet mb-2">
                    <span className="material-symbols-outlined text-[16px]">stars</span> {pkg.badge}
                  </div>
                  <h3 className="text-lg text-slate-900 mb-2 font-semibold">{pkg.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{pkg.description}</p>
                  <div className="flex flex-wrap gap-1.5 text-[11px] mb-4">
                    {(Array.isArray(pkg.tags) ? pkg.tags : (Array.isArray(pkg.highlights) ? pkg.highlights : [])).map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Starts at</span>
                    <span className="text-2xl font-extrabold text-slate-900">{pkg.price}</span>
                    <span className="text-[10px] text-slate-500">/person</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(pkg);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-scarlet hover:bg-brand-hover text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    View &amp; Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PackageDetailModal
        pkg={modalPkg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
