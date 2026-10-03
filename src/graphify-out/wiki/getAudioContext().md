# getAudioContext()

> God node · 6 connections · [C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\utils\audio.ts](file:///C:/Users/axels/Downloads/CW%20for%20MCU%2011.1/grimorio/src/utils/audio.ts#L3)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as getAudioContext()
    participant P1 as playHealSound()
    participant P2 as handleShortRest()
    participant P3 as showBanner()
    participant P4 as handleLongRest()
    participant P5 as playSpellCastSound()
    participant P6 as handleAddCard()
    participant P7 as playDiceRollSound()
    participant P8 as playNat20Sound()
    participant P9 as playNat1Sound()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P2: calls
    P2-->>- P1: return
    P2->>+ P3: calls
    P3-->>- P2: return
    P2->>+ P1: calls
    P1-->>- P2: return
    P1->>+ P4: calls
    P4-->>- P1: return
    P4->>+ P3: calls
    P3-->>- P4: return
    P4->>+ P1: calls
    P1-->>- P4: return
    P0->>+ P5: calls
    P5-->>- P0: return
    P5->>+ P0: calls
    P0-->>- P5: return
    P5->>+ P6: calls
    P6-->>- P5: return
    P6->>+ P3: calls
    P3-->>- P6: return
    P6->>+ P5: calls
    P5-->>- P6: return
    P0->>+ P7: calls
    P7-->>- P0: return
    P7->>+ P0: calls
    P0-->>- P7: return
    P0->>+ P8: calls
    P8-->>- P0: return
    P0->>+ P9: calls
    P9-->>- P0: return
```

## Connections by Relation

### calls
- [[playHealSound()]] `EXTRACTED`
- [[playSpellCastSound()]] `EXTRACTED`
- [[playDiceRollSound()]] `EXTRACTED`
- [[playNat20Sound()]] `EXTRACTED`
- [[playNat1Sound()]] `EXTRACTED`

### contains
- [[audio.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*