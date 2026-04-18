import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, RotateCcw, Flame, Music, Music2, ShieldAlert, Edit2, Plus, Trash2, Check } from 'lucide-react';
import { Cylinder, Background } from '@/src/components/GameComponents';
import { ACTIONS, BODY_PARTS_PG13, BODY_PARTS_SPICY, WILD_CARDS } from '@/src/constants';
import { cn } from '@/src/lib/utils';

type GameState = 'idle' | 'spinning' | 'revealed';
type Gender = 'man' | 'woman';

const SASSY_LINES = {
  man: [
    "Alright big boy, show her what you've got.",
    "Your turn to be the master of ceremonies.",
    "Don't hold back, she's waiting...",
    "Time to see if you can handle the heat.",
    "The floor is yours, make it count."
  ],
  woman: [
    "Your turn to take control, goddess.",
    "Show him who's really in charge here.",
    "Make him beg for more, darling.",
    "Time to unleash your inner temptress.",
    "He's at your mercy... what's your move?"
  ]
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [isSpicy, setIsSpicy] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [vetoCount, setVetoCount] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<Gender>('man');
  const [sassyLine, setSassyLine] = useState("");

  // Session-based lists
  const [actionsList, setActionsList] = useState(ACTIONS);
  const [bodyPartsPG13, setBodyPartsPG13] = useState(BODY_PARTS_PG13);
  const [bodyPartsSpicy, setBodyPartsSpicy] = useState(BODY_PARTS_SPICY);
  const [wildCardsList, setWildCardsList] = useState(WILD_CARDS);

  useEffect(() => {
    const lines = SASSY_LINES[currentTurn];
    setSassyLine(lines[Math.floor(Math.random() * lines.length)]);
  }, [currentTurn]);
  
  // Lock in the lists used for the current spin to prevent mismatches if settings change mid-spin
  const [currentLists, setCurrentLists] = useState({
    actions: actionsList,
    bodyParts: bodyPartsPG13,
    wildCards: wildCardsList
  });

  const [selections, setSelections] = useState<{
    actionIndex: number | null;
    bodyPartIndex: number | null;
    wildCardIndex: number | null;
  }>({
    actionIndex: null,
    bodyPartIndex: null,
    wildCardIndex: null,
  });

  const getFilteredBodyParts = useCallback((gender: Gender, spicy: boolean) => {
    let base = spicy ? bodyPartsSpicy : bodyPartsPG13;
    if (gender === 'man') {
      // Man is spinning, target is woman (usually)
      return base.filter(part => part !== "Testicles" && part !== "Penis");
    } else {
      // Woman is spinning, target is man (usually)
      return base.filter(part => part !== "Clitoris");
    }
  }, [bodyPartsSpicy, bodyPartsPG13]);

  const bodyParts = getFilteredBodyParts(currentTurn, isSpicy);

  const ignite = useCallback(() => {
    if (gameState === 'spinning') return;

    // Lock in the current lists based on settings at the moment of ignition
    const activeActions = actionsList;
    const activeBodyParts = getFilteredBodyParts(currentTurn, isSpicy);
    const activeWildCards = wildCardsList;

    if (activeActions.length === 0 || activeBodyParts.length === 0 || activeWildCards.length === 0) {
      alert("Please ensure your lists have at least one item!");
      return;
    }
    
    setCurrentLists({
      actions: activeActions,
      bodyParts: activeBodyParts,
      wildCards: activeWildCards
    });

    setGameState('spinning');
    setSelections({ actionIndex: null, bodyPartIndex: null, wildCardIndex: null });

    // Haptic feedback (simulated for browser)
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10, 50, 10]);
    }

    const finalActionIndex = Math.floor(Math.random() * activeActions.length);
    const finalBodyPartIndex = Math.floor(Math.random() * activeBodyParts.length);
    let finalWildCardIndex = Math.floor(Math.random() * activeWildCards.length);

    // Rule: Don't allow Passionately Kiss + Using Only Lips (redundant)
    if (activeActions[finalActionIndex] === "Passionately Kiss" && activeWildCards[finalWildCardIndex] === "Using Only Lips") {
      // Re-roll the wildcard until it's different (at least that's one way, or just find another index)
      // Since we know the list has multiple items, we can just pick another one
      const otherIndices = Array.from({ length: activeWildCards.length }, (_, i) => i)
        .filter(i => activeWildCards[i] !== "Using Only Lips");
      if (otherIndices.length > 0) {
        finalWildCardIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)];
      }
    }

    // Sequential stopping
    setTimeout(() => {
      setSelections(prev => ({ ...prev, actionIndex: finalActionIndex }));
    }, 2000);

    setTimeout(() => {
      setSelections(prev => ({ ...prev, bodyPartIndex: finalBodyPartIndex }));
    }, 4000);

    setTimeout(() => {
      setSelections(prev => ({ ...prev, wildCardIndex: finalWildCardIndex }));
      // Add a small delay after the last cylinder stops before showing the popup
      setTimeout(() => {
        setGameState('revealed');
      }, 800);
    }, 6000);
  }, [gameState, isSpicy, currentTurn, getFilteredBodyParts]);

  const useVeto = () => {
    if (vetoCount > 0 && gameState === 'revealed') {
      setVetoCount(prev => prev - 1);
      ignite();
    }
  };

  const reset = () => {
    setGameState('idle');
    setSelections({ actionIndex: null, bodyPartIndex: null, wildCardIndex: null });
    setCurrentTurn(prev => prev === 'man' ? 'woman' : 'man');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between py-8 px-4 overflow-hidden">
      <Background />
      
      {/* Ambient Audio */}
      {isMusicOn && (
        <audio 
          autoPlay 
          loop 
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" 
          className="hidden"
        />
      )}

      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between z-50">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-velvet/20 border border-rose/20 text-rose hover:bg-velvet/40 transition-colors"
        >
          <Settings size={20} />
        </button>

        <h1 className="text-3xl font-script text-rose text-glow-rose tracking-wider">
          Sinister Spins
        </h1>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-velvet/20 border border-rose/20">
          <span className="text-[10px] uppercase tracking-widest text-rose/60">Veto</span>
          <span className="text-sm font-serif text-rose">{vetoCount}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-6 z-40">
        <div className="text-center px-4 space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTurn}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[10px] uppercase tracking-[0.5em] text-rose/60 font-sans">
                {currentTurn === 'man' ? "His Turn" : "Her Turn"}
              </span>
              <p className="text-rose italic font-serif text-lg tracking-wide">
                "{sassyLine}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full grid grid-cols-3 gap-2 px-2">
          <Cylinder 
            items={gameState === 'idle' ? ACTIONS : currentLists.actions} 
            selectedIndex={selections.actionIndex} 
            isSpinning={gameState === 'spinning' && selections.actionIndex === null} 
            className="rounded-l-2xl border-l border-rose/20"
          />
          <Cylinder 
            items={gameState === 'idle' ? bodyParts : currentLists.bodyParts} 
            selectedIndex={selections.bodyPartIndex} 
            isSpinning={gameState === 'spinning' && selections.bodyPartIndex === null} 
            delay={0.2}
          />
          <Cylinder 
            items={gameState === 'idle' ? WILD_CARDS : currentLists.wildCards} 
            selectedIndex={selections.wildCardIndex} 
            isSpinning={gameState === 'spinning' && selections.wildCardIndex === null} 
            delay={0.4}
            className="rounded-r-2xl border-r border-rose/20"
          />
        </div>

        <div className="h-32 flex flex-col items-center justify-center gap-4">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <>
                <motion.button
                  key="ignite"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  onClick={ignite}
                  className="group relative px-8 py-4 rounded-full bg-velvet border-2 border-rose text-rose font-serif text-xl tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 border-glow-rose"
                >
                  <div className="absolute inset-0 bg-rose/10 group-hover:bg-rose/20 transition-colors" />
                  <span className="relative z-10 flex items-center gap-3">
                    IGNITE THE FLAME
                    <Flame size={20} className="animate-pulse" />
                  </span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEditor(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose/30 bg-rose/5 text-rose/80 hover:bg-rose/10 hover:text-rose hover:border-rose/50 transition-all text-xs uppercase tracking-[0.2em]"
                >
                  <Edit2 size={12} />
                  Edit Desires
                </motion.button>
              </>
            )}

            {gameState === 'spinning' && (
              <motion.div
                key="spinning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 rounded-full bg-rose"
                    />
                  ))}
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-rose/60">Destiny is calling...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reveal Card Overlay */}
      <AnimatePresence>
        {gameState === 'revealed' && selections.actionIndex !== null && selections.bodyPartIndex !== null && selections.wildCardIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-midnight/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm p-8 rounded-3xl bg-velvet border-2 border-rose border-glow-rose flex flex-col items-center text-center gap-8"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.4em] text-rose/60">Your Command</span>
                <h2 className="text-3xl font-serif text-cream leading-relaxed">
                  <span className="text-rose italic">{currentLists.actions[selections.actionIndex]}</span> your partner's <span className="text-rose italic">{currentLists.bodyParts[selections.bodyPartIndex]}</span>... <span className="text-rose italic">{currentLists.wildCards[selections.wildCardIndex]}</span>.
                </h2>
              </div>

              <div className="w-full flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 py-4 rounded-xl bg-rose text-velvet font-serif font-bold tracking-widest hover:bg-cream transition-colors"
                >
                  DONE
                </button>
                <button
                  onClick={useVeto}
                  disabled={vetoCount === 0}
                  className={cn(
                    "flex-1 py-4 rounded-xl border border-rose/40 text-rose font-serif tracking-widest flex items-center justify-center gap-2 transition-all",
                    vetoCount > 0 ? "hover:bg-rose/10" : "opacity-30 cursor-not-allowed"
                  )}
                >
                  <RotateCcw size={16} />
                  REROLL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg max-h-[85vh] p-6 rounded-3xl bg-velvet border border-rose/20 flex flex-col gap-6 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-rose">Refine the Experience</h3>
                  <p className="text-xs text-rose/40 uppercase tracking-widest mt-1">Customize the rotations</p>
                </div>
                <button onClick={() => setShowEditor(false)} className="p-2 text-rose/60 hover:text-rose">
                  <Check size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                {/* Actions Editor */}
                <EditorSection 
                  title="Actions" 
                  items={actionsList} 
                  setItems={setActionsList} 
                />
                
                {/* Body Parts Editor (Basic + Spicy) */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-rose/60 border-b border-rose/10 pb-2">Body Parts</h4>
                  <p className="text-[10px] text-rose/40 italic">Note: Updates both standard and spicy lists.</p>
                  <EditorSection 
                    title="Essential" 
                    items={bodyPartsPG13} 
                    setItems={(newItems) => {
                      setBodyPartsPG13(newItems);
                      // Sync Spicy with new essential items
                      const spicyParts = bodyPartsSpicy.filter(p => !BODY_PARTS_PG13.includes(p));
                      setBodyPartsSpicy([...newItems, ...spicyParts]);
                    }} 
                    hideTitle
                  />
                  <div className="h-px bg-rose/5" />
                  <EditorSection 
                    title="Spicy Additions" 
                    items={bodyPartsSpicy.filter(p => !bodyPartsPG13.includes(p))} 
                    setItems={(newSpicyAdditions) => {
                      setBodyPartsSpicy([...bodyPartsPG13, ...newSpicyAdditions]);
                    }} 
                  />
                </div>

                {/* Wild Cards Editor */}
                <EditorSection 
                  title="Wild Cards" 
                  items={wildCardsList} 
                  setItems={setWildCardsList} 
                />
              </div>

              <button 
                onClick={() => {
                  setActionsList(ACTIONS);
                  setBodyPartsPG13(BODY_PARTS_PG13);
                  setBodyPartsSpicy(BODY_PARTS_SPICY);
                  setWildCardsList(WILD_CARDS);
                }}
                className="text-xs text-rose/40 hover:text-rose transition-colors underline underline-offset-4"
              >
                Reset to originals
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-midnight/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="w-full max-w-xs p-8 rounded-3xl bg-velvet/40 border border-rose/20 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif text-rose">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-rose/60 hover:text-rose">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMusicOn ? <Music size={20} className="text-rose" /> : <Music2 size={20} className="text-rose/40" />}
                    <span className="text-sm tracking-wide">Ambient Audio</span>
                  </div>
                  <button 
                    onClick={() => setIsMusicOn(!isMusicOn)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      isMusicOn ? "bg-rose" : "bg-velvet/60"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-midnight transition-all",
                      isMusicOn ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={20} className={cn(isSpicy ? "text-rose" : "text-rose/40")} />
                    <span className="text-sm tracking-wide">Spicy Mode</span>
                  </div>
                  <button 
                    onClick={() => setIsSpicy(!isSpicy)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      isSpicy ? "bg-rose" : "bg-velvet/60"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-midnight transition-all",
                      isSpicy ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-center text-rose/40 uppercase tracking-widest leading-relaxed">
                Experience designed for consenting adults.<br />Play responsibly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Instructions */}
      <footer className="w-full max-w-md text-center z-40">
        <p className="text-[10px] uppercase tracking-[0.3em] text-rose/40">
          Tap the flame to begin your journey
        </p>
      </footer>
    </div>
  );
}

// Sub-components for Editor
interface EditorSectionProps {
  title: string;
  items: string[];
  setItems: (items: string[]) => void;
  hideTitle?: boolean;
}

function EditorSection({ title, items, setItems, hideTitle }: EditorSectionProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {!hideTitle && (
        <h4 className="text-xs uppercase tracking-widest text-rose/60 border-b border-rose/10 pb-2">{title}</h4>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose/5 border border-rose/10 text-cream/70 text-sm"
          >
            {item}
            <button 
              onClick={() => removeItem(index)}
              className="text-rose/40 hover:text-rose transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 bg-midnight/40 border border-rose/20 rounded-xl px-4 py-2 text-sm text-cream placeholder:text-rose/20 focus:outline-none focus:border-rose/40"
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button 
          onClick={addItem}
          className="p-2 rounded-xl bg-rose/20 text-rose hover:bg-rose/30 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
