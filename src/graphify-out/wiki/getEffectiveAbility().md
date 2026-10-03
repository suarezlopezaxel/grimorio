# getEffectiveAbility()

> God node · 3 connections · [C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\components\CharacterSheetView.tsx](file:///C:/Users/axels/Downloads/CW%20for%20MCU%2011.1/grimorio/src/components/CharacterSheetView.tsx#L73)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as getEffectiveAbility()
    participant P1 as getFeatBonus()
    participant P2 as calcMod()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P0->>+ P2: calls
    P2-->>- P0: return
    P2->>+ P0: calls
    P0-->>- P2: return
```

## Connections by Relation

### calls
- [[getFeatBonus()]] `EXTRACTED`
- [[calcMod()]] `EXTRACTED`

### contains
- [[CharacterSheetView.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*