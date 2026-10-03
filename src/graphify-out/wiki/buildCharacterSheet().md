# buildCharacterSheet()

> God node · 4 connections · [C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\components\CharacterCreatorView.tsx](file:///C:/Users/axels/Downloads/CW%20for%20MCU%2011.1/grimorio/src/components/CharacterCreatorView.tsx#L246)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as buildCharacterSheet()
    participant P1 as calculateMod()
    participant P2 as handleFinish()
    participant P3 as handleExportJson()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P0->>+ P2: calls
    P2-->>- P0: return
    P2->>+ P0: calls
    P0-->>- P2: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P3->>+ P0: calls
    P0-->>- P3: return
```

## Connections by Relation

### calls
- [[calculateMod()]] `EXTRACTED`
- [[handleFinish()]] `EXTRACTED`
- [[handleExportJson()]] `EXTRACTED`

### contains
- [[CharacterCreatorView.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*