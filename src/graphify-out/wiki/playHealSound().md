# playHealSound()

> God node · 4 connections · [C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\utils\audio.ts](file:///C:/Users/axels/Downloads/CW%20for%20MCU%2011.1/grimorio/src/utils/audio.ts#L131)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as playHealSound()
    participant P1 as getAudioContext()
    participant P2 as playSpellCastSound()
    participant P3 as handleAddCard()
    participant P4 as playDiceRollSound()
    participant P5 as playNat20Sound()
    participant P6 as playNat1Sound()
    participant P7 as handleShortRest()
    participant P8 as showBanner()
    participant P9 as handleLongRest()
    participant P10 as handleDeleteCard()
    participant P11 as handleCharacterCreated()
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
    P1->>+ P5: calls
    P5-->>- P1: return
    P5->>+ P1: calls
    P1-->>- P5: return
    P1->>+ P6: calls
    P6-->>- P1: return
    P6->>+ P1: calls
    P1-->>- P6: return
    P0->>+ P7: calls
    P7-->>- P0: return
    P7->>+ P8: calls
    P8-->>- P7: return
    P8->>+ P7: calls
    P7-->>- P8: return
    P8->>+ P9: calls
    P9-->>- P8: return
    P8->>+ P3: calls
    P3-->>- P8: return
    P8->>+ P10: calls
    P10-->>- P8: return
    P8->>+ P11: calls
    P11-->>- P8: return
    P7->>+ P0: calls
    P0-->>- P7: return
    P0->>+ P9: calls
    P9-->>- P0: return
```

## Connections by Relation

### calls
- [[getAudioContext()]] `EXTRACTED`
- [[handleShortRest()]] `INFERRED`
- [[handleLongRest()]] `INFERRED`

### contains
- [[audio.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*