# IRON ATLAS — Aplicação Completa de Treino de Ginásio & Hipertrofia

Uma aplicação web mobile-first de alto rendimento para gestão, planeamento e execução de treinos de musculação no ginásio. Inspirada nos pontos fortes das melhores ferramentas do mercado (Hevy, Strong, Fitbod), mas com identidade visual própria, diagrama muscular anatómico SVG interativo (frente e costas), temporizador de descanso automatizado com Web Audio API e persistência local via IndexedDB.

---

## ⚡ Tecnologias Utilizadas

- **Frontend Core**: React 19, TypeScript, Vite
- **Estilização**: Vanilla CSS com variáveis de design system moderno, paleta escura de ginásio de alto contraste e ergonomia tátil para uso com mãos suadas/luvas
- **Base de Dados Offline**: [Dexie.js](https://dexie.com/) (IndexedDB reativo com suporte a consultas multi-entry para músculos)
- **Áudio & Vibração**: Sintetizador programático via **Web Audio API** e **Vibration API** (sem dependência de ficheiros áudio externos)
- **Celebração de Conquistas**: `canvas-confetti` para novos PRs e treinos concluídos
- **Ícones**: `lucide-react`

---

## 🚀 Como Correr o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18+ recomendada)
- **NPM**

### Passos de Instalação e Execução

1. **Entrar no diretório do projeto**:
   ```bash
   cd "GYM APP"
   ```

2. **Instalar as dependências** (caso ainda não estejam instaladas):
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   > No Windows PowerShell, se as políticas de execução de scripts estiverem restritas, pode executar:
   > ```powershell
   > npm.cmd run dev
   > ```

4. **Abrir no Browser**:
   - Aceda a [http://localhost:5173/](http://localhost:5173/)
   - Para uma experiência autêntica de telemóvel, abra as Ferramentas de Desenvolvedor (F12) e ative o modo responsivo móvel (Ctrl+Shift+M).

5. **Gerar Build de Produção**:
   ```bash
   npm run build
   ```

---

## 🏋️‍♂️ Funcionalidades Principais Implementadas

### 1. Diagrama Anatómico SVG — Reformulação Visual Completa (V-Taper)
- **Estética Musculada V-Taper de Alta Fidelidade**:
  - Ombros largos com deltoides destacados e peitoral quadrado demarcado.
  - Cintura estreita e oblíquos definidos em V-Line (sem aspeto oval ou pesado).
  - Costas em "V" realçando a curvatura da grande dorsal (lats) e trapézio em diamante.
  - Braços esculpidos com separação nítida entre bíceps/tríceps e antebraços.
  - Pernas atléticas com quadríceps volumosos e gémeos cortados em diamante (*Diamond Calves*).
- **Interatividade & Cores de Alta Saturação**:
  - `primary`: Realce dinâmico em tom de alta intensidade (Âmbar/Azul/Esmeralda).
  - `secondary`: Realce translúcido a 65% de opacidade.
  - `neutral/idle`: Tom cinzento escuro mate profundo (`#18181B`) perfeitamente integrado no tema escuro.
  - Alinhamento de escala e grelha idênticos para as vistas Frontal e Dorsal.

### 2. Onboarding & Motor Inteligente de Treinos Personalizados
- **Entrada de Dados Biométricos**: Altura (cm), Peso Corporal (kg), Silhueta de preferência (Masculina, Feminina ou Neutra).
- **Calibração por Objetivo & Nível**:
  - **Força Máxima**: 4 a 6 reps, 4 séries, descansos de 150s.
  - **Hipertrofia Muscular**: 8 a 12 reps, 3-4 séries, descansos de 90s.
  - **Definição / Perda de Gordura**: 10 a 15 reps, 3 séries, descansos de 60s.
  - **Resistência Muscular**: 15 a 20 reps, descansos de 60s.
- **Divisões de Treino Automatizadas**:
  - 3 dias: **Full Body 3x (A / B / C)** focado em compostos pesados.
  - 4 dias: **Upper / Lower 4x** (divisão padrão-ouro para síntese proteica).
  - 5 a 6 dias: **PPL Pro** ou **Arnold Split Clássico** (Peito/Costas, Ombros/Braços, Pernas).
- **Ação com 1 Clique**: *"Aplicar Plano Recomendado"*, gravando no IndexedDB com dias, exercícios e séries já estruturados.

### 3. Ecrã de Treino Ativo & Ergonomia de Ginásio (Touch >= 44px)
- **Hitboxes Amplas**: Touch targets mínimas de 44px (`min-h-[44px]`, `w-11 h-11`) desenhadas para mãos suadas ou uso com luvas.
- **Teclados Otimizados**: `inputMode="decimal"` e `inputMode="numeric"` para entrada rápida de carga e repetições em smartphones.
- **Histórico Imediato (Linha de Referência)**: Mostra no fundo da célula a carga e reps da última sessão para garantir **Sobrecarga Progressiva**.
- **Cálculo de 1RM com Fórmula de Brzycki**: $\text{1RM} = \text{Peso} \times \frac{36}{37 - \text{Reps}}$.
- **Temporizador de Descanso Automático**: Contagem regressiva, botões +15s/-15s, alerta sonoro sintetizado via Web Audio API e vibração tátil.

### 4. Dashboard & Heatmap Muscular Semanal
- **Streak de Dias**: Contador de consistência de treinos.
- **Próximo Treino Inteligente**: Sugere automaticamente o próximo dia da rotina ativa.
- **Volume Semanal**: Comparação percentual do volume acumulado face à semana anterior.
- **Heatmap Muscular Semanal**: Analisa séries diretas e indiretas dos últimos 7 dias e diagnostica músculos com baixo estímulo para evitar desequilíbrios posturais.

### 5. Progresso & Gráficos
- **Gráfico de 1RM Estimada ao Longo do Tempo**: Calculado pela fórmula de Epley para qualquer exercício do catálogo.
- **Rastreador de Peso Corporal & Medidas**: Registo de peso, cintura, braço e percentagem de gordura com gráfico de linha SVG interativo e histórico.

### 6. Modelo Multi-Utilizador & Cópia de Segurança
- Todas as entidades incluem `userId` para integração futura com backends na nuvem (PostgreSQL, Supabase ou Firebase).
- Ferramenta de **Exportação (Backup JSON)** e **Restauração de Dados** nas Definições.

---

## 🗄️ Estrutura do Modelo de Dados (Schemas)

```ts
// 1. Utilizador & Preferências
interface UserProfile {
  id: string; // 'default-user'
  name: string;
  avatarSilhouette: 'male' | 'female' | 'neutral';
  unitSystem: 'kg' | 'lbs';
  goal: 'hypertrophy' | 'strength' | 'endurance' | 'general_fitness' | 'weight_loss';
  defaultRestSeconds: number;
  theme: 'dark' | 'light';
}

// 2. Exercício Anatómico
interface Exercise {
  id: string;
  name: string;
  namePt: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  movementType: 'compound' | 'isolation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructionsPt?: string;
  tips?: string[];
  userId?: string;
}

// 3. Planos & Rotinas
interface WorkoutRoutine {
  id: string;
  userId: string;
  title: string;
  description: string;
  days: RoutineDay[];
  isTemplate?: boolean;
}

// 4. Sessão de Treino & Séries
interface WorkoutSession {
  id: string;
  userId: string;
  routineId?: string;
  routineDayId?: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  exercises: WorkoutExerciseLog[];
  prsAchieved?: PersonalRecord[];
}
```

---

## 📂 Organização das Pastas do Projeto

```
src/
├── types/             # Tipos TypeScript estritos para todas as entidades
├── db/                # Configuração Dexie IndexedDB e seeds completos
├── context/           # Estado do treino ativo e preferências de utilizador
├── utils/             # Fórmulas de 1RM, sintetizador de áudio e backup JSON
├── components/
│   ├── anatomy/       # Diagrama muscular anatómico SVG (frente e costas)
│   ├── workout/       # Ecrã de treino ativo, temporizador e séries táteis
│   ├── routines/      # Visualizador e editor de planos de treino
│   ├── exercises/     # Catálogo e modal detalhado de exercícios
│   ├── history/       # Histórico cronológico e expansão de séries
│   ├── analytics/     # Gráficos de 1RM, mapa de fadiga semanal e peso
│   ├── dashboard/     # Ecrã inicial com resumo e streak
│   ├── settings/      # Definições, avatar, tema e exportação/importação
│   └── common/        # Barra de navegação inferior mobile-first
├── App.tsx            # Ponto de montagem e roteamento principal
└── index.css          # Design system Vanilla CSS e estilos táteis
```
