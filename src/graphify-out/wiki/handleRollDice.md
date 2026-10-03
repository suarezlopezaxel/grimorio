# handleRollDice

> God node · 2 connections · [C:\Users\axels\Downloads\CW for MCU 11.1\grimorio\src\App.tsx](file:///C:/Users/axels/Downloads/CW%20for%20MCU%2011.1/grimorio/src/App.tsx#L88)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as handleRollDice
    participant P1 as handleQuickRoll()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
```

## Connections by Relation

### calls
- [[handleQuickRoll()]] `EXTRACTED`

### contains
- [[App.tsx]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*