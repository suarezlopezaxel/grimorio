import React, { useState } from 'react';
import { TacticalCard, CardCategory, ActionType } from '../types';
import { STANDARD_5E_ACTIONS } from '../data/defaultData';

interface GrimoireCardsViewProps {
  cards: TacticalCard[];
  onAddCard: (card: TacticalCard) => void;
  onDeleteCard: (cardId: string) => void;
  onRollDice: (label: string, modifier: number, subtext?: string) => void;
}

export const GrimoireCardsView: React.FC<GrimoireCardsViewProps> = ({
  cards,
  onAddCard,
  onDeleteCard,
  onRollDice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHomebrewModalOpen, setIsHomebrewModalOpen] = useState(false);
  const [expandedStandardActions, setExpandedStandardActions] = useState(false);

  // New card form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CardCategory>('attack');
  const [newTypeBadge, setNewTypeBadge] = useState('Arma / Dote Especial');
  const [newActionType, setNewActionType] = useState<ActionType>('Acción');
  const [newReach, setNewReach] = useState('5 ft (C/C)');
  const [newBonus, setNewBonus] = useState('+5');
  const [newDamage, setNewDamage] = useState('1d8 + 3');
  const [newDesc, setNewDesc] = useState('');
  const [newRollFormula, setNewRollFormula] = useState('1d20+5');

  // Filtered cards
  const filteredCards = cards.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.typeBadge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateHomebrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: TacticalCard = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      typeBadge: newTypeBadge,
      actionType: newActionType,
      reach: newReach,
      hitBonusOrDc: newBonus,
      targetOrArea: '1 Criatura / Área',
      primaryDamageOrEffect: newDamage,
      description: newDesc || 'Efecto personalizado creado por el escriba.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      rollFormula: newRollFormula,
      resourceDesc: 'Uso personal',
    };

    onAddCard(created);
    setIsHomebrewModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
  };

  const categories: { id: CardCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'Todas', icon: 'auto_stories' },
    { id: 'attack', label: 'Ataques', icon: 'swords' },
    { id: 'spell', label: 'Conjuros', icon: 'auto_awesome' },
    { id: 'skill', label: 'Habilidades', icon: 'psychology' },
    { id: 'item', label: 'Objetos', icon: 'inventory_2' },
    { id: 'reaction', label: 'Reacciones', icon: 'shield_with_heart' },
    { id: 'standard', label: 'Estándar 5e', icon: 'rule' },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-garamond text-2xl lg:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-2xl">
              style
            </span>
            <span>Grimorio de Tarjetas Tácticas</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Acciones, conjuros y dotes de combate ordenadas para consulta y despliegue rápido
          </p>
        </div>

        <button
          onClick={() => setIsHomebrewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs hover:brightness-110 shadow-md transition-all self-start md:self-auto cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>+ Crear Tarjeta Homebrew</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6 bg-[#1c1a24] p-3 rounded-xl border border-white/5 shadow-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? cards.length
                : cards.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[var(--theme-secondary-container,#571bc1)] text-[var(--theme-on-secondary-container,#ffffff)] font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nombre o efecto..."
            className="w-full bg-[#0f0d16] text-xs text-gray-200 pl-8 pr-3 py-2 rounded-lg border border-white/5 focus:outline-none focus:border-[var(--theme-primary,#fbbf24)]/50 transition-colors"
          />
        </div>
      </div>

      {/* Standard 5e Actions Banner if active */}
      {(selectedCategory === 'all' || selectedCategory === 'standard') && (
        <div className="mb-6 bg-[#1c1a24] rounded-xl border border-white/5 p-4 shadow-lg">
          <div
            onClick={() => setExpandedStandardActions(!expandedStandardActions)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-lg">
                military_tech
              </span>
              <span className="font-garamond text-base text-white font-bold">
                Maniobras Reglamentarias 5ª Edición (8 en 1)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {expandedStandardActions ? 'Ocultar maniobras' : 'Desplegar las 8 maniobras'}
              </span>
              <span className="material-symbols-outlined text-gray-400 text-sm">
                {expandedStandardActions ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </div>

          {expandedStandardActions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5">
              {STANDARD_5E_ACTIONS.map((action) => (
                <div
                  key={action.name}
                  className="p-3 rounded-lg bg-[#0f0d16] border border-white/5 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ color: action.color }}
                    >
                      {action.icon}
                    </span>
                    <span className="font-runic text-xs font-bold text-white">
                      {action.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid of Tactical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCards.map((card) => {
          const isAttack = card.category === 'attack';
          const isSpell = card.category === 'spell';
          const isReaction = card.category === 'reaction';
          const isItem = card.category === 'item';

          return (
            <div
              key={card.id}
              className="bg-[#1c1a24] rounded-xl overflow-hidden border border-white/5 shadow-xl flex flex-col card-arcane-glow group"
            >
              {/* Card Illustration Banner */}
              <div className="relative h-32 w-full overflow-hidden bg-gradient-to-t from-[#1c1a24] to-black">
                <img
                  src={card.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'}
                  alt={card.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a24] via-[#1c1a24]/40 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-runic font-bold uppercase tracking-wider shadow-sm border border-black/20 ${
                      isAttack
                        ? 'bg-[var(--theme-primary,#fbbf24)] text-[#261a00]'
                        : isSpell
                        ? 'bg-[var(--theme-secondary-container,#571bc1)] text-[var(--theme-on-secondary-container,#e9ddff)]'
                        : isReaction
                        ? 'bg-red-500 text-white'
                        : isItem
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {card.category.toUpperCase()}
                  </span>

                  <span className="bg-[#0f0d16]/80 backdrop-blur-xs text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
                    {card.actionType}
                  </span>
                </div>

                {/* Card Title & Type Over Gradient */}
                <div className="absolute bottom-2 left-3 right-3">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {card.typeBadge}
                  </span>
                  <h3 className="font-garamond text-xl font-bold text-white leading-tight">
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Card Body Specs Grid */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                {/* Tactical Stats Pill Row */}
                <div className="grid grid-cols-3 gap-1.5 text-center bg-[#0f0d16] p-2 rounded-lg border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-runic text-gray-500 uppercase">Alcance</span>
                    <span className="text-xs text-gray-200 font-bold truncate">{card.reach}</span>
                  </div>
                  <div className="flex flex-col border-x border-white/5">
                    <span className="text-[9px] font-runic text-gray-500 uppercase">Tirada / CD</span>
                    <span className="text-xs text-[var(--theme-primary,#fbbf24)] font-bold">
                      {card.hitBonusOrDc}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-runic text-gray-500 uppercase">Objetivo</span>
                    <span className="text-xs text-gray-200 font-bold truncate">
                      {card.targetOrArea}
                    </span>
                  </div>
                </div>

                {/* Primary Damage / Effect Banner */}
                <div className="flex items-center justify-between bg-[#211e28] px-3 py-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">Efecto / Daño:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-garamond text-base font-bold text-white">
                      {card.primaryDamageOrEffect}
                    </span>
                    {card.secondaryEffect && (
                      <span className="text-[10px] text-[var(--theme-secondary,#d0bcff)] font-semibold">
                        ({card.secondaryEffect})
                      </span>
                    )}
                  </div>
                </div>

                {/* Trigger if Reaction */}
                {card.trigger && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/20 text-xs text-red-300">
                    <strong>Gatillo:</strong> {card.trigger}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  {card.description}
                </p>

                {/* Resource Info */}
                {card.resourceDesc && (
                  <div className="text-[11px] text-gray-400 font-mono pt-2 border-t border-white/5 flex items-center justify-between">
                    <span>{card.resourceDesc}</span>
                    {card.resourceMax && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: card.resourceMax }).map((_, rIdx) => {
                          const isUsed = rIdx < (card.resourceUsed || 0);
                          return (
                            <span
                              key={rIdx}
                              className={`w-2.5 h-2.5 rounded-full ${
                                !isUsed
                                  ? 'bg-[var(--theme-primary,#fbbf24)] shadow-xs'
                                  : 'bg-[#2b2932]'
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions: Roll & Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                  <button
                    onClick={() => onDeleteCard(card.id)}
                    className="text-xs text-red-400 hover:text-red-300 p-1 flex items-center gap-1"
                    title={`Eliminar tarjeta ${card.title}`}
                    aria-label={`Eliminar tarjeta ${card.title}`}
                  >
                    <span className="material-symbols-outlined text-xs">delete</span>
                    <span>Borrar</span>
                  </button>

                  <button
                    onClick={() => {
                      const mod = parseInt(card.hitBonusOrDc.replace('+', ''), 10) || 0;
                      onRollDice(
                        card.title,
                        mod,
                        `Efecto: ${card.primaryDamageOrEffect}`
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-secondary-container,#571bc1)] hover:bg-[var(--theme-secondary,#d0bcff)] text-white hover:text-black font-semibold text-xs transition-all shadow-sm ml-auto"
                  >
                    <span className="material-symbols-outlined text-sm">casino</span>
                    <span>Tirar / Desplegar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Crear Tarjeta Homebrew */}
      {isHomebrewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1c1a24] border border-[#36333e] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[var(--theme-primary,#fbbf24)]">
                  auto_fix_high
                </span>
                <h3 className="font-garamond text-xl font-bold text-white">
                  Crear Tarjeta Táctica Homebrew
                </h3>
              </div>
              <button
                onClick={() => setIsHomebrewModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateHomebrew} className="space-y-3">
              <div>
                <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                  Título de la Acción o Conjuro
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Filo Umbrío de Selûne"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0f0d16] text-sm text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[var(--theme-primary,#fbbf24)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CardCategory)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  >
                    <option value="attack">Ataque</option>
                    <option value="spell">Conjuro</option>
                    <option value="skill">Habilidad</option>
                    <option value="item">Objeto</option>
                    <option value="reaction">Reacción</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Tipo de Acción
                  </label>
                  <select
                    value={newActionType}
                    onChange={(e) => setNewActionType(e.target.value as ActionType)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  >
                    <option value="Acción">Acción (1 Acción)</option>
                    <option value="Acción Adicional">Acción Adicional (Bonus)</option>
                    <option value="Reacción">Reacción</option>
                    <option value="Movimiento">Movimiento Especial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Etiqueta de Tipo
                  </label>
                  <input
                    type="text"
                    value={newTypeBadge}
                    onChange={(e) => setNewTypeBadge(e.target.value)}
                    placeholder="ej. Evocación • Nivel 2"
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Alcance
                  </label>
                  <input
                    type="text"
                    value={newReach}
                    onChange={(e) => setNewReach(e.target.value)}
                    placeholder="ej. 60 ft o Cuerpo a Cuerpo"
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Bonificador / CD
                  </label>
                  <input
                    type="text"
                    value={newBonus}
                    onChange={(e) => setNewBonus(e.target.value)}
                    placeholder="ej. +7 o CD 15 DES"
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Daño Primario / Efecto
                  </label>
                  <input
                    type="text"
                    value={newDamage}
                    onChange={(e) => setNewDamage(e.target.value)}
                    placeholder="ej. 2d8 Necrótico"
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                  Descripción Arcana
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalla cómo funciona la acción o qué requisitos especiales exige..."
                  className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsHomebrewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#211e28] text-gray-300 text-xs hover:bg-[#2b2932]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs hover:brightness-110 shadow-md"
                >
                  Engarzar al Grimorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
