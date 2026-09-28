import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import ToolSection from './components/ToolSection.jsx';
import Footer from './components/Footer.jsx';

const API_BASE = '/api';

/* ── Taller page ────────────────────────────────────────────────────────── */
function TallerPage() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTailor() {
    setError('');
    if (!cvText.trim() || !jobDescription.trim()) {
      setError('Pegá o subí tu CV, y pegá la descripción de la vacante.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/tailor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error generando la adaptación.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadCv(file) {
    setError('');
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await fetch(`${API_BASE}/parse-cv`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo leer el archivo.');
      setCvText(data.text);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <ToolSection
        cvText={cvText}
        jobDescription={jobDescription}
        onCvTextChange={setCvText}
        onJobDescriptionChange={setJobDescription}
        onUploadCv={handleUploadCv}
        onSubmit={handleTailor}
        loading={loading}
        error={error}
        result={result}
      />
      <Footer />
    </div>
  );
}

/* ── Root app with routing ─────────────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();

  function goToTaller() {
    navigate('/taller');
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="app-shell">
          <Landing onGoToTool={goToTaller} />
        </div>
      } />
      <Route path="/taller" element={<TallerPage />} />
    </Routes>
  );
}
