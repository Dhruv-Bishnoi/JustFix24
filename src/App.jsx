import { useEffect, useMemo, useState } from "react";
import {
  Wrench, Zap, Car, Snowflake, Hammer, Brush, Paintbrush, Droplets,
  Laptop, Scissors, Settings, Search, MapPin, Phone, ShieldCheck, Menu,
  X, ArrowRight, UserPlus, CheckCircle2, BriefcaseBusiness, SlidersHorizontal,
  LocateFixed, LoaderCircle
} from "lucide-react";

const API_URL = "https://justfix24.onrender.com";

const categories = [
  { name: "Electrician", icon: Zap, color: "bg-amber-100 text-amber-600" },
  { name: "Plumber", icon: Droplets, color: "bg-sky-100 text-sky-600" },
  { name: "Mechanic", icon: Car, color: "bg-orange-100 text-orange-600" },
  { name: "AC Repair", icon: Snowflake, color: "bg-cyan-100 text-cyan-600" },
  { name: "Carpenter", icon: Hammer, color: "bg-yellow-100 text-yellow-700" },
  { name: "Cleaning", icon: Brush, color: "bg-green-100 text-green-600" },
  { name: "Painter", icon: Paintbrush, color: "bg-pink-100 text-pink-600" },
  { name: "RO Repair", icon: Droplets, color: "bg-blue-100 text-blue-600" },
  { name: "Appliance Repair", icon: Settings, color: "bg-purple-100 text-purple-600" },
  { name: "Computer Repair", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
  { name: "Beauty & Salon", icon: Scissors, color: "bg-rose-100 text-rose-600" },
  { name: "Other Services", icon: Wrench, color: "bg-slate-100 text-slate-600" },
];

const cities = {
  Hisar: ["Sector 14", "Model Town", "Urban Estate", "Sector 13"],
  Sirsa: ["Rania Road", "Ellenabad Road", "Model Town"],
  Fatehabad: ["Model Town", "Tohana Road", "Bhuna Road"],
};

const emptyForm = {
  name: "", phone: "", service: "Electrician", city: "", area: "",
  experience: 0, description: "",
};

function App() {
  const [selectedService, setSelectedService] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [providerForm, setProviderForm] = useState(emptyForm);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setApiError("");
      try {
        const params = new URLSearchParams();
        if (selectedService) params.set("service", selectedService);
        if (city) params.set("city", city);
        if (area) params.set("area", area);
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(`${API_URL}?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load providers.");
        }
        setProviders(data.providers || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setApiError(error.message || "Unable to connect to the server.");
          setProviders([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedService, city, area, search]);

  const visibleProviders = useMemo(
    () => (showAll ? providers : providers.slice(0, 6)),
    [providers, showAll]
  );

  const selectCategory = (name) => {
    setSelectedService(name);
    setSearch("");
    setSearched(true);
    setShowAll(false);
    document.getElementById("search-section")?.scrollIntoView({
      behavior: "smooth", block: "center",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    setShowAll(false);
    document.getElementById("providers")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedService("");
    setCity("");
    setArea("");
    setSearch("");
    setSearched(false);
    setShowAll(false);
  };

  const updateProviderForm = (e) => {
    const { name, value } = e.target;
    setProviderForm((previous) => ({ ...previous, [name]: value }));
  };

  const submitProvider = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...providerForm,
          experience: Number(providerForm.experience) || 0,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setFormMessage({
        type: "success",
        text: "Registration successful! Your details have been submitted.",
      });
      setProviderForm(emptyForm);

      const params = new URLSearchParams();
      if (selectedService) params.set("service", selectedService);
      if (city) params.set("city", city);
      if (area) params.set("area", area);
      if (search.trim()) params.set("search", search.trim());

      const refresh = await fetch(`${API_URL}?${params.toString()}`);
      const refreshedData = await refresh.json();
      if (refresh.ok && refreshedData.success) {
        setProviders(refreshedData.providers || []);
      }

      setTimeout(() => {
        setShowModal(false);
        setFormMessage({ type: "", text: "" });
      }, 1400);
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.message || "Could not connect to the server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#home" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xl font-black text-white shadow-lg shadow-indigo-200">J</span>
            <span className="text-2xl font-extrabold tracking-tight">JUSTFIX<span className="text-indigo-600">24</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#home" className="hover:text-indigo-600">Home</a>
            <a href="#services" className="hover:text-indigo-600">Services</a>
            <a href="#providers" className="hover:text-indigo-600">Find Providers</a>
            <a href="#how-it-works" className="hover:text-indigo-600">How it works</a>
          </nav>
          <button onClick={() => setShowModal(true)} className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:flex">
            <UserPlus size={17} /> Join as Provider
          </button>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenu && (
          <nav className="flex flex-col gap-4 border-t border-slate-100 bg-white p-5 text-sm font-semibold md:hidden">
            <a href="#home" onClick={() => setMobileMenu(false)}>Home</a>
            <a href="#services" onClick={() => setMobileMenu(false)}>Services</a>
            <a href="#providers" onClick={() => setMobileMenu(false)}>Find Providers</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
            <button onClick={() => { setMobileMenu(false); setShowModal(true); }} className="rounded-lg bg-indigo-600 p-3 text-white">Join as Provider</button>
          </nav>
        )}
      </header>

      <main>
        <section id="home" className="relative overflow-hidden bg-slate-950 px-5 py-20 text-white lg:py-28">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="relative mx-auto max-w-6xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-green-400" /> YOUR LOCAL SERVICE PARTNER
            </span>
            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Find Trusted Professionals <span className="block text-indigo-400">Near You.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              From home repairs to vehicle services, connect directly with local professionals in your neighbourhood.
            </p>

            <form id="search-section" onSubmit={handleSearch} className="mx-auto mt-12 grid max-w-5xl gap-3 rounded-2xl bg-white p-3 text-left shadow-2xl shadow-black/30 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                <Search className="shrink-0 text-indigo-600" size={21} />
                <div className="min-w-0 flex-1">
                  <label className="block text-xs font-bold text-slate-500">WHAT SERVICE?</label>
                  <input value={search} onChange={(e) => { setSearch(e.target.value); setSelectedService(""); }} placeholder="Electrician, plumber..." className="mt-1 w-full min-w-0 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 md:border-l md:border-t-0">
                <MapPin className="shrink-0 text-indigo-600" size={21} />
                <div className="min-w-0 flex-1">
                  <label className="block text-xs font-bold text-slate-500">SELECT CITY</label>
                  <select value={city} onChange={(e) => { setCity(e.target.value); setArea(""); }} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none">
                    <option value="">All Cities</option>
                    {Object.keys(cities).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 md:border-l md:border-t-0">
                <LocateFixed className="shrink-0 text-indigo-600" size={21} />
                <div className="min-w-0 flex-1">
                  <label className="block text-xs font-bold text-slate-500">SELECT AREA</label>
                  <select value={area} onChange={(e) => setArea(e.target.value)} disabled={!city} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none disabled:opacity-40">
                    <option value="">All Areas</option>
                    {(cities[city] || []).map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 font-bold text-white transition hover:bg-indigo-700">
                Search <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> Direct calling</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> Local professionals</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> Easy connection</span>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto grid max-w-5xl -translate-y-1 grid-cols-3 rounded-2xl border border-slate-100 bg-white px-3 py-7 shadow-xl shadow-slate-200/50 sm:px-8">
          {[{ value: "12+", label: "Service Categories" }, { value: "Local", label: "Service Professionals" }, { value: "Direct", label: "Customer Connection" }].map((stat) => (
            <div key={stat.label} className="text-center">
              <h2 className="text-2xl font-black text-indigo-600 sm:text-3xl">{stat.value}</h2>
              <p className="mt-1 text-[10px] font-medium text-slate-500 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </section>

        <section id="services" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-indigo-600">OUR SERVICES</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Explore by Category</h2>
              <p className="mt-3 text-sm text-slate-500">Choose a service and find the right professional.</p>
            </div>
            <button onClick={clearFilters} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View all services →</button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = selectedService === category.name;
              return (
                <button key={category.name} onClick={() => selectCategory(category.name)} className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg sm:p-5 ${active ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-slate-100 bg-white"}`}>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${category.color}`}><Icon size={23} /></span>
                  <span className="text-sm font-bold text-slate-800 sm:text-base">{category.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="providers" className="bg-slate-50 px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-indigo-600">LOCAL PROFESSIONALS</span>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{searched ? "Search Results" : "Service Providers"}</h2>
                <p className="mt-3 text-sm text-slate-500">{loading ? "Loading providers..." : `${providers.length} providers found.`}</p>
              </div>
              {searched && <button onClick={clearFilters} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-indigo-600">Clear filters</button>}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <SlidersHorizontal size={16} />
              {selectedService || search || "All services"}
              {city && ` • ${city}`}
              {area && ` • ${area}`}
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-white py-16 text-slate-500">
                <LoaderCircle className="animate-spin" /> Loading service providers...
              </div>
            ) : apiError ? (
              <div className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center">
                <h3 className="text-xl font-bold text-red-600">Could not load providers</h3>
                <p className="mt-2 text-sm text-slate-500">{apiError}</p>
                <p className="mt-2 text-xs text-slate-400">Check your internet connection or try again later.</p>
              </div>
            ) : visibleProviders.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProviders.map((provider) => {
                  const initials = (provider.name || "P").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <article key={provider._id} className="rounded-2xl border border-slate-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                      <div className="flex items-start gap-3">
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-lg font-black text-indigo-700">{initials}</div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold">{provider.name}</h3>
                          <p className="mt-1 text-xs text-slate-500">{provider.description || provider.service}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {provider.isVerified && <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700"><ShieldCheck size={13} /> Verified</span>}
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">{provider.service}</span>
                      </div>
                      <div className="mt-5 space-y-3 text-sm text-slate-500">
                        <p className="flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> {provider.area}, {provider.city}</p>
                        <p className="flex items-center gap-2"><BriefcaseBusiness size={16} className="text-indigo-500" /> {provider.experience || 0} years experience</p>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">Contact provider</p>
                          <p className="mt-1 truncate text-sm font-extrabold">{provider.phone}</p>
                        </div>
                        <a href={`tel:${provider.phone}`} className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
                          <Phone size={16} /> Call
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <Search size={40} className="mx-auto text-slate-300" />
                <h3 className="mt-4 text-xl font-bold">No providers found</h3>
                <p className="mt-2 text-sm text-slate-500">Try another service, city or area, or ask a provider to register.</p>
                <button onClick={clearFilters} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Clear search</button>
              </div>
            )}

            {!loading && !apiError && providers.length > 6 && (
              <div className="mt-10 text-center">
                <button onClick={() => setShowAll(!showAll)} className="rounded-xl border border-indigo-200 bg-white px-7 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50">
                  {showAll ? "Show Less" : "View More Providers"}
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold tracking-widest text-indigo-600">SIMPLE PROCESS</span>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">How JUSTFIX24 Works</h2>
            <p className="mt-3 text-sm text-slate-500">Three simple steps to connect with local professionals.</p>
          </div>
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {[
              { icon: Search, number: "01", title: "Choose a Service", desc: "Select the service you need from our categories." },
              { icon: MapPin, number: "02", title: "Select Location", desc: "Choose your city and area to discover local professionals." },
              { icon: Phone, number: "03", title: "Call Directly", desc: "View provider details and contact them directly." },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={29} /></div>
                  <p className="mt-5 text-xs font-extrabold tracking-widest text-indigo-600">STEP {step.number}</p>
                  <h3 className="mt-2 text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 p-8 text-white shadow-xl shadow-indigo-200 sm:p-12 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-xs font-extrabold tracking-widest text-indigo-200">GROW YOUR BUSINESS</span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Are You a Service Professional?</h2>
              <p className="mt-4 text-sm leading-7 text-indigo-100">Join JUSTFIX24 and connect directly with customers searching for your services in their local area.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-4 font-extrabold text-indigo-700 transition hover:-translate-y-1 hover:bg-indigo-50">
              Register as Provider <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-7 border-b border-white/10 pb-9 md:flex-row">
            <a href="#home" className="flex items-center gap-2.5 text-2xl font-black">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600">J</span>
              JUSTFIX<span className="-ml-2 text-indigo-400">24</span>
            </a>
            <p className="text-center text-sm text-slate-400">Find local help. Connect directly. Get it fixed.</p>
            <div className="flex gap-5 text-sm text-slate-300">
              <a href="#home" className="hover:text-white">Home</a>
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#providers" className="hover:text-white">Providers</a>
            </div>
          </div>
          <p className="pt-7 text-center text-xs text-slate-500">© {new Date().getFullYear()} JUSTFIX24. All rights reserved.</p>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)}>
          <div className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => !submitting && setShowModal(false)} className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" aria-label="Close registration"><X size={18} /></button>
            <span className="text-xs font-extrabold tracking-widest text-indigo-600">JOIN JUSTFIX24</span>
            <h2 className="mt-3 text-2xl font-black">Become a Service Provider</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your details to register your service.</p>

            {formMessage.text && (
              <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${formMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {formMessage.text}
              </div>
            )}

            <form onSubmit={submitProvider} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">Full Name</label>
                <input name="name" value={providerForm.name} onChange={updateProviderForm} required maxLength={80} placeholder="Enter your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Mobile Number</label>
                <input name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={providerForm.phone} onChange={updateProviderForm} required placeholder="10-digit mobile number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Service Category</label>
                <select name="service" value={providerForm.service} onChange={updateProviderForm} required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500">
                  {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">City</label>
                <select name="city" value={providerForm.city} onChange={(e) => setProviderForm((p) => ({ ...p, city: e.target.value, area: "" }))} required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500">
                  <option value="">Select city</option>
                  {Object.keys(cities).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Area</label>
                <select name="area" value={providerForm.area} onChange={updateProviderForm} required disabled={!providerForm.city} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-50">
                  <option value="">Select area</option>
                  {(cities[providerForm.city] || []).map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Experience (years)</label>
                <input name="experience" type="number" min="0" max="60" value={providerForm.experience} onChange={updateProviderForm} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">About your service (optional)</label>
                <textarea name="description" rows="3" maxLength={500} value={providerForm.description} onChange={updateProviderForm} placeholder="Briefly describe your work..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? <><LoaderCircle size={18} className="animate-spin" /> Submitting...</> : <>Submit Registration <ArrowRight size={18} /></>}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-400">Your listing will appear after successful registration.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
