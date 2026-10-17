import React, { useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Leaf,
  PenLine,
  PawPrint,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { BeastForm, CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

interface BeastFormDraft {
  name: string;
  cr: string;
  hp: string;
  ac: string;
  speed: string;
  senses: string;
  attacks: string;
  size: string;
  creatureType: string;
  skills: string;
  resistances: string;
  vulnerabilities: string;
  immunities: string;
  traits: string;
  notes: string;
}

const EMPTY_FORM: BeastFormDraft = {
  name: '',
  cr: '',
  hp: '',
  ac: '',
  speed: '',
  senses: '',
  attacks: '',
  size: '',
  creatureType: '',
  skills: '',
  resistances: '',
  vulnerabilities: '',
  immunities: '',
  traits: '',
  notes: '',
};

const LEGACY_BEAST_FORMS: BeastForm[] = [
  {
    id: 'starter-brown-bear',
    name: 'Oso Pardo',
    cr: 'CR 1',
    hp: 34,
    ac: 11,
    speed: '40 pies, trepar 30 pies',
    attacks: 'Mordisco (+5, 1d8+4 perf) y Garras (+5, 2d6+4 cort)',
    senses: 'Olfato agudo (ventaja en percepción de olor)',
  },
  {
    id: 'starter-dire-wolf',
    name: 'Lobo Huargo',
    cr: 'CR 1',
    hp: 37,
    ac: 14,
    speed: '50 pies',
    attacks: 'Mordisco (+5, 2d6+3 perf, derribo CD 13 FUE)',
    senses: 'Oído y olfato agudo, Tácticas de Manada',
  },
  {
    id: 'starter-giant-eagle',
    name: 'Águila Gigante',
    cr: 'CR 1',
    hp: 26,
    ac: 13,
    speed: '10 pies, volar 80 pies',
    attacks: 'Pico (+5, 1d6+3 perf) y Talones (+5, 2d6+3 cort)',
    senses: 'Vista aguda (ventaja en percepción)',
  },
  {
    id: 'starter-shadow-panther',
    name: 'Pantera de Sombras',
    cr: 'CR 1/4',
    hp: 18,
    ac: 12,
    speed: '50 pies, trepar 40 pies',
    attacks: 'Garras (+4, 1d4+2) y Mordisco (+4, 1d6+2)',
    senses: 'Visión en la oscuridad 60 ft, Abalanzarse',
  },
];

const makeLegacyId = (form: BeastForm) =>
  `legacy-${form.name.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const withStableId = (form: BeastForm): BeastForm => ({
  ...form,
  id: form.id || makeLegacyId(form),
});

const createFormId = () =>
  `beast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const draftFromForm = (form: BeastForm): BeastFormDraft => ({
  name: form.name,
  cr: form.cr,
  hp: String(form.hp),
  ac: String(form.ac),
  speed: form.speed,
  senses: form.senses,
  attacks: form.attacks,
  size: form.size ?? '',
  creatureType: form.creatureType ?? '',
  skills: form.skills ?? '',
  resistances: form.resistances ?? '',
  vulnerabilities: form.vulnerabilities ?? '',
  immunities: form.immunities ?? '',
  traits: form.traits ?? '',
  notes: form.notes ?? '',
});

const toBeastForm = (draft: BeastFormDraft, id: string): BeastForm => ({
  id,
  name: draft.name.trim(),
  cr: draft.cr.trim(),
  hp: Number(draft.hp),
  ac: Number(draft.ac),
  speed: draft.speed.trim(),
  senses: draft.senses.trim(),
  attacks: draft.attacks.trim(),
  size: draft.size.trim(),
  creatureType: draft.creatureType.trim(),
  skills: draft.skills.trim(),
  resistances: draft.resistances.trim(),
  vulnerabilities: draft.vulnerabilities.trim(),
  immunities: draft.immunities.trim(),
  traits: draft.traits.trim(),
  notes: draft.notes.trim(),
});

export const DruidWildShapeModule: React.FC<Props> = ({ character, onUpdate }) => {
  const druidData = character.classResources.druid ?? {
    wildShapeCurrent: 2,
    wildShapeMax: 2,
    activeForm: null,
    forms: [],
  };
  const maxUses = character.level >= 17 ? 4 : character.level >= 6 ? 3 : 2;
  const currentUses = Math.min(druidData.wildShapeCurrent ?? maxUses, maxUses);

  const forms = (druidData.forms ?? LEGACY_BEAST_FORMS).map(withStableId);
  let activeForm = druidData.activeForm ? withStableId(druidData.activeForm) : null;
  if (activeForm) {
    const matchingForm = forms.find(
      (form) => form.id === activeForm?.id || form.name === activeForm?.name
    );
    if (matchingForm) {
      activeForm = { ...activeForm, id: matchingForm.id };
    } else {
      forms.push(activeForm);
    }
  }

  const [draft, setDraft] = useState<BeastFormDraft>(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const updateDruid = (updates: Partial<typeof druidData>) => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        druid: {
          ...druidData,
          ...updates,
          wildShapeCurrent: Math.min(
            updates.wildShapeCurrent ?? currentUses,
            maxUses
          ),
          wildShapeMax: maxUses,
          forms: updates.forms ?? forms,
        },
      },
    });
  };

  const beginAdd = () => {
    setDraft(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setDraft(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setIsFormOpen(false);
  };

  const beginEdit = (form: BeastForm) => {
    setDraft(draftFromForm(form));
    setEditingId(form.id ?? makeLegacyId(form));
    setFormError('');
    setIsFormOpen(true);
  };

  const saveForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hp = Number(draft.hp);
    const ac = Number(draft.ac);
    if (!draft.name.trim() || !draft.speed.trim()) {
      setFormError('El nombre y la velocidad son obligatorios.');
      return;
    }
    if (!Number.isFinite(hp) || hp < 1 || !Number.isFinite(ac) || ac < 1) {
      setFormError('Los PG y la CA deben ser números mayores que cero.');
      return;
    }

    const id = editingId ?? createFormId();
    const updatedForm = toBeastForm(draft, id);
    const updatedForms = editingId
      ? forms.map((form) => (form.id === editingId ? updatedForm : form))
      : [...forms, updatedForm];
    const updatedActiveForm =
      activeForm?.id === editingId ? updatedForm : activeForm;

    updateDruid({ forms: updatedForms, activeForm: updatedActiveForm });
    closeForm();
  };

  const removeForm = (form: BeastForm) => {
    if (!window.confirm(`¿Retirar "${form.name}" del repertorio de formas?`)) return;
    const id = form.id ?? makeLegacyId(form);
    const updatedForms = forms.filter((knownForm) => knownForm.id !== id);
    updateDruid({
      forms: updatedForms,
      activeForm: activeForm?.id === id ? null : activeForm,
    });
    if (editingId === id) closeForm();
  };

  const toggleForm = (form: BeastForm) => {
    const id = form.id ?? makeLegacyId(form);
    if (activeForm?.id === id) {
      updateDruid({ activeForm: null });
      return;
    }
    if (currentUses <= 0) return;
    updateDruid({
      wildShapeCurrent: currentUses - 1,
      activeForm: { ...form, id },
    });
  };

  const updateDraft = (field: keyof BeastFormDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (formError) setFormError('');
  };

  const inputClass =
    'w-full rounded-lg border border-emerald-800/70 bg-[#09150d]/90 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/35 outline-none focus:border-emerald-400';
  const labelClass = 'flex flex-col gap-1 text-xs font-medium text-emerald-200/90';

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-[#122616]/90 via-[#0d1c10]/95 to-[#1a331f]/90 p-5 shadow-xl backdrop-blur-md">
      <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 opacity-15 text-emerald-400">
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
          <path d="M10,90 Q40,40 90,20 Q60,70 10,90 Z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-500/10 text-emerald-300 shadow-inner">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-base font-bold tracking-wide text-emerald-200">
                  Forma Salvaje
                </h3>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  {currentUses} / {maxUses} Usos
                </span>
              </div>
              <p className="text-xs text-emerald-200/70">
                {activeForm
                  ? `Forma activa: ${activeForm.name}`
                  : 'Administra tu repertorio y elige una forma para transformarte.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={beginAdd}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar forma
            </button>
          </div>
        </div>

        {isFormOpen && (
          <form
            onSubmit={saveForm}
            className="mb-5 rounded-xl border border-emerald-500/30 bg-[#08140c]/80 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-cinzel text-sm font-bold text-emerald-200">
                {editingId ? 'Editar forma' : 'Nueva forma'}
              </h4>
              <button
                type="button"
                onClick={closeForm}
                className="rounded p-1 text-emerald-200/70 hover:bg-emerald-900/50 hover:text-emerald-100"
                aria-label="Cerrar formulario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className={`${labelClass} sm:col-span-2`}>
                Nombre *
                <input className={inputClass} value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} autoFocus />
              </label>
              <label className={labelClass}>
                VD / categoría
                <input className={inputClass} value={draft.cr} onChange={(e) => updateDraft('cr', e.target.value)} placeholder="Texto libre" />
              </label>
              <label className={labelClass}>
                Tamaño
                <input className={inputClass} value={draft.size} onChange={(e) => updateDraft('size', e.target.value)} placeholder="Mediano" />
              </label>
              <label className={labelClass}>
                Tipo de criatura
                <input className={inputClass} value={draft.creatureType} onChange={(e) => updateDraft('creatureType', e.target.value)} placeholder="Bestia" />
              </label>
              <label className={labelClass}>
                Clase de Armadura *
                <input className={inputClass} type="number" min="1" value={draft.ac} onChange={(e) => updateDraft('ac', e.target.value)} />
              </label>
              <label className={labelClass}>
                Puntos de golpe *
                <input className={inputClass} type="number" min="1" value={draft.hp} onChange={(e) => updateDraft('hp', e.target.value)} />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Velocidad *
                <input className={inputClass} value={draft.speed} onChange={(e) => updateDraft('speed', e.target.value)} placeholder="40 pies, trepar 20 pies" />
              </label>
              <label className={labelClass}>
                Sentidos
                <input className={inputClass} value={draft.senses} onChange={(e) => updateDraft('senses', e.target.value)} />
              </label>
              <label className={labelClass}>
                Habilidades
                <input className={inputClass} value={draft.skills} onChange={(e) => updateDraft('skills', e.target.value)} />
              </label>
              <label className={labelClass}>
                Resistencias
                <input className={inputClass} value={draft.resistances} onChange={(e) => updateDraft('resistances', e.target.value)} />
              </label>
              <label className={labelClass}>
                Vulnerabilidades
                <input className={inputClass} value={draft.vulnerabilities} onChange={(e) => updateDraft('vulnerabilities', e.target.value)} />
              </label>
              <label className={labelClass}>
                Inmunidades
                <input className={inputClass} value={draft.immunities} onChange={(e) => updateDraft('immunities', e.target.value)} />
              </label>
              <label className={labelClass}>
                Rasgos
                <textarea className={inputClass} rows={2} value={draft.traits} onChange={(e) => updateDraft('traits', e.target.value)} />
              </label>
              <label className={labelClass}>
                Acciones / ataques
                <textarea className={inputClass} rows={2} value={draft.attacks} onChange={(e) => updateDraft('attacks', e.target.value)} />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Notas adicionales
                <textarea className={inputClass} rows={2} value={draft.notes} onChange={(e) => updateDraft('notes', e.target.value)} />
              </label>
            </div>

            {formError && <p className="mt-3 text-xs font-medium text-red-300" role="alert">{formError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={closeForm} className="rounded-lg border border-emerald-800 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-950/60">
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                {editingId ? 'Guardar cambios' : 'Guardar forma'}
              </button>
            </div>
          </form>
        )}

        {forms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-700/60 bg-emerald-950/20 px-4 py-8 text-center">
            <Leaf className="mx-auto mb-2 h-6 w-6 text-emerald-500/70" />
            <p className="text-sm font-medium text-emerald-200">Tu repertorio está vacío</p>
            <p className="mt-1 text-xs text-emerald-200/60">Agrega una forma y captura sus estadísticas según las reglas y decisiones de tu mesa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {forms.map((form) => {
              const id = form.id ?? makeLegacyId(form);
              const isActive = activeForm?.id === id;
              const canTransform = isActive || currentUses > 0;

              return (
                <article
                  key={id}
                  className={`rounded-xl border p-3 transition ${
                    isActive
                      ? 'border-amber-400/80 bg-gradient-to-b from-[#342814]/90 to-[#1f190e]/90 shadow-[0_0_14px_rgba(245,158,11,0.18)]'
                      : 'border-emerald-800/70 bg-gradient-to-b from-[#142618]/80 to-[#0e1c11]/90 hover:border-emerald-600/70'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-amber-100">{form.name}</h4>
                      <p className="text-[10px] text-emerald-200/60">
                        {[form.size, form.creatureType, form.cr].filter(Boolean).join(' · ') || 'Forma personalizada'}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => beginEdit(form)} className="rounded p-1.5 text-emerald-200/70 hover:bg-emerald-900/60 hover:text-emerald-100" aria-label={`Editar ${form.name}`} title="Editar">
                        <PenLine className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => removeForm(form)} className="rounded p-1.5 text-red-300/70 hover:bg-red-950/60 hover:text-red-200" aria-label={`Retirar ${form.name}`} title="Retirar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center gap-4 text-xs text-emerald-200">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 text-red-400" />{form.hp} PG</span>
                    <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3 text-sky-300" />{form.ac} CA</span>
                  </div>
                  <p className="mb-2 text-[11px] text-emerald-200/80">Velocidad: {form.speed}</p>
                  {form.attacks && <p className="mb-2 line-clamp-2 text-[11px] text-emerald-100/70">{form.attacks}</p>}

                  <details className="mb-3 text-[11px] text-emerald-100/70">
                    <summary className="cursor-pointer select-none text-emerald-300/80 hover:text-emerald-200">Ver estadísticas completas</summary>
                    <div className="mt-2 space-y-1.5 border-t border-emerald-800/50 pt-2">
                      {form.senses && <p><strong className="text-emerald-200">Sentidos:</strong> {form.senses}</p>}
                      {form.skills && <p><strong className="text-emerald-200">Habilidades:</strong> {form.skills}</p>}
                      {form.resistances && <p><strong className="text-emerald-200">Resistencias:</strong> {form.resistances}</p>}
                      {form.vulnerabilities && <p><strong className="text-emerald-200">Vulnerabilidades:</strong> {form.vulnerabilities}</p>}
                      {form.immunities && <p><strong className="text-emerald-200">Inmunidades:</strong> {form.immunities}</p>}
                      {form.traits && <p className="whitespace-pre-wrap"><strong className="text-emerald-200">Rasgos:</strong> {form.traits}</p>}
                      {form.attacks && <p className="whitespace-pre-wrap"><strong className="text-emerald-200">Acciones:</strong> {form.attacks}</p>}
                      {form.notes && <p className="whitespace-pre-wrap"><strong className="text-emerald-200">Notas:</strong> {form.notes}</p>}
                    </div>
                  </details>

                  <button
                    type="button"
                    onClick={() => toggleForm(form)}
                    disabled={!canTransform}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isActive ? (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Revertir a forma normal</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" /> Transformarse (1 uso)</>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
