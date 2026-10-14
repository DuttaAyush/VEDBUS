"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/layout/AdminShell";
import { adminFetch } from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const BUS_TYPES = [
  {
    id: "bharatbenz-sleeper",
    name: "BharatBenz AC Sleeper (2+1)",
    shortDesc: "Premium comfort with 36 spacious sleepers and modern amenities",
    fullDesc: "Premium comfort with 36 spacious sleepers and modern amenities for a superior travel experience.",
    style: "sleeper",
    defaultSeats: 36,
  },
  {
    id: "volvo-multiaxle",
    name: "Volvo Multi-Axle AC Sleeper",
    shortDesc: "Luxury travel with enhanced stability and superior comfort",
    fullDesc: "Luxury travel with enhanced stability and superior comfort across all long-distance routes.",
    style: "sleeper",
    defaultSeats: 40,
  },
  {
    id: "seater-recliner",
    name: "Volvo 9600 Seater (Recliner)",
    shortDesc: "Comfortable recliner pushback seats for day intercity journeys",
    fullDesc: "Comfortable recliner pushback seats with ample legroom for a pleasant and affordable journey.",
    style: "seater",
    defaultSeats: 44,
  },
];

const AMENITIES = [
  { id: "wifi",     label: "Wi-Fi",             icon: "wifi" },
  { id: "charging", label: "Charging Port",     icon: "bolt" },
  { id: "blanket",  label: "Blanket",           icon: "king_bed" },
  { id: "water",    label: "Water Bottle",      icon: "water_drop" },
  { id: "snacks",   label: "Snacks",            icon: "restaurant" },
  { id: "gps",      label: "Live GPS Tracking", icon: "gps_fixed" },
  { id: "sos",      label: "Emergency SOS",     icon: "emergency" },
];

const STATUS_DOTS = { "Active": "#22C55E", "In_Maintenance": "#F59E0B", "Retired": "#F87171" };

const PHOTO_CATEGORIES = [
  { id: "sleeper",   name: "Sleeper Berths" },
  { id: "interiors", name: "Cabin Ambiance" },
  { id: "exterior",  name: "Exterior Fleet" },
  { id: "amenities", name: "Amenities & Tech" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ icon, title, subtitle, children, rightAction }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "1.25rem", overflow: "hidden" }}>
      <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #F8FAFC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#B91C1C", flexShrink: 0 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#0F172A" }}>{title}</div>
            {subtitle && <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: 1 }}>{subtitle}</div>}
          </div>
        </div>
        {rightAction}
      </div>
      <div style={{ padding: "1.25rem" }}>{children}</div>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "#475569", marginBottom: "0.375rem" }}>
      {children}{required && <span style={{ color: "#B91C1C", marginLeft: 2 }}>*</span>}
    </label>
  );
}

