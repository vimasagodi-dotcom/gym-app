import React from 'react';
import type { MuscleGroup } from '../../types/exercise';
import type { AvatarSilhouette } from '../../types/user';

interface MuscleDiagramProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  selectedMuscle?: MuscleGroup | null;
  onSelectMuscle?: (muscle: MuscleGroup) => void;
  silhouette?: AvatarSilhouette;
  view?: 'anterior' | 'posterior' | 'both';
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  themeColor?: 'amber' | 'blue' | 'emerald';
}

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  selectedMuscle = null,
  onSelectMuscle,
  silhouette = 'neutral',
  view = 'both',
  interactive = true,
  size = 'md',
  className = '',
  themeColor = 'amber',
}) => {
  // Paletas de alta saturação solicitadas
  const colorMap = {
    amber: {
      primary: '#f59e0b', // Âmbar atlético
      secondary: '#fbbf24', // Âmbar suave
      selected: '#38bdf8', // Ciano elétrico
    },
    blue: {
      primary: '#2563eb', // Azul Elétrico
      secondary: '#60a5fa', // Azul suave
      selected: '#38bdf8',
    },
    emerald: {
      primary: '#10b981', // Verde Esmeralda
      secondary: '#34d399',
      selected: '#38bdf8',
    },
  }[themeColor];

  const neutralIdleColor = '#18181b'; // Cinzento escuro mate profundo solicitado (#18181B)
  const neutralStrokeColor = '#27272a'; // Contorno subtil

  const getFillColor = (muscle: MuscleGroup): string => {
    const isSelected = selectedMuscle === muscle;
    const isPrimary = primaryMuscles.includes(muscle);
    const isSecondary = secondaryMuscles.includes(muscle);

    if (isSelected) return colorMap.selected;
    if (isPrimary) return colorMap.primary;
    if (isSecondary) return colorMap.secondary;
    return neutralIdleColor;
  };

  const getOpacity = (muscle: MuscleGroup): number => {
    const isSelected = selectedMuscle === muscle;
    const isPrimary = primaryMuscles.includes(muscle);
    const isSecondary = secondaryMuscles.includes(muscle);

    if (isSelected || isPrimary) return 1;
    if (isSecondary) return 0.65;
    return 0.85; // Tom mate profundo
  };

  const getStrokeColor = (muscle: MuscleGroup): string => {
    const isSelected = selectedMuscle === muscle;
    const isPrimary = primaryMuscles.includes(muscle);
    if (isSelected) return '#38bdf8';
    if (isPrimary) return colorMap.primary;
    return neutralStrokeColor;
  };

  const handleMuscleClick = (muscle: MuscleGroup) => {
    if (interactive && onSelectMuscle) {
      onSelectMuscle(muscle);
    }
  };

  const dimensions = {
    sm: { width: 100, height: 185 },
    md: { width: 140, height: 260 },
    lg: { width: 185, height: 340 },
  }[size];

  // Ajuste sutil de proporção do tronco dependendo da silhueta escolhida
  // Masculino: ombros ainda mais largos e cintura super estreita (V-Taper extremo)
  // Feminino: anca ligeiramente mais arredondada e ombros atléticos
  // Neutro: atlético proporcional equilibrado
  const shoulderOffset = silhouette === 'male' ? 3 : silhouette === 'female' ? -2 : 0;
  const waistOffset = silhouette === 'female' ? -2 : silhouette === 'male' ? -1 : 0;

  return (
    <div className={`muscle-diagram-v-taper flex items-center justify-center gap-4 select-none ${className}`}>
      {/* ========================================================
          VISTA ANTERIOR (FRONTAL) — V-TAPER ATHLETIC SILHOUETTE
         ======================================================== */}
      {(view === 'anterior' || view === 'both') && (
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-black text-slate-400 mb-1.5 font-mono">
            Frente
          </span>
          <svg
            viewBox="0 0 120 230"
            width={dimensions.width}
            height={dimensions.height}
            className="filter drop-shadow-md transition-all duration-300"
          >
            {/* Cabeça e Pescoço Atlético */}
            <circle cx="60" cy="18" r="9" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
            {/* Pescoço com esternocleidomastoideo */}
            <path d="M56 26 L56 34 L64 34 L64 26 Z" fill="#27272a" />

            {/* OMBROS LARGOS (DELTOIDES ANTERIORES & LATERAIS) */}
            <g
              onClick={() => handleMuscleClick('shoulders')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Ombros (Deltoides)</title>
              {/* Ombro Esquerdo */}
              <path
                d={`M38 34 C${28 - shoulderOffset} 35, ${20 - shoulderOffset} 43, ${22 - shoulderOffset} 53 C${24 - shoulderOffset} 58, 30 57, 36 50 Z`}
                fill={getFillColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={getStrokeColor('shoulders')}
                strokeWidth="1"
              />
              {/* Ombro Direito */}
              <path
                d={`M82 34 C${92 + shoulderOffset} 35, ${100 + shoulderOffset} 43, ${98 + shoulderOffset} 53 C${96 + shoulderOffset} 58, 90 57, 84 50 Z`}
                fill={getFillColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={getStrokeColor('shoulders')}
                strokeWidth="1"
              />
            </g>

            {/* PEITORAL QUADRADO E DEMARCADO (CHEST) */}
            <g
              onClick={() => handleMuscleClick('chest')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Peitoral</title>
              {/* Peitoral Esquerdo */}
              <path
                d="M40 35 C48 36, 58 39, 58 53 C52 58, 41 57, 36 51 C35 44, 38 38, 40 35 Z"
                fill={getFillColor('chest')}
                fillOpacity={getOpacity('chest')}
                stroke={getStrokeColor('chest')}
                strokeWidth="1.2"
              />
              {/* Peitoral Direito */}
              <path
                d="M80 35 C72 36, 62 39, 62 53 C68 58, 79 57, 84 51 C85 44, 82 38, 80 35 Z"
                fill={getFillColor('chest')}
                fillOpacity={getOpacity('chest')}
                stroke={getStrokeColor('chest')}
                strokeWidth="1.2"
              />
            </g>

            {/* BÍCEPS ESCULPIDOS */}
            <g
              onClick={() => handleMuscleClick('biceps')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Bicípites</title>
              {/* Bíceps Esquerdo */}
              <path
                d="M23 55 C19 61, 20 70, 24 76 C28 75, 30 67, 28 59 Z"
                fill={getFillColor('biceps')}
                fillOpacity={getOpacity('biceps')}
                stroke={getStrokeColor('biceps')}
                strokeWidth="1"
              />
              {/* Bíceps Direito */}
              <path
                d="M97 55 C101 61, 100 70, 96 76 C92 75, 90 67, 92 59 Z"
                fill={getFillColor('biceps')}
                fillOpacity={getOpacity('biceps')}
                stroke={getStrokeColor('biceps')}
                strokeWidth="1"
              />
            </g>

            {/* ANTEBRAÇOS DEFINIDOS */}
            <g
              onClick={() => handleMuscleClick('forearms')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Antebraços</title>
              {/* Esquerdo */}
              <path
                d="M23 79 C18 85, 17 96, 20 104 C23 104, 26 96, 27 83 Z"
                fill={getFillColor('forearms')}
                fillOpacity={getOpacity('forearms')}
                stroke={getStrokeColor('forearms')}
                strokeWidth="1"
              />
              {/* Direito */}
              <path
                d="M97 79 C102 85, 103 96, 100 104 C97 104, 94 96, 93 83 Z"
                fill={getFillColor('forearms')}
                fillOpacity={getOpacity('forearms')}
                stroke={getStrokeColor('forearms')}
                strokeWidth="1"
              />
            </g>

            {/* ABDÓMEN SIX-PACK & CINTURA ESTREITA (OBLÍQUOS V-LINE) */}
            <g
              onClick={() => handleMuscleClick('abs')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Abdominais / Core</title>
              {/* Gomos Centrais Superiores */}
              <path
                d="M51 57 L58 57 L58 66 L51 66 Z
                   M62 57 L69 57 L69 66 L62 66 Z
                   M51 68 L58 68 L58 77 L51 77 Z
                   M62 68 L69 68 L69 77 L62 77 Z
                   M52 79 L58 79 L58 89 L53 88 Z
                   M62 79 L68 79 L67 88 L62 89 Z"
                fill={getFillColor('abs')}
                fillOpacity={getOpacity('abs')}
                stroke={getStrokeColor('abs')}
                strokeWidth="0.8"
              />
              {/* Oblíquos V-Line estreitos */}
              <path
                d={`M44 57 C${46 + waistOffset} 70, ${47 + waistOffset} 82, 51 90 L50 78 L47 62 Z
                   M76 57 C${74 - waistOffset} 70, ${73 - waistOffset} 82, 69 90 L70 78 L73 62 Z`}
                fill={getFillColor('abs')}
                fillOpacity={getOpacity('abs') * 0.9}
                stroke={getStrokeColor('abs')}
                strokeWidth="0.8"
              />
            </g>

            {/* QUADRÍCEPS VOLUMOSOS & CORTADOS */}
            <g
              onClick={() => handleMuscleClick('quads')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Quadríceps</title>
              {/* Coxa Esquerda com Vasto Lateral em curva marcante */}
              <path
                d="M36 100 C33 118, 36 142, 42 156 C47 157, 52 154, 56 144 C57 131, 56 108, 53 100 Z"
                fill={getFillColor('quads')}
                fillOpacity={getOpacity('quads')}
                stroke={getStrokeColor('quads')}
                strokeWidth="1.2"
              />
              {/* Coxa Direita com Vasto Lateral */}
              <path
                d="M84 100 C87 118, 84 142, 78 156 C73 157, 68 154, 64 144 C63 131, 64 108, 67 100 Z"
                fill={getFillColor('quads')}
                fillOpacity={getOpacity('quads')}
                stroke={getStrokeColor('quads')}
                strokeWidth="1.2"
              />
            </g>

            {/* GÉMEOS ANTERIORES / TIBIAIS */}
            <g
              onClick={() => handleMuscleClick('calves')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Gémeos / Canelas</title>
              {/* Esquerda */}
              <path
                d="M41 163 C37 173, 37 190, 43 204 C46 204, 48 197, 49 183 C49 171, 48 163, 45 163 Z"
                fill={getFillColor('calves')}
                fillOpacity={getOpacity('calves')}
                stroke={getStrokeColor('calves')}
                strokeWidth="1"
              />
              {/* Direita */}
              <path
                d="M79 163 C83 173, 83 190, 77 204 C74 204, 72 197, 71 183 C71 171, 72 163, 75 163 Z"
                fill={getFillColor('calves')}
                fillOpacity={getOpacity('calves')}
                stroke={getStrokeColor('calves')}
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>
      )}

      {/* ========================================================
          VISTA POSTERIOR (COSTAS) — V-TAPER DORSAL & DIAMOND CALVES
         ======================================================== */}
      {(view === 'posterior' || view === 'both') && (
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-black text-slate-400 mb-1.5 font-mono">
            Costas
          </span>
          <svg
            viewBox="0 0 120 230"
            width={dimensions.width}
            height={dimensions.height}
            className="filter drop-shadow-md transition-all duration-300"
          >
            {/* Cabeça e Pescoço */}
            <circle cx="60" cy="18" r="9" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />

            {/* TRAPÉZIO SUPERIOR & MÉDIO (DIAMOND BACK) */}
            <g
              onClick={() => handleMuscleClick('upper_back')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Trapézio & Costas Superior</title>
              <path
                d="M60 26 L48 36 C40 38, 38 43, 38 46 C47 50, 56 50, 60 67 C64 50, 73 50, 82 46 C82 43, 80 38, 72 36 Z"
                fill={getFillColor('upper_back')}
                fillOpacity={getOpacity('upper_back')}
                stroke={getStrokeColor('upper_back')}
                strokeWidth="1.2"
              />
            </g>

            {/* DELTOIDES POSTERIORES (OMBROS TRÁS) */}
            <g
              onClick={() => handleMuscleClick('shoulders')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Ombros Posteriores</title>
              {/* Esquerdo */}
              <path
                d={`M36 36 C${26 - shoulderOffset} 39, ${22 - shoulderOffset} 47, ${24 - shoulderOffset} 55 C${28 - shoulderOffset} 55, 34 50, 36 43 Z`}
                fill={getFillColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={getStrokeColor('shoulders')}
                strokeWidth="1"
              />
              {/* Direito */}
              <path
                d={`M84 36 C${94 + shoulderOffset} 39, ${98 + shoulderOffset} 47, ${96 + shoulderOffset} 55 C${92 + shoulderOffset} 55, 86 50, 84 43 Z`}
                fill={getFillColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={getStrokeColor('shoulders')}
                strokeWidth="1"
              />
            </g>

            {/* DORSAIS EM "V" (LATS V-TAPER EXPANSION) */}
            <g
              onClick={() => handleMuscleClick('lats')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Dorsais (Lats)</title>
              {/* Grande Dorsal Esquerda com abertura curva acentuada */}
              <path
                d={`M38 48 C${28 - shoulderOffset} 60, ${30 - shoulderOffset} 73, ${43 + waistOffset} 85 C${49 + waistOffset} 86, 52 77, 54 65 C47 57, 41 53, 38 48 Z`}
                fill={getFillColor('lats')}
                fillOpacity={getOpacity('lats')}
                stroke={getStrokeColor('lats')}
                strokeWidth="1.2"
              />
              {/* Grande Dorsal Direita */}
              <path
                d={`M82 48 C${92 + shoulderOffset} 60, ${90 + shoulderOffset} 73, ${77 - waistOffset} 85 C${71 - waistOffset} 86, 68 77, 66 65 C73 57, 79 53, 82 48 Z`}
                fill={getFillColor('lats')}
                fillOpacity={getOpacity('lats')}
                stroke={getStrokeColor('lats')}
                strokeWidth="1.2"
              />
            </g>

            {/* TRICÍPITES EM HERRADURA */}
            <g
              onClick={() => handleMuscleClick('triceps')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Tricípites</title>
              {/* Tríceps Esquerdo */}
              <path
                d="M22 54 C18 63, 19 72, 23 78 C27 76, 28 68, 27 58 Z"
                fill={getFillColor('triceps')}
                fillOpacity={getOpacity('triceps')}
                stroke={getStrokeColor('triceps')}
                strokeWidth="1"
              />
              {/* Tríceps Direito */}
              <path
                d="M98 54 C102 63, 101 72, 97 78 C93 76, 92 68, 93 58 Z"
                fill={getFillColor('triceps')}
                fillOpacity={getOpacity('triceps')}
                stroke={getStrokeColor('triceps')}
                strokeWidth="1"
              />
            </g>

            {/* ANTEBRAÇOS POSTERIORES */}
            <g
              onClick={() => handleMuscleClick('forearms')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Antebraços</title>
              <path
                d="M22 80 C17 87, 17 98, 19 105 C22 105, 25 97, 26 85 Z
                   M98 80 C103 87, 103 98, 101 105 C98 105, 95 97, 94 85 Z"
                fill={getFillColor('forearms')}
                fillOpacity={getOpacity('forearms')}
                stroke={getStrokeColor('forearms')}
                strokeWidth="1"
              />
            </g>

            {/* LOMBAR (ERETORES DA ESPINHA) */}
            <g
              onClick={() => handleMuscleClick('lower_back')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Lombar</title>
              <path
                d="M52 70 C52 81, 51 89, 48 93 C53 96, 67 96, 72 93 C69 89, 68 81, 68 70 Z"
                fill={getFillColor('lower_back')}
                fillOpacity={getOpacity('lower_back')}
                stroke={getStrokeColor('lower_back')}
                strokeWidth="1"
              />
            </g>

            {/* GLÚTEOS POTENTES & DESENHADOS */}
            <g
              onClick={() => handleMuscleClick('glutes')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Glúteos</title>
              {/* Esquerdo */}
              <path
                d="M34 96 C29 101, 31 120, 44 129 C52 132, 58 125, 58 108 C52 101, 44 98, 34 96 Z"
                fill={getFillColor('glutes')}
                fillOpacity={getOpacity('glutes')}
                stroke={getStrokeColor('glutes')}
                strokeWidth="1.2"
              />
              {/* Direito */}
              <path
                d="M86 96 C91 101, 89 120, 76 129 C68 132, 62 125, 62 108 C68 101, 76 98, 86 96 Z"
                fill={getFillColor('glutes')}
                fillOpacity={getOpacity('glutes')}
                stroke={getStrokeColor('glutes')}
                strokeWidth="1.2"
              />
            </g>

            {/* ISQUIOTIBIAIS (POSTERIOR DE COXA) */}
            <g
              onClick={() => handleMuscleClick('hamstrings')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Isquiotibiais</title>
              {/* Esquerda */}
              <path
                d="M38 131 C36 142, 38 154, 43 159 C48 159, 52 155, 55 142 C55 134, 50 131, 38 131 Z"
                fill={getFillColor('hamstrings')}
                fillOpacity={getOpacity('hamstrings')}
                stroke={getStrokeColor('hamstrings')}
                strokeWidth="1"
              />
              {/* Direita */}
              <path
                d="M82 131 C84 142, 82 154, 77 159 C72 159, 68 155, 65 142 C65 134, 70 131, 82 131 Z"
                fill={getFillColor('hamstrings')}
                fillOpacity={getOpacity('hamstrings')}
                stroke={getStrokeColor('hamstrings')}
                strokeWidth="1"
              />
            </g>

            {/* GÉMEOS CORTADOS EM DIAMANTE (DIAMOND CALVES) */}
            <g
              onClick={() => handleMuscleClick('calves')}
              className={interactive ? 'cursor-pointer hover:filter hover:brightness-125' : ''}
              style={{ transition: 'all 0.2s ease' }}
            >
              <title>Gémeos (Panturrilhas em Diamante)</title>
              {/* Gastrocnémio Esquerdo com corte em diamante */}
              <path
                d="M40 164 C33 174, 34 188, 42 202 C46 202, 50 195, 51 180 C51 170, 48 164, 40 164 Z"
                fill={getFillColor('calves')}
                fillOpacity={getOpacity('calves')}
                stroke={getStrokeColor('calves')}
                strokeWidth="1.2"
              />
              {/* Gastrocnémio Direito */}
              <path
                d="M80 164 C87 174, 86 188, 78 202 C74 202, 70 195, 69 180 C69 170, 72 164, 80 164 Z"
                fill={getFillColor('calves')}
                fillOpacity={getOpacity('calves')}
                stroke={getStrokeColor('calves')}
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};
