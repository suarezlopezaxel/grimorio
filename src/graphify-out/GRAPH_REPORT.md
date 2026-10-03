# Graph Report - C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src  (2026-09-29)

## Corpus Check
- 15 files · ~20,866 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 195 nodes · 200 edges · 15 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `showBanner()` - 6 edges
2. `getAudioContext()` - 6 edges
3. `buildCharacterSheet()` - 4 edges
4. `playHealSound()` - 4 edges
5. `handleShortRest()` - 3 edges
6. `handleLongRest()` - 3 edges
7. `handleAddCard()` - 3 edges
8. `getEffectiveAbility()` - 3 edges
9. `playSpellCastSound()` - 3 edges
10. `handleRollDice` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleAddCard()` --calls--> `playSpellCastSound()`  [INFERRED]
  C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\App.tsx → C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\utils\audio.ts
- `handleShortRest()` --calls--> `playHealSound()`  [INFERRED]
  C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\App.tsx → C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\utils\audio.ts
- `handleLongRest()` --calls--> `playHealSound()`  [INFERRED]
  C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\App.tsx → C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\utils\audio.ts

## Communities

### Community 0 - "Community 0"
_It handles the core attributes, skills, equipment, and progression data for a tabletop role-playing game character._
Cohesion: 0.03
Nodes (49): [alignment, setAlignment], [armorClassBase, setArmorClassBase], [armorType, setArmorType], [background, setBackground], classKeyAttributes, classSavingThrows, conMod, [currentStep, setCurrentStep] (+41 more)

### Community 1 - "Community 1"

Cohesion: 0.06
Nodes (28): ab, attackMatch, attackModifier, attrMod, calcMod(), damageMatch, effectiveScore, finalMod (+20 more)

### Community 2 - "Community 2"

Cohesion: 0.09
Nodes (24): [bannerMessage, setBannerMessage], [cards, setCards], [character, setCharacter], [combatState, setCombatState], [currentClass, setCurrentClass], [currentElement, setCurrentElement], [currentScreen, setCurrentScreen], elem (+16 more)

### Community 3 - "Community 3"

Cohesion: 0.08
Nodes (22): categories, count, [expandedStandardActions, setExpandedStandardActions], filteredCards, isActive, isAttack, [isHomebrewModalOpen, setIsHomebrewModalOpen], isItem (+14 more)

### Community 4 - "Community 4"

Cohesion: 0.22
Nodes (4): [newSlotName, setNewSlotName], [savedSlots, setSavedSlots], STORAGE_KEY, stored

### Community 5 - "Community 5"

Cohesion: 0.48
Nodes (6): audioCtx, getAudioContext(), playDiceRollSound(), playNat1Sound(), playNat20Sound(), playSpellCastSound()

### Community 6 - "Community 6"

Cohesion: 0.33
Nodes (4): acc, isActive, isSelected, item

### Community 7 - "Community 7"

Cohesion: 0.4
Nodes (4): dice, [mode, setMode], [modifier, setModifier], [showHistory, setShowHistory]

### Community 8 - "Community 8"

Cohesion: 0.4
Nodes (4): DEFAULT_CHARACTER, DEFAULT_COMBAT_STATE, DEFAULT_TACTICAL_CARDS, STANDARD_5E_ACTIONS

### Community 9 - "Community 9"

Cohesion: 0.5
Nodes (4): buildCharacterSheet(), calculateMod(), handleExportJson(), handleFinish()

### Community 10 - "Community 10"

Cohesion: 0.5
Nodes (3): boxes, CombatTurnView, isExpended

### Community 11 - "Community 11"

Cohesion: 0.67
Nodes (2): CLASS_THEMES, ELEMENT_ACCENTS

### Community 12 - "Community 12"

Cohesion: 0.67
Nodes (2): isActive, navItems

### Community 13 - "Community 13"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
_Unable to determine domain due to missing code entities._
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **135 isolated node(s):** `[currentScreen, setCurrentScreen]`, `[currentClass, setCurrentClass]`, `[currentElement, setCurrentElement]`, `[character, setCharacter]`, `[combatState, setCombatState]` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (2 nodes): `Header.tsx`, `Header()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.