export default function NewBusPage() {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [regPlate, setRegPlate] = useState("");
  const [seats, setSeats] = useState(36);
  const [busTypeName, setBusTypeName] = useState("BharatBenz AC Sleeper (2+1)");
  const [busStyle, setBusStyle] = useState("sleeper");
  const [selectedAmenities, setSelectedAmenities] = useState(new Set(["wifi", "charging", "blanket", "gps", "water"]));
  const [status, setStatus] = useState("Active");

  // Gallery Photos
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState("sleeper");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoBadge, setNewPhotoBadge] = useState("");

  const toggleAmenity = (id) => {
    setSelectedAmenities(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const catObj = PHOTO_CATEGORIES.find(c => c.id === newPhotoCategory);
    const newEntry = {
      url: newPhotoUrl.trim(),
      category: newPhotoCategory,
      categoryName: catObj ? catObj.name : "Fleet Gallery",
      caption: newPhotoCaption.trim() || `${busTypeName} View`,
      badge: newPhotoBadge.trim() || (photos.length === 0 ? "Primary Cover" : ""),
      isPrimary: photos.length === 0,
    };
    setPhotos(prev => [...prev, newEntry]);
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setNewPhotoBadge("");
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimary = (index) => {
    setPhotos(prev => prev.map((p, i) => ({
      ...p,
      isPrimary: i === index,
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!regPlate.trim()) {
      alert("Registration plate number is required");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const amenitiesObj = {};
    AMENITIES.forEach(a => {
      amenitiesObj[a.id] = selectedAmenities.has(a.id);
    });

    try {
      const res = await adminFetch("/api/admin/fleet", {
        method: "POST",
        body: JSON.stringify({
          plateNumber: regPlate.trim().toUpperCase(),
          type: busTypeName,
          totalSeats: Number(seats),
          amenities: amenitiesObj,
          busStyle,
          status,
          images: photos,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("New bus registered and added to fleet successfully!");
        setTimeout(() => {
          router.push("/buses");
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to add bus to fleet");
      }
    } catch (err) {
      setErrorMsg("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", paddingLeft: 12, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
    border: "1px solid #E2E8F0", borderRadius: 8, fontSize: "0.875rem",
    color: "#0F172A", backgroundColor: "#fff", outline: "none", boxSizing: "border-box",
  };

  const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem", fontSize: "0.8125rem" }}>
        <Link href="/dashboard" style={{ color: "#64748B", textDecoration: "none" }}>Dashboard</Link>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#94A3B8" }}>chevron_right</span>
        <Link href="/buses" style={{ color: "#64748B", textDecoration: "none" }}>Buses</Link>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#94A3B8" }}>chevron_right</span>
        <span style={{ color: "#0F172A", fontWeight: 500 }}>Register New Bus</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display')", fontSize: "1.875rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2, margin: 0 }}>
            Register New Bus
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "0.375rem", marginBottom: 0 }}>
            Add a new coach to your fleet with 36-seat sleeper layout, amenities, and gallery showcase photos.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/buses" style={{
            padding: "0.5625rem 1rem", borderRadius: 8, border: "1px solid #CBD5E1",
            color: "#475569", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
          }}>
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              padding: "0.5625rem 1.5rem", borderRadius: 8, border: "none",
              backgroundColor: "#B91C1C", color: "#fff", fontSize: "0.875rem", fontWeight: 600,
              cursor: isSaving ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem",
              boxShadow: "0 2px 4px rgba(185, 28, 28, 0.2)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
            {isSaving ? "Registering Bus..." : "Register Bus & Photos"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div style={{ padding: "0.875rem 1.25rem", borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "0.875rem 1.25rem", borderRadius: 8, backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
        
        {/* ── LEFT COLUMN: Core Details & Photo Manager ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Section 1: Basic Specifications */}
          <SectionCard icon="directions_bus" title="Basic Information" subtitle="Coach registration and seating capacity">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <Label required>Registration Plate Number</Label>
                <input
                  value={regPlate}
                  onChange={e => setRegPlate(e.target.value)}
                  placeholder="e.g. MH 31 AP 4921"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label required>Total Seats (Sleeper Layout)</Label>
                <input
                  type="number"
                  value={seats}
                  onChange={e => setSeats(Number(e.target.value))}
                  min={1} max={60}
                  style={inputStyle}
                />
                <span style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 3, display: "block" }}>
                  Standard RedBus sleeper layout is 36 seats (18 Lower + 18 Upper).
                </span>
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <Label required>Coach Model / Type</Label>
                <input
                  value={busTypeName}
                  onChange={e => setBusTypeName(e.target.value)}
                  placeholder="e.g. BharatBenz AC Sleeper (2+1)"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label required>Bus Layout Style</Label>
                <select
                  value={busStyle}
                  onChange={e => setBusStyle(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="sleeper">Sleeper (1+2 RedBus 36-Berth)</option>
                  <option value="seater">Seater / Recliner Pushback</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Fleet Gallery & Photo Manager */}
          <SectionCard
            icon="photo_library"
            title="Bus Photo & Fleet Gallery Manager"
            subtitle={`Upload or assign photos for this bus (${photos.length} photos ready). Shown on Customer /gallery page.`}
            rightAction={null}
          >
            {/* Existing Photos Grid */}
            {photos.length === 0 ? (
              <div style={{
                padding: "2rem", border: "2px dashed #E2E8F0", borderRadius: 10,
                textAlign: "center", backgroundColor: "#F8FAFC", marginBottom: "1.25rem",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#94A3B8" }}>add_photo_alternate</span>
                <div style={{ fontWeight: 600, color: "#334155", marginTop: "0.5rem" }}>No photos uploaded for this bus yet</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "0.25rem" }}>
                  Add photos using the form below or click &quot;Load Curated 36-Seat Photos&quot; to populate standard luxury pictures.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 10, border: `1.5px solid ${photo.isPrimary ? "#B91C1C" : "#E2E8F0"}`,
                      overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    {/* Photo Thumbnail */}
                    <div style={{ position: "relative", width: "100%", height: 130, backgroundColor: "#0F172A" }}>
                      <img
                        src={photo.url}
                        alt={photo.caption || "Bus photo"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop";
                        }}
                      />
                      {photo.isPrimary && (
                        <span style={{
                          position: "absolute", top: 8, left: 8, backgroundColor: "#B91C1C", color: "#fff",
                          fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        }}>
                          ★ Primary Cover
                        </span>
                      )}
                      <span style={{
                        position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(15,23,42,0.75)",
                        color: "#fff", fontSize: "0.6875rem", padding: "2px 6px", borderRadius: 4,
                      }}>
                        {photo.categoryName || photo.category}
                      </span>
                    </div>

                    {/* Photo Info & Actions */}
                    <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#0F172A", marginBottom: 2 }}>
                          {photo.caption || "Bus Photo"}
                        </div>
                        {photo.badge && (
                          <span style={{ fontSize: "0.6875rem", color: "#B91C1C", backgroundColor: "#FEF2F2", padding: "1px 6px", borderRadius: 4, display: "inline-block" }}>
                            {photo.badge}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #F1F5F9" }}>
                        {!photo.isPrimary ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            style={{
                              border: "none", background: "none", color: "#2563EB", fontSize: "0.75rem",
                              fontWeight: 600, cursor: "pointer", padding: 0,
                            }}
                          >
                            Make Cover
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>Active Cover</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{
                            border: "none", background: "none", color: "#EF4444", fontSize: "0.75rem",
                            fontWeight: 600, cursor: "pointer", padding: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Photo Form */}
            <div style={{ backgroundColor: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0", padding: "1rem" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B", marginBottom: "0.75rem" }}>
                Add Photo to Bus Fleet
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <Label required>Image Direct URL / CDN Link</Label>
                  <input
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={newPhotoCategory}
                    onChange={e => setNewPhotoCategory(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {PHOTO_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
                <div>
                  <Label>Caption / Title</Label>
                  <input
                    value={newPhotoCaption}
                    onChange={e => setNewPhotoCaption(e.target.value)}
                    placeholder="e.g. Upper Deck 2-Sharing Cabin"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label>Badge Tag</Label>
                  <input
                    value={newPhotoBadge}
                    onChange={e => setNewPhotoBadge(e.target.value)}
                    placeholder="e.g. Solo Traveler Choice"
                    style={inputStyle}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  style={{
                    padding: "0.6rem 1.25rem", borderRadius: 8, border: "none",
                    backgroundColor: "#0F172A", color: "#fff", fontSize: "0.8125rem",
                    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  + Add Photo
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Amenities */}
          <SectionCard icon="settings" title="Amenities" subtitle="On-board facilities offered in this coach">
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              {AMENITIES.map(a => {
                const on = selectedAmenities.has(a.id);
                return (
                  <div
                    key={a.id}
                    onClick={() => toggleAmenity(a.id)}
                    style={{
                      flex: "1 1 calc(16.66% - 0.625rem)", minWidth: 90,
                      border: `1.5px solid ${on ? "#FCA5A5" : "#E2E8F0"}`,
                      borderRadius: 8, padding: "0.75rem 0.5rem",
                      cursor: "pointer", textAlign: "center",
                      backgroundColor: on ? "#FEF2F2" : "#fff",
                      transition: "all 150ms",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: on ? "#B91C1C" : "#94A3B8", display: "block", marginBottom: 4 }}>
                      {a.icon}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: on ? "#991B1B" : "#64748B", fontWeight: on ? 600 : 500 }}>
                      {a.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT COLUMN: Status & Live Preview ── */}
        <div style={{ width: 320, flexShrink: 0, position: "sticky", top: 80 }}>

          {/* Status */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "1.25rem", overflow: "hidden" }}>
            <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #F8FAFC", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#B91C1C" }}>schedule</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#0F172A" }}>Fleet Status</span>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <Label required>Operational Status</Label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: STATUS_DOTS[status] || "#22C55E",
                }} />
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 28, cursor: "pointer" }}
                >
                  <option value="Active">Active (Operational)</option>
                  <option value="In_Maintenance">In Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bus Live Card Preview */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #F8FAFC", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#B91C1C" }}>visibility</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#0F172A" }}>Customer Card Preview</span>
            </div>
            <div style={{ padding: "1rem" }}>
              {/* Photo Preview */}
              <div style={{ width: "100%", height: 160, borderRadius: 8, overflow: "hidden", backgroundColor: "#0F172A", position: "relative" }}>
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto.url}
                    alt="Bus Cover"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48 }}>directions_bus</span>
                  </div>
                )}
                <span style={{
                  position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.7)",
                  color: "#fff", fontSize: "0.6875rem", padding: "2px 6px", borderRadius: 4,
                }}>
                  📷 {photos.length} Photos
                </span>
              </div>

              <div style={{ marginTop: "0.875rem" }}>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A" }}>{busTypeName}</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: 2 }}>Plate: {regPlate || "MH-XX-XX-XXXX"}</div>
                
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <div style={{ flex: 1, backgroundColor: "#F8FAFC", padding: "0.5rem", borderRadius: 6, textAlign: "center", border: "1px solid #F1F5F9" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748B" }}>Total Berths</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>{seats}</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: "#F8FAFC", padding: "0.5rem", borderRadius: 6, textAlign: "center", border: "1px solid #F1F5F9" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748B" }}>Layout</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#B91C1C" }}>{busStyle === "sleeper" ? "1+2 RedBus" : "2+2 Recliner"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
