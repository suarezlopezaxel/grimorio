# handleShortRest()

> God node · 3 connections · [C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\App.tsx](file:///C:/Users/axels/Downloads/CW%20for%20MCU%2011.1/grimorio/src/App.tsx#L142)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as handleShortRest()
    participant P1 as showBanner()
    participant P2 as handleLongRest()
    participant P3 as playHealSound()
    participant P4 as handleAddCard()
    participant P5 as playSpellCastSound()
    participant P6 as handleDeleteCard()
    participant P7 as handleCharacterCreated()
    participant P8 as getAudioContext()
    participant P9 as playDiceRollSound()
    participant P10 as playNat20Sound()
    participant P11 as playNat1Sound()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P2: calls
    P2-->>- P1: return
    P2->>+ P1: calls
    P1-->>- P2: return
    P2->>+ P3: calls
    P3-->>- P2: return
    P1->>+ P4: calls
    P4-->>- P1: return
    P4->>+ P1: calls
    P1-->>- P4: return
    P4->>+ P5: calls
    P5-->>- P4: return
    P1->>+ P6: calls
    P6-->>- P1: return
    P6->>+ P1: calls
    P1-->>- P6: return
    P1->>+ P7: calls
    P7-->>- P1: return
    P7->>+ P1: calls
    P1-->>- P7: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P3->>+ P8: calls
    P8-->>- P3: return
    P8->>+ P3: calls
    P3-->>- P8: return
    P8->>+ P5: calls
    P5-->>- P8: return
    P8->>+ P9: calls
    P9-->>- P8: return
    P8->>+ P10: calls
    P10-->>- P8: return
    P8->>+ P11: calls
    P11-->>- P8: return
    P3->>+ P0: calls
    P0-->>- P3: return
    P3->>+ P2: calls
    P2-->>- P3: return
```

## Connections by Relation

### calls
- [[showBanner()]] `EXTRACTED`
- [[playHealSound()]] `INFERRED`

### contains
- [[App.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*