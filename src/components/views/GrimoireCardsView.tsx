import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Edit,
  Dices,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { CharacterSheet, GrimoireCard } from '../../types/character';
import { HomebrewCardModal } from '../modals/HomebrewCardModal';
import { ClassWidgetFrame } from '../fx/ClassWidgetFrame';
import { ClassSubCard } from '../fx/ClassSubCard';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onOpenDiceTray: (formula?: string) => void;
}

export const GrimoireCardsView: React.FC<Props> = ({ character, onUpdate, onOpenDiceTray }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHomebrewModalOpen, setIsHomebrewModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GrimoireCard | null>(null);
  const [standardExpanded, setStandardExpanded] = useState(false);

  const categories = [
    { id: 'all', label: 'Todas', count: character.cards.length },
    { id: 'attack', label: 'Ataques', count: character.cards.filter((c) => c.category === 'attack').length },
    { id: 'spell', label: 'Conjuros', count: character.cards.filter((c) => c.category === 'spell').length },
    { id: 'skill', label: 'Habilidades', count: character.cards.filter((c) => c.category === 'skill').length },
    { id: 'item', label: 'Objetos', count: character.cards.filter((c) => c.category === 'item').length },
    { id: 'reaction', label: 'Reacciones', count: character.cards.filter((c) => c.category === 'reaction').length },
    { id: 'standard', label: 'Estándar 5e', count: 1 },
  ];

  const filteredCards = character.cards.filter((card) => {
    const matchesCat = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.effectOrDamage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveCard = (card: GrimoireCard) => {
    const existingIndex = character.cards.findIndex((c) => c.id === card.id);
    let updatedCards = [...character.cards];
    if (existingIndex >= 0) {
      updatedCards[existingIndex] = card;
    } else {
      updatedCards.unshift(card);
    }
    onUpdate({ ...character, cards: updatedCards });
  };

  const handleDeleteCard = (id: string) => {
    onUpdate({
      ...character,
      cards: character.cards.filter((c) => c.id !== id),
    });
  };

  const togglePipUsage = (cardId: string, index: number) => {
    const updated = character.cards.map((card) => {
      if (card.id === cardId && card.usesMax) {
        const current = card.usesLeft ?? card.usesMax;
        const next = index < current ? index : index + 1;
        return { ...card, usesLeft: next };
      }
      return card;
    });
    onUpdate({ ...character, cards: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-emerald-400" />
            <span>Grimorio de Tarjetas Tácticas</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Acciones, conjuros y dotes de combate ordenadas para consulta y despliegue rápido
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCard(null);
            setIsHomebrewModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-stone-950 shadow-lg hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Tarjeta Homebrew</span>
        </button>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0e101c]/80 p-1.5 rounded-xl border border-zinc-800">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900/60 border border-purple-500/50 text-purple-200 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filtrar por nombre o efecto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-[#0e101c] pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Maniobras Reglamentarias 5ª Edición (Expandable 8 en 1) */}
      <ClassWidgetFrame classId={character.classId} className="p-0 overflow-hidden">
        <button
          onClick={() => setStandardExpanded(!standardExpanded)}
          className="w-full flex items-center justify-between p-3.5 text-left text-xs font-cinzel font-bold hover:bg-black/20 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Maniobras Reglamentarias 5ª Edición (8 en 1)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] opacity-75">
            <span>{standardExpanded ? 'Ocultar maniobras' : 'Desplegar las 8 maniobras'}</span>
            {standardExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {standardExpanded && (
          <div className="p-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">🏃 Correr (Dash)</strong>
              <p className="text-[11px] opacity-75 mt-1">Ganas movimiento adicional igual a tu velocidad para el turno actual.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">🛡️ Esquivar (Dodge)</strong>
              <p className="text-[11px] opacity-75 mt-1">Ataques contra ti tienen desventaja si puedes ver al atacante, y ventaja en salvaciones de DES.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">💨 Destrabarse (Disengage)</strong>
              <p className="text-[11px] opacity-75 mt-1">Tu movimiento no provoca ataques de oportunidad durante el resto del turno.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">🤝 Ayudar (Help)</strong>
              <p className="text-[11px] opacity-75 mt-1">Otorgas ventaja a un aliado en su próxima prueba de habilidad o ataque contra un enemigo a 5 pies.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">🕶️ Esconderse (Hide)</strong>
              <p className="text-[11px] opacity-75 mt-1">Realizas una prueba de Destreza (Sigilo) para volverte no visto ni escuchado.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">⏳ Preparar (Ready)</strong>
              <p className="text-[11px] opacity-75 mt-1">Eliges un desencadenante y una acción para ejecutar usando tu reacción cuando ocurra.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">🤼 Agarrar (Grapple)</strong>
              <p className="text-[11px] opacity-75 mt-1">Prueba de Atletismo enfrentada a Atletismo/Acrobacias para reducir su velocidad a 0.</p>
            </ClassSubCard>
            <ClassSubCard classId={character.classId} className="p-2.5">
              <strong className="block font-cinzel">💥 Empujar (Shove)</strong>
              <p className="text-[11px] opacity-75 mt-1">Prueba de Atletismo enfrentada para derribar al objetivo o alejarlo 5 pies de ti.</p>
            </ClassSubCard>
          </div>
        )}
      </ClassWidgetFrame>

      {/* 4. Tactical Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          return (
            <ClassWidgetFrame
              key={card.id}
              classId={character.classId}
              className="relative flex flex-col justify-between p-4 shadow-xl transition-all duration-200 group"
            >
              <div>
                {/* Header row: Category Pill + Action Pill */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      card.category === 'attack'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : card.category === 'spell'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : card.category === 'skill'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : card.category === 'item'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {card.category}
                  </span>

                  <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                    {card.actionType}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-cinzel text-base font-bold text-zinc-100 group-hover:text-purple-200 transition">
                  {card.title}
                </h3>

                {/* Range / Attack / Target stats block */}
                <div className="my-2.5 grid grid-cols-3 gap-1 rounded-xl bg-zinc-950/60 p-2 text-center text-xs border border-zinc-900">
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase font-mono">Alcance</span>
                    <span className="font-semibold text-zinc-200 font-mono text-[11px] truncate block">{card.range}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase font-mono">Tirada / CD</span>
                    <span className="font-semibold text-emerald-400 font-mono text-[11px] truncate block">{card.attackOrDC}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase font-mono">Objetivo</span>
                    <span className="font-semibold text-zinc-200 font-mono text-[11px] truncate block">{card.target}</span>
                  </div>
                </div>

                {/* Effect / Damage Highlight */}
                <div className="my-2 rounded-lg bg-zinc-900/60 px-2.5 py-1.5 border border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-zinc-400 font-cinzel">Efecto / Daño:</span>
                  <span className="font-bold text-white font-mono">{card.effectOrDamage}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300/80 line-clamp-3 mb-3 leading-relaxed">
                  {card.description}
                </p>

                {/* Resource pips if applicable */}
                {card.usesMax && card.usesMax > 0 && (
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zinc-400">Usos disponibles:</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: card.usesMax }).map((_, i) => {
                        const isAvailable = i < (card.usesLeft ?? card.usesMax!);
                        return (
                          <button
                            key={i}
                            onClick={() => togglePipUsage(card.id, i)}
                            className={`h-3.5 w-3.5 rounded-full border transition cursor-pointer ${
                              isAvailable
                                ? 'bg-purple-500 border-purple-400 shadow-[0_0_6px_#a855f7]'
                                : 'bg-zinc-800 border-zinc-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setIsHomebrewModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-300 hover:bg-purple-950/30 transition cursor-pointer"
                    title="Editar tarjeta"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenDiceTray(card.effectOrDamage)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-md cursor-pointer"
                >
                  <Dices className="h-4 w-4" />
                  <span>Tirar daño / Desplegar</span>
                </button>
              </div>
            </ClassWidgetFrame>
          );
        })}
      </div>

      {/* Homebrew Card Creation Modal */}
      <HomebrewCardModal
        isOpen={isHomebrewModalOpen}
        onClose={() => setIsHomebrewModalOpen(false)}
        onSaveCard={handleSaveCard}
        cardToEdit={editingCard}
      />
    </div>
  );
};
