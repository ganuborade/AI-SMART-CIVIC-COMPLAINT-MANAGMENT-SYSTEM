import React, { useState, useEffect } from 'react';
import { createComplaintMultipartApi, analyzeComplaintLiveApi, analyzeImageLiveApi } from '../api';
import { useUI } from '../context/UIContext';
import CityMap from './CityMap';
import { X, Sparkles, MapPin, UploadCloud, AlertCircle, CheckCircle2, ArrowRight, Compass, Clock, Navigation } from 'lucide-react';

export default function NewComplaintModal({ isOpen, onClose, onCreated }) {
  const { t } = useUI();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('FC Road, Shivajinagar, Pune');
  const [location, setLocation] = useState({ lat: 18.5204, lng: 73.8567 });
  const [capturedTime, setCapturedTime] = useState(new Date().toLocaleTimeString());
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [reverseGeocodingLoading, setReverseGeocodingLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Live AI Prediction States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setAiAnalysis(null);
      setStep(1);
    } else {
      handleDetectLocation();
    }
  }, [isOpen]);

  // Live AI Prediction debounce when typing
  useEffect(() => {
    if (title.length > 5 || description.length > 10) {
      const timer = setTimeout(async () => {
        try {
          setAiLoading(true);
          const res = await analyzeComplaintLiveApi({
            title,
            description,
            latitude: location.lat,
            longitude: location.lng
          });
          setAiAnalysis(res.data);
        } catch (e) {
          // Ignored in offline
        } finally {
          setAiLoading(false);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [title, description, location]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Instant AI photo inspection
      try {
        setAiLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        const res = await analyzeImageLiveApi(formData);
        if (res.data) {
          setAiAnalysis((prev) => ({
            ...prev,
            category: res.data.category || prev?.category,
            confidence: res.data.confidence || prev?.confidence,
            imageTags: res.data.imageTags || 'Visual damage marker detected'
          }));
        }
      } catch (err) {
        console.warn('Image analysis fallback');
      } finally {
        setAiLoading(false);
      }
    }
  };

  // Real-time Free Reverse Geocoding with OpenStreetMap Nominatim API
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      setReverseGeocodingLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.display_name) {
        // Build concise clean address
        const parts = [];
        if (data.address.road) parts.push(data.address.road);
        if (data.address.suburb || data.address.neighbourhood) parts.push(data.address.suburb || data.address.neighbourhood);
        if (data.address.city || data.address.town || data.address.county) parts.push(data.address.city || data.address.town || data.address.county);
        if (data.address.postcode) parts.push(data.address.postcode);

        const formatted = parts.length > 0 ? parts.join(', ') : data.display_name;
        setAddress(formatted);
      }
    } catch (err) {
      console.warn('Reverse geocoding error', err);
    } finally {
      setReverseGeocodingLoading(false);
    }
  };

  // Real-time GPS Detection
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setLocation({ lat, lng });
          setCapturedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setIsDetectingGps(false);
          fetchAddressFromCoords(lat, lng);
        },
        () => {
          setIsDetectingGps(false);
          // Fallback to current city location
          fetchAddressFromCoords(location.lat, location.lng);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleMapPinSelect = (lat, lng) => {
    const fixedLat = Number(lat.toFixed(6));
    const fixedLng = Number(lng.toFixed(6));
    setLocation({ lat: fixedLat, lng: fixedLng });
    setCapturedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    fetchAddressFromCoords(fixedLat, fixedLng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide title and description.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('address', address);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await createComplaintMultipartApi(formData);
      onCreated(res.data);
      onClose();
    } catch (err) {
      alert('Failed to register complaint: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div>
            <h2>{t('reportProblem')}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Step {step} of 3: {step === 1 ? 'Problem Description' : (step === 2 ? 'Upload Photo Proof' : 'Real-Time GPS Location')}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">{t('tableTitle')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dangerous large pothole causing vehicle accidents near school"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the issue, landmarks, severity, how long it has been unresolved, and hazards to commuters..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* AI Instant Triage Preview */}
                {(aiAnalysis || aiLoading) && (
                  <div className="ai-insight-box">
                    <div className="ai-insight-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={14} /> AI Real-time Triage
                      </span>
                      {aiLoading && <span style={{ fontSize: '0.7rem' }}>Thinking...</span>}
                    </div>

                    {aiAnalysis && (
                      <>
                        <div className="ai-recommendation-chips">
                          <span className={`badge badge-${aiAnalysis.priority?.toLowerCase()}`}>
                            {t(aiAnalysis.priority) || aiAnalysis.priority}
                          </span>
                          <span className="badge badge-status">
                            {t(aiAnalysis.category) || aiAnalysis.category?.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Confidence: {Math.round((aiAnalysis.confidence || 0.88) * 100)}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          Target Municipal Dept: <strong>{aiAnalysis.suggestedDepartment}</strong>
                        </div>
                        {aiAnalysis.duplicateOfId && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#fbbf24',
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            ⚠️ Potential duplicate of #{aiAnalysis.duplicateOfId}: "{aiAnalysis.duplicateTitle}"
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Upload Photo Evidence (Optional but Recommended)</label>
                  <label className="dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {imageFile ? imageFile.name : 'Click or drop civic defect photo here'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      PNG, JPG up to 15MB. AI will analyze the picture to verify damages.
                    </div>
                  </label>
                </div>

                {imagePreview && (
                  <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} color="#10b981" /> Photo Attached
                    </span>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      <Navigation size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {t('dropPinHint')}
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingGps}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Compass size={13} color="var(--primary)" />
                      {isDetectingGps ? t('detectingGps') : t('autoGpsBtn')}
                    </button>
                  </div>

                  {/* Real-time Telemetry Card */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginBottom: '8px',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('liveCoords')}:</span>
                      <div style={{ fontWeight: 700, color: 'var(--accent-blue, #38bdf8)' }}>
                        {location.lat}° N, {location.lng}° E
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('capturedAt')}:</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {capturedTime}
                      </div>
                    </div>
                  </div>

                  <CityMap
                    height="240px"
                    isPicker={true}
                    pickerLocation={location}
                    onSelectLocation={handleMapPinSelect}
                  />

                  <div style={{ marginTop: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('reverseGeocoded')} *</span>
                      {reverseGeocodingLoading && <span style={{ color: 'var(--primary)' }}>Resolving address...</span>}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Near Modern High School, FC Road, Pune"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (step === 1 && (!title.trim() || !description.trim())) {
                    alert('Please enter a title and description before proceeding.');
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting & Analyzing AI...' : 'Submit Real-Time Complaint'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
