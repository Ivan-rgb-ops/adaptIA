/**
 * Extrae nombre y datos de contacto del texto del CV que subió el usuario.
 * No usa ningún dato por defecto: si algo no se detecta, simplemente no se muestra.
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%-]+\/?/i;
const PHONE_CANDIDATE_RE = /\+?\d[\d\s().-]{6,}\d/g;
const YEAR_RANGE_RE = /^(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}$/;

function findPhone(text) {
  const candidates = text.match(PHONE_CANDIDATE_RE) || [];
  return (
    candidates
      .map((c) => c.trim())
      // descarta rangos de años ("2018 - 2022") y números demasiado cortos/largos
      .find((c) => {
        const digits = c.replace(/\D/g, '').length;
        return digits >= 8 && digits <= 15 && !YEAR_RANGE_RE.test(c);
      }) || ''
  );
}

const SECTION_TITLE_RE =
  /curr[ií]culum|curriculum|resume|^cv\b|perfil|resumen|experiencia|educaci[oó]n|formaci[oó]n|habilidades|competencias|contacto|certificaci|proyectos|idiomas/i;

function isName(line) {
  const words = line.split(/\s+/);
  return (
    line.length >= 5 &&
    line.length <= 60 &&
    words.length >= 2 &&
    words.length <= 5 &&
    !/[@\d/:]/.test(line) &&
    !SECTION_TITLE_RE.test(line)
  );
}

// El nombre suele estar en una de las primeras líneas (a veces precedido por "Curriculum Vitae").
function findName(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 3);
  return lines.find(isName) || '';
}

export function extractContactInfo(cvText) {
  if (!cvText) return { name: '', contact: '' };

  const email = (cvText.match(EMAIL_RE) || [''])[0];
  const phone = findPhone(cvText);
  const linkedin = (cvText.match(LINKEDIN_RE) || [''])[0];

  return {
    name: findName(cvText).toUpperCase(),
    contact: [email, phone, linkedin].filter(Boolean).join('  |  ')
  };
}
