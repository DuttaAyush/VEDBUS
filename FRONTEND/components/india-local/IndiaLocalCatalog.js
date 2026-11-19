'use client';

import React, { useState, useEffect } from 'react';
import PackageDetailModal from '@/components/site/PackageDetailModal';

const domesticPackagesData = [
  {
    id: 'statue-of-unity',
    category: 'heritage modern',
    image: '/images/statue_of_unity.jpg',
    duration: '5 Days / 4 Nights',
    subtitle: 'AC Tourist Coach ex-Nagpur',
    title: 'Statue of Unity & Sardar Sarovar',
    desc: 'World’s tallest statue with 153m viewing gallery elevator pass, Sardar Sarovar Dam, Valley of Flowers, and evening high-tech laser show.',
    tag1: 'Viewing Gallery Pass',
    tag2: 'Grand Laser Show',
    price: '₹51,999'
  },
  {
    id: 'jaipur-heritage',
    category: 'heritage',
    image: '/images/jaipur_hawa_mahal.jpg',
    duration: '5 Days / 4 Nights',
    subtitle: 'AC Highway Coach ex-Nagpur',
    title: 'Jaipur – Royal Pink City Heritage',
    desc: 'Amer Fort, royal City Palace, Hawa Mahal, Jantar Mantar, and an authentic cultural village evening with royal dining at Chokhi Dhani.',
    tag1: '4★ Heritage Hotel',
    tag2: 'Chokhi Dhani Feast',
    price: '₹52,499'
  },
  {
    id: 'kashmir-paradise',
    category: 'hills nature',
    image: '/images/kashmir_dal_lake.jpg',
    duration: '9 Days / 8 Nights',
    subtitle: 'AC Sleeper + Valley SUV',
    title: 'Srinagar & Kashmir Valley Paradise',
    desc: 'Heritage Dal Lake houseboat, sunset Shikara cruise, Gulmarg Gondola snow point ride, and Pahalgam Lidder River valley pine trails.',
    tag1: 'Dal Lake Houseboat',
    tag2: 'Gulmarg Gondola',
    price: '₹54,999'
  },
  {
    id: 'munnar-kerala',
    category: 'hills nature',
    image: '/images/munnar_tea_gardens.jpg',
    duration: '8 Days / 7 Nights',
    subtitle: 'AC Tourist Coach ex-Nagpur',
    title: 'Munnar & Kerala Green Trails',
    desc: 'Tea estate resort stay in Munnar, Eravikulam National Park (Nilgiri Tahr), spice plantation tour, and traditional Kathakali show.',
    tag1: 'Tea Estate Resort',
    tag2: 'Spice Garden Tour',
    price: '₹58,500'
  },
  {
    id: 'kaziranga-wildlife',
    category: 'wildlife nature',
    image: '/images/kaziranga_rhino.jpg',
    duration: '10 Days / 9 Nights',
    subtitle: 'Overland Highway Coach',
    title: 'Kaziranga National Park Wildlife Safari',
    desc: 'Assam wilderness adventure: Open 4x4 jeep safari in Bagori / Kohora zones to spot the endangered one-horned rhinoceros and wild elephants.',
    tag1: 'Rhino Jeep Safari',
    tag2: 'Jungle Eco Resort',
    price: '₹52,499'
  },
  {
    id: 'ladakh-adventure',
    category: 'hills adventure',
    image: '/images/ladakh_pangong.jpg',
    duration: '12 Days / 11 Nights',
    subtitle: 'Expedition Coach + High-Altitude 4x4',
    title: 'Leh – Ladakh Himalayan Expedition',
    desc: 'High-altitude adventure across Khardung La pass, Nubra Valley Hunder sand dunes, and double-humped camel rides with Pangong Tso lake stay.',
    tag1: 'Pangong Lake Stay',
    tag2: 'Khardung La Pass',
    price: '₹74,999'
  }
];

export default function IndiaLocalCatalog() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalPkg, setModalPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const packages = domesticPackagesData;

  const filteredPackages = activeFilter === 'all'
    ? packages
    : packages.filter((pkg) => String(pkg.category || '').toLowerCase().includes(activeFilter) || String(pkg.title || '').toLowerCase().includes(activeFilter));

  const handleOpenModal = (pkg) => {
    setModalPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200/60" data-purpose="curated-packages-grid" id="curated-packages">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Section Title & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-teal-700 text-xs font-extrabold uppercase tracking-widest">All-Inclusive Domestic Bundles</span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 mt-1">Featured Domestic Tour Packages</h2>
            <p className="text-slate-500 text-xs mt-1">Includes Intercity Transit • 4★/5★ Stays • Regional Pure Veg / Jain Dining • Private Sightseeing</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Escapes
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                activeFilter === 'heritage'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              onClick={() => setActiveFilter('heritage')}
            >
              Heritage &amp; Monuments
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                activeFilter === 'hills'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              onClick={() => setActiveFilter('hills')}
            >
              Hill Stations &amp; Valleys
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                activeFilter === 'wildlife'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              onClick={() => setActiveFilter('wildlife')}
            >
              Wildlife &amp; Nature
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleOpenModal(pkg)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/90 transition flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={pkg.image} />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {pkg.duration}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-teal-900/90 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    {pkg.subtitle}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-base font-bold text-slate-900 group-hover:text-teal-700 transition">{pkg.title}</h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">{pkg.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded">{pkg.tag1}</span>
                    <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded">{pkg.tag2}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">All-Inclusive</span>
                  <span className="text-lg font-black text-slate-900">{pkg.price}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(pkg);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  View Itinerary
                </button>
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
