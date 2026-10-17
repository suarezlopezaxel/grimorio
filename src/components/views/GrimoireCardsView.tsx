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
  Star,
} from 'lucide-react';
import { CharacterSheet, GrimoireCard } from '../../types/character';
import { HomebrewCardModal } from '../modals/HomebrewCardModal';
import { SpellSlotModal } from '../modals/SpellSlotModal';
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
  const [isSpellSlotModalOpen, setIsSpellSlotModalOpen] = useState(false);
  const [activeCastingCard, setActiveCastingCard] = useState<GrimoireCard | null>(null);
  const [editingCard, setEditingCard] = useState<GrimoireCard | null>(null);
  const [standardExpanded, setStandardExpanded] = useState(false);

  const categories = [
    { id: 'all', label: 'Todas', count: character.cards.length },
    { id: 'attack', label: 'Ataques', count: character.cards.filter((c) => c.category === 'attack').length },
    { id: 'spell', label: 'Hechizos', count: character.cards.filter((c) => c.category === 'spell').length },
    { id: 'feat', label: 'Dotes', count: character.cards.filter((c) => c.category === 'feat' || c.category === 'skill').length },
    { id: 'item', label: 'Objetos', count: character.cards.filter((c) => c.category === 'item').length },
    { id: 'reaction', label: 'Reacciones', count: character.cards.filter((c) => c.category === 'reaction').length },
    { id: 'favorites', label: 'Favoritas', count: character.cards.filter((c) => c.favorite).length },
    { id: 'standard', label: 'Estándar 5e', count: 1 },
  ];

  const filteredCards = character.cards.filter((card) => {
    const matchesCat = selectedCategory === 'all'
      || (selectedCategory === 'favorites' && card.favorite)
      || (selectedCategory === 'feat' && (card.category === 'feat' || card.category === 'skill'))
      || card.category === selectedCategory;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCat;

    const title = ((card.name || card.title) ?? '').toLowerCase();
    const description = (card.description ?? '').toLowerCase();
    const effectOrDamage = (card.effectOrDamage ?? '').toLowerCase();
    const featCategory = (card.featCategory ?? '').toLowerCase();
    const featPrerequisite = (card.featPrerequisite ?? '').toLowerCase();

    const matchesSearch =
      title.includes(q) ||
      description.includes(q) ||
      effectOrDamage.includes(q) ||
      featCategory.includes(q) ||
      featPrerequisite.includes(q);

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

  const handleUpdateCard = (cardId: string, updates: Partial<GrimoireCard>) => {
    onUpdate({
      ...character,
      cards: character.cards.map((card) => card.id === cardId ? { ...card, ...updates } : card),
    });
  };

  const handleDeleteCard = (id: string) => {
    onUpdate({
      ...character,
      cards: character.cards.filter((c) => c.id !== id),
    });
  };

  const togglePipUsage = (cardId: string, index: number) => {
    const updated = character.cards.map((card) => {
      const usesMax = card.uses?.max ?? card.usesMax;
      if (card.id === cardId && usesMax) {
        const current = card.uses?.current ?? card.usesLeft ?? usesMax;
        const next = index < current ? index : index + 1;
        return {
          ...card,
          uses: card.uses ? { ...card.uses, current: next } : card.uses,
          usesLeft: next,
        };
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
            Acciones, hechizos y dotes de combate ordenadas para consulta y despliegue rápido
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
          const cardUsesMax = card.uses?.max ?? card.usesMax;
          const cardUsesLeft = card.uses?.current ?? card.usesLeft ?? cardUsesMax;
          const legacyCard = card as GrimoireCard & {
            reach?: string;
            hitBonusOrDc?: string;
            targetOrArea?: string;
            effectOrDamage?: string;
            trigger?: string;
            effect?: string;
          };
          const rangeText = typeof card.range === 'string'
            ? card.range
            : card.range
              ? `${card.range.normal} ft${card.range.long > card.range.normal ? ` / ${card.range.long} ft` : ''}`
              : legacyCard.reach;
          const areaText = card.area
            ? card.area.shape === 'none'
              ? ''
              : `${{ sphere: 'Esfera', cone: 'Cono', line: 'Línea', cube: 'Cubo', cylinder: 'Cilindro' }[card.area.shape]} ${card.area.size} ft`
            : legacyCard.targetOrArea;
          const componentLabels = card.components
            ? [
                card.components.V && 'Verbal',
                card.components.S && 'Somático',
                card.components.M && `Material${card.components.materialText ? ` (${card.components.materialText})` : ''}${card.components.materialCost ? `, ${card.components.materialCost} po` : ''}${card.components.consumed ? ', se consume' : ''}`,
              ].filter(Boolean).join(', ')
            : '';
          const damageDetails = (card.damage ?? [])
            .map((damage) => `${damage.dice}${damage.mod ? ` ${damage.mod > 0 ? '+' : ''}${damage.mod}` : ''} ${damage.type}`.trim())
            .join(' · ');
          const spellEffectDetails = (card.effects ?? [])
            .map((effect) => `${effect.dice} ${effect.type === 'healing' ? 'curación' : 'daño'}`)
            .join(' · ');
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
                        : card.category === 'skill' || card.category === 'feat'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : card.category === 'item'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {card.category === 'feat' || card.category === 'skill' ? 'Dote' : card.category}
                  </span>

                  <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                    {card.actionType}
                  </span>

                  {/* Edit de tarjeta se renderiza en el footer (abajo a la izquierda / orden con eliminar) */}
                </div>

                {/* Card Title */}
                <h3 className="font-cinzel text-base font-bold text-zinc-100 group-hover:text-purple-200 transition">
                  {card.name || card.title}
                </h3>

                {/* Complete category-specific reference details */}
                {card.category === 'feat' ? (
                  <div className="my-2 rounded-xl border border-zinc-900 bg-zinc-950/60 p-2 text-xs">
                    <p className="text-[10px] text-zinc-400">
                      Categoría: <span className="text-zinc-200">
                        {{ origin: 'Origen', general: 'General', fighting_style: 'Estilo de combate', epic_boon: 'Don épico' }[card.featRuleCategory || 'origin']}
                      </span>
                      {card.featCategory && <span> · {card.featCategory}</span>}
                    </p>
                    {card.featPrerequisite && (
                      <p className="mt-1 text-[10px] text-zinc-400">Requisito: {card.featPrerequisite}</p>
                    )}
                    <p className="mt-1 text-[10px] text-zinc-400">
                      {card.featMinimumLevel && card.featMinimumLevel > 1 ? `Nivel ${card.featMinimumLevel}+` : ''}
                      {card.featRequiredClass ? ` · ${card.featRequiredClass}` : ''}
                      {card.featRequiredAbility ? ` · ${card.featRequiredAbility} ${card.featRequiredAbilityScore ?? 13}+` : ''}
                      {card.featRepeatable ? ' · Repetible' : ''}
                    </p>
                    {(card.featAbilityIncreases || (card.featAbility ? [{
                      ability: card.featAbility,
                      amount: card.featModifier ?? 0,
                      maxScore: card.featRuleCategory === 'epic_boon' ? 30 : 20,
                    }] : [])).map((increase, index) => (
                      <p key={index} className="mt-1 font-mono text-[11px] text-emerald-300">
                        {increase.ability} {increase.amount > 0 ? '+' : ''}{increase.amount} (máx. {increase.maxScore})
                      </p>
                    ))}
                    {card.featAdditionalBenefits && (
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-200">{card.featAdditionalBenefits}</p>
                    )}
                    {card.featSkillProficiencies && card.featSkillProficiencies.length > 0 && (
                      <p className="mt-2 text-[10px] text-zinc-300">
                        Competencias: {card.featSkillProficiencies.join(', ')}
                      </p>
                    )}
                    {card.featExpertiseSkills && card.featExpertiseSkills.length > 0 && (
                      <p className="mt-1 text-[10px] text-zinc-300">
                        Pericia: {card.featExpertiseSkills.join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="my-2.5 space-y-1.5 rounded-xl border border-zinc-900 bg-zinc-950/60 p-2.5 text-xs">
                    {card.category === 'attack' && (
                      <>
                        {(card.attackType || card.baseWeapon) && (
                          <p><span className="text-zinc-400">Ataque:</span> <span className="text-zinc-100">{card.attackType || 'arma'}{card.baseWeapon ? ` · ${card.baseWeapon}` : ''}</span></p>
                        )}
                        {(card.ability || card.proficient !== undefined || card.attackBonus !== undefined || card.magicBonus) && (
                          <p><span className="text-zinc-400">Tirada:</span> <span className="text-emerald-300">{[card.ability, card.proficient ? 'competente' : '', card.attackBonus !== undefined ? `bono ${card.attackBonus >= 0 ? '+' : ''}${card.attackBonus}` : '', card.magicBonus ? `bono mágico ${card.magicBonus > 0 ? '+' : ''}${card.magicBonus}` : '', legacyCard.hitBonusOrDc].filter(Boolean).join(' · ')}</span></p>
                        )}
                        {damageDetails && <p><span className="text-zinc-400">Daño:</span> <span className="text-zinc-100">{damageDetails}</span></p>}
                        {card.versatileDamage && <p><span className="text-zinc-400">Versátil:</span> <span className="text-zinc-100">{card.versatileDamage}</span></p>}
                        {card.ammo && <p><span className="text-zinc-400">Munición:</span> <span className="text-zinc-100">{card.ammo.type} ({card.ammo.count})</span></p>}
                        {card.conditionalDamage?.map((entry, index) => (
                          <p key={index}><span className="text-zinc-400">{entry.text}:</span> <span className="text-zinc-100">{entry.dice}</span></p>
                        ))}
                      </>
                    )}

                    {card.category === 'spell' && (
                      <>
                        <p><span className="text-zinc-400">Conjuro:</span> <span className="text-zinc-100">{card.level === 0 ? 'Truco' : `Nivel ${card.level ?? 0}`}{card.school ? ` · ${card.school}` : ''}</span></p>
                        {(card.castingTime || card.duration) && (
                          <p><span className="text-zinc-400">Tiempo / duración:</span> <span className="text-zinc-100">{[card.castingTime, card.duration].filter(Boolean).join(' · ')}</span></p>
                        )}
                        {(card.resolution || legacyCard.hitBonusOrDc) && (
                          <p><span className="text-zinc-400">Resolución:</span> <span className="text-emerald-300">{card.resolution === 'save' ? `Salvación ${card.save?.ability ?? ''}${card.save?.onSuccess ? ` · ${card.save.onSuccess === 'half' ? 'mitad con éxito' : card.save.onSuccess === 'none' ? 'sin efecto con éxito' : 'efecto especial con éxito'}` : ''}` : card.resolution === 'attack' ? 'Ataque de conjuro' : 'Sin tirada'}{card.dcOrAttack !== undefined ? ` · CD/ataque ${card.dcOrAttack}` : ''}{legacyCard.hitBonusOrDc ? ` · ${legacyCard.hitBonusOrDc}` : ''}</span></p>
                        )}
                        {spellEffectDetails && <p><span className="text-zinc-400">Efecto:</span> <span className="text-zinc-100">{spellEffectDetails}</span></p>}
                        {card.higherLevels?.map((entry, index) => (
                          <p key={index}><span className="text-zinc-400">{entry.level ? `A niveles superiores (nivel ${entry.level}+):` : 'A niveles superiores:'}</span> <span className="text-zinc-100">{entry.dice}</span></p>
                        ))}
                        {card.cantripScaling?.map((entry, index) => (
                          <p key={index}><span className="text-zinc-400">Escalado (nivel {entry.level}+):</span> <span className="text-zinc-100">{entry.dice}</span></p>
                        ))}
                      </>
                    )}

                    {card.category === 'reaction' && (
                      <>
                        {legacyCard.trigger && <p className="whitespace-pre-wrap"><span className="text-zinc-400">Desencadenante:</span> <span className="text-zinc-100">{legacyCard.trigger}</span></p>}
                        {legacyCard.effect && <p className="whitespace-pre-wrap"><span className="text-zinc-400">Efecto:</span> <span className="text-zinc-100">{legacyCard.effect}</span></p>}
                      </>
                    )}

                    {card.category === 'item' && (
                      <>
                        {card.equipped !== undefined && <p><span className="text-zinc-400">Estado:</span> <span className="text-zinc-100">{card.equipped ? 'Equipado' : 'No equipado'}</span></p>}
                        {card.item && (
                          <>
                            <p><span className="text-zinc-400">Tipo:</span> <span className="text-zinc-100">{card.item.kind}{card.item.rarity ? ` · ${card.item.rarity}` : ''}</span></p>
                            <p><span className="text-zinc-400">Cantidad / peso / valor:</span> <span className="text-zinc-100">{card.item.quantity} · {card.item.weight} lb · {card.item.value || 'sin valor indicado'}</span></p>
                            {card.item.requiresAttunement && <p><span className="text-zinc-400">Sintonización:</span> <span className="text-zinc-100">{card.item.attuned ? 'Sintonizado' : 'Requerida, pendiente'}</span></p>}
                            {card.item.kind === 'armor' && <p><span className="text-zinc-400">Armadura:</span> <span className="text-zinc-100">CA {card.item.armorClass} · {card.item.armorCategory}{card.item.maxDexBonus != null ? ` · DES máx. +${card.item.maxDexBonus}` : ''}{card.item.strengthRequirement ? ` · FUE ${card.item.strengthRequirement}` : ''}{card.item.stealthDisadvantage ? ' · desventaja en Sigilo' : ''}</span></p>}
                            {card.item.kind === 'shield' && <p><span className="text-zinc-400">Escudo:</span> <span className="text-zinc-100">+{card.item.armorClass} CA</span></p>}
                            {card.item.kind === 'weapon' && <p><span className="text-zinc-400">Arma:</span> <span className="text-zinc-100">{card.item.weaponDamage || 'Daño no indicado'} {card.item.weaponDamageType || ''} · {card.item.weaponAbility || 'FUE'}{card.item.weaponProficient ? ' · competencia' : ''}{card.item.weaponRange ? ` · ${card.item.weaponRange}` : ''}</span></p>}
                            {Object.entries(card.item.effects?.abilityBonuses ?? {}).some(([, value]) => value) && (
                              <p><span className="text-zinc-400">Características:</span> <span className="text-zinc-100">{Object.entries(card.item.effects?.abilityBonuses ?? {}).filter(([, value]) => value).map(([ability, value]) => `${ability} ${Number(value) > 0 ? '+' : ''}${value}`).join(', ')}</span></p>
                            )}
                            {card.item.effects?.armorClassBonus ? <p><span className="text-zinc-400">CA adicional:</span> <span className="text-zinc-100">{card.item.effects.armorClassBonus > 0 ? '+' : ''}{card.item.effects.armorClassBonus}</span></p> : null}
                            {card.item.effects?.speedBonus ? <p><span className="text-zinc-400">Velocidad:</span> <span className="text-zinc-100">{card.item.effects.speedBonus > 0 ? '+' : ''}{card.item.effects.speedBonus} pies</span></p> : null}
                            {card.item.effects?.attackBonus ? <p><span className="text-zinc-400">Ataque:</span> <span className="text-zinc-100">{card.item.effects.attackBonus > 0 ? '+' : ''}{card.item.effects.attackBonus}</span></p> : null}
                            {card.item.effects?.damageBonus ? <p><span className="text-zinc-400">Daño:</span> <span className="text-zinc-100">{card.item.effects.damageBonus > 0 ? '+' : ''}{card.item.effects.damageBonus}</span></p> : null}
                            {card.item.effects?.resistances?.length ? <p><span className="text-zinc-400">Resistencias:</span> <span className="text-zinc-100">{card.item.effects.resistances.join(', ')}</span></p> : null}
                          </>
                        )}
                        {card.properties?.length ? <p className="whitespace-pre-wrap"><span className="text-zinc-400">Propiedades:</span> <span className="text-zinc-100">{card.properties.join(', ')}</span></p> : null}
                        {spellEffectDetails && <p><span className="text-zinc-400">Efecto:</span> <span className="text-zinc-100">{spellEffectDetails}</span></p>}
                      </>
                    )}

                    {rangeText && <p className="whitespace-pre-wrap"><span className="text-zinc-400">Alcance:</span> <span className="text-zinc-100">{rangeText}</span></p>}
                    {areaText && <p className="whitespace-pre-wrap"><span className="text-zinc-400">Objetivo / área:</span> <span className="text-zinc-100">{areaText}</span></p>}
                    {componentLabels && <p className="whitespace-pre-wrap"><span className="text-zinc-400">Componentes:</span> <span className="text-zinc-100">{componentLabels}</span></p>}
                    {card.concentration && <p className="text-amber-300">Concentración</p>}
                    {card.ritual && <p className="text-amber-300">Lanzamiento ritual</p>}
                    {card.status && <p><span className="text-zinc-400">Estado:</span> <span className="text-zinc-100">{card.status}</span></p>}
                    {card.classes?.length ? <p><span className="text-zinc-400">Clases:</span> <span className="text-zinc-100">{card.classes.join(', ')}</span></p> : null}
                    {card.properties?.length && card.category !== 'item' ? <p className="whitespace-pre-wrap"><span className="text-zinc-400">Propiedades:</span> <span className="text-zinc-100">{card.properties.join(', ')}</span></p> : null}
                    {null}
                  </div>
                )}

                {(card.source || card.tags?.length || cardUsesMax) && (
                  <div className="mb-2 space-y-1 text-[11px]">
                    {(cardUsesMax ?? 0) > 0 && (
                      <p>
                        <span className="text-zinc-400">Usos:</span>{' '}
                        <span className="text-zinc-200">
                          {cardUsesLeft ?? cardUsesMax}/{cardUsesMax}
                          {card.uses?.recharge && card.uses.recharge !== 'none'
                            ? ` · recarga ${card.uses.recharge}`
                            : ''}
                        </span>
                      </p>
                    )}
                    {card.source && (
                      <p className="whitespace-pre-wrap break-words">
                        <span className="text-zinc-400">Origen:</span>{' '}
                        <span className="text-zinc-200">{card.source}</span>
                      </p>
                    )}
                    {!!card.tags?.length && (
                      <p className="whitespace-pre-wrap break-words">
                        <span className="text-zinc-400">Etiquetas:</span>{' '}
                        <span className="text-zinc-200">{card.tags.join(', ')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="mb-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-300/80">
                  {card.description}
                </p>

                {/* Resource pips if applicable */}
                {cardUsesMax && cardUsesMax > 0 && (
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zinc-400">Usos disponibles:</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: cardUsesMax }).map((_, i) => {
                        const isAvailable = i < (cardUsesLeft ?? cardUsesMax);
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
                    onClick={() => handleUpdateCard(card.id, { favorite: !card.favorite })}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      card.favorite
                        ? 'text-amber-300 hover:bg-amber-950/30'
                        : 'text-zinc-500 hover:text-amber-300 hover:bg-amber-950/30'
                    }`}
                    title={card.favorite ? 'Quitar de favoritas' : 'Añadir a favoritas'}
                    aria-label={card.favorite ? `Quitar ${card.name || card.title} de favoritas` : `Añadir ${card.name || card.title} a favoritas`}
                    aria-pressed={Boolean(card.favorite)}
                  >
                    <Star className={`h-4 w-4 ${card.favorite ? 'fill-current' : ''}`} />
                  </button>
                  {card.category === 'item' && (
                    <>
                      <button
                        onClick={() => handleUpdateCard(card.id, { equipped: !card.equipped })}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${card.equipped ? 'bg-emerald-900/60 text-emerald-200' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                      >
                        {card.equipped ? 'Desequipar' : 'Equipar'}
                      </button>
                      {card.item?.requiresAttunement && (
                        <button
                          onClick={() => {
                            if (!card.item!.attuned && character.cards.filter((entry) =>
                              entry.id !== card.id && entry.item?.requiresAttunement && entry.item.attuned,
                            ).length >= 3) {
                              alert('Un personaje solo puede estar sintonizado con tres objetos a la vez.');
                              return;
                            }
                            handleUpdateCard(card.id, { item: { ...card.item!, attuned: !card.item!.attuned } });
                          }}
                          className="rounded-lg bg-amber-950/50 px-2 py-1 text-[11px] text-amber-200 hover:bg-amber-900/60 transition cursor-pointer"
                        >
                          {card.item.attuned ? 'Desintonizar' : 'Sintonizar'}
                        </button>
                      )}
                    </>
                  )}
                  {true && (
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
                  )}

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    const isSpell = card.category === 'spell';
                    const spellLevel = card.level ?? 1;
                    if (isSpell && spellLevel > 0) {
                      const slots = character.spellSlots ?? [];
                      const availableSlots = slots.filter(
                        (s: any) => s.tier >= spellLevel && (s.used ?? 0) < (s.max ?? 0)
                      );

                      if (availableSlots.length === 0) {
                        alert(`No tienes espacios de hechizo disponibles de nivel ${spellLevel} o superior para lanzar ${card.name || card.title}.`);
                        return;
                      }

                      setActiveCastingCard(card);
                      setIsSpellSlotModalOpen(true);
                      return;
                    }

                    if (card.category === 'item') {
                      const usesMax = card.uses?.max ?? 0;
                      const usesCurrent = card.uses?.current ?? usesMax;
                      const quantity = card.item?.quantity ?? 1;
                      if ((usesMax > 0 && usesCurrent <= 0)
                        || (card.item?.kind === 'consumable' && usesMax === 0 && quantity <= 0)) {
                        alert(`${card.name || card.title} no tiene cargas disponibles.`);
                        return;
                      }
                      if (usesMax > 0) {
                        handleUpdateCard(card.id, {
                          uses: { ...card.uses, current: Math.max(0, usesCurrent - 1) },
                        });
                      } else if (card.item?.kind === 'consumable') {
                        handleUpdateCard(card.id, {
                          item: { ...card.item, quantity: Math.max(0, quantity - 1) },
                        });
                      }
                      onOpenDiceTray(card.effectOrDamage);
                      return;
                    }

                    onOpenDiceTray(card.effectOrDamage);
                  }}
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
      {isHomebrewModalOpen && (
        <HomebrewCardModal
          key={editingCard?.id ?? 'new-card'}
          isOpen={isHomebrewModalOpen}
          onClose={() => setIsHomebrewModalOpen(false)}
          onSaveCard={handleSaveCard}
          cardToEdit={editingCard}
          character={character}
        />
      )}

      {/* Spell Slot Selection Modal */}
      <SpellSlotModal
        isOpen={isSpellSlotModalOpen}
        onClose={() => {
          setIsSpellSlotModalOpen(false);
          setActiveCastingCard(null);
        }}
        card={activeCastingCard}
        character={character}
        onConfirmSlot={(chosenTier) => {
          const slots = character.spellSlots ?? [];
          const updatedSlots = slots.map((s: any) =>
            s.tier === chosenTier
              ? { ...s, used: (s.used ?? 0) + 1, current: Math.max(0, (s.max ?? 0) - ((s.used ?? 0) + 1)) }
              : s
          );
          onUpdate({
            ...character,
            spellSlots: updatedSlots,
          });
          const formula = activeCastingCard?.effectOrDamage;
          setIsSpellSlotModalOpen(false);
          setActiveCastingCard(null);
          onOpenDiceTray(formula);
        }}
      />
    </div>
  );
};
