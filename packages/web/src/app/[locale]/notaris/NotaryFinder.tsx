'use client';

import { notaries, type Notary } from '@/data/notaries';
import { useState } from 'react';
import { Search, MapPin, Phone, Briefcase, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CITIES = [
  'Amsterdam',
  'Rotterdam',
  'Den Haag',
  'Utrecht',
  'Eindhoven',
  'Amstelveen',
  'Groningen',
  'Tilburg',
  'Almere',
  'Breda',
];

export function NotaryFinder() {
  const t = useTranslations('notary');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(notaries.flatMap((n) => n.specialties))
  ).sort();

  // Filter notaries
  const filteredNotaries = notaries.filter((notary) => {
    const matchesCity = !selectedCity || notary.city === selectedCity;
    const matchesSpecialty =
      !selectedSpecialty || notary.specialties.includes(selectedSpecialty);
    const matchesSearch =
      !searchQuery ||
      notary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notary.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesSpecialty && matchesSearch;
  });

  // Fire-and-forget tracking
  const trackEvent = (notary_id: string | number, event_type: string, extra?: Record<string, string>) => {
    fetch('/api/notary-referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notary_id, event_type, ...extra }),
    }).catch(() => {}); // silent fail
  };

  const handleOpenModal = (notary: Notary) => {
    trackEvent(notary.id, 'click');
    setSelectedNotary(notary);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotary(null);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotary) return;

    try {
      // Track the appointment request with contact details
      trackEvent(selectedNotary.id, 'appointment_request', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      // Show success and close modal
      alert(t('modal.successMessage'));
      handleCloseModal();
    } catch (error) {
      console.error('Failed to submit:', error);
      alert(t('modal.errorMessage'));
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-lg text-white/80">
              {t('hero.subtitle')}
            </p>

            {/* Search Input */}
            <div className="mt-8 max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fg-subtle" />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-fg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* City Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">
            {t('cities.title')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() =>
                  setSelectedCity(selectedCity === city ? '' : city)
                }
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  selectedCity === city
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-fg hover:bg-bg-sunken border border-line'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Specialty Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">
            {t('specialties.title')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() =>
                  setSelectedSpecialty(
                    selectedSpecialty === specialty ? '' : specialty
                  )
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialty === specialty
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-fg hover:bg-bg-sunken border border-line'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCity || selectedSpecialty) && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-fg-muted">{t('filters.active')}:</span>
            {selectedCity && (
              <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                {selectedCity}
                <button
                  onClick={() => setSelectedCity('')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedSpecialty && (
              <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                {selectedSpecialty}
                <button
                  onClick={() => setSelectedSpecialty('')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-fg-muted">
            {filteredNotaries.length} {t('results.count')}
          </p>
        </div>

        {/* Notary Listings */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredNotaries.map((notary) => (
            <div
              key={notary.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-line hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-navy-900 mb-3">
                {notary.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-fg-muted">
                  <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {notary.address}
                    <br />
                    {notary.city}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-fg-muted">
                  <Phone className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <a
                    href={`tel:${notary.phone}`}
                    className="text-sm hover:text-primary-600"
                  >
                    {notary.phone}
                  </a>
                </div>

                <div className="flex items-start gap-2 text-fg-muted">
                  <Briefcase className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {notary.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-1"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenModal(notary)}
                className="w-full mt-4 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                {t('card.requestAppointment')}
              </button>
            </div>
          ))}
        </div>

        {filteredNotaries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-fg-muted">{t('results.noResults')}</p>
            <button
              onClick={() => {
                setSelectedCity('');
                setSelectedSpecialty('');
                setSearchQuery('');
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('results.clearFilters')}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedNotary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-navy-900">
                {t('modal.title')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-fg-subtle hover:text-fg-muted"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-fg-muted mb-6">
              {t('modal.subtitle')} <strong>{selectedNotary.name}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-1">
                  {t('modal.nameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-line-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1">
                  {t('modal.emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-line-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1">
                  {t('modal.phoneLabel')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-line-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1">
                  {t('modal.messageLabel')}
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-line-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('modal.messagePlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-line-strong rounded-lg font-medium text-fg hover:bg-bg-sunken transition-colors"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  {t('modal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
