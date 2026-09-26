# Findings

## Overview

The experiments began as a simple accuracy evaluation of Jev as a coding-agent router.

The most useful result eventually became something different:

> One-shot accuracy is insufficient for understanding routing reliability near semantic decision boundaries.

Repeated evaluations revealed behavior that would have remained hidden in a traditional benchmark.

---

## 1. High one-shot accuracy did not guarantee stability

Several benchmark suites produced very high exact-match results.

However, later repeated experiments showed that a state can produce the expected decision once while still being unstable across identical repeated evaluations.

This means:

```text
one successful decision
!=
stable routing behavior
```

---

## 2. A real ASK_USER / SEARCH_CODE boundary was discovered

One scenario described username reuse after account deletion.

The intended behavior was not defined in product documentation.

A one-shot evaluation selected the expected action:

```text
ASK_USER
```

However, repeating the exact same input produced both:

```text
ASK_USER
SEARCH_CODE
```

This was the first strong evidence that the state was positioned close to a routing boundary.

---

## 3. Repetition reproduced the instability

The original boundary state was tested again in a later experiment.

Across repeated experiments of the same wording, both actions continued to appear.

This demonstrated that the behavior was reproducible rather than a single anomalous response.

---

## 4. Confidence alone did not predict correctness

Some low-confidence decisions remained completely stable.

Other low-confidence decisions were unstable.

Therefore:

```text
low confidence
!=
incorrect
```

and:

```text
confidence
!=
calibrated correctness probability
```

Confidence was more useful as one uncertainty signal among several.

---

## 5. Top-1 / top-2 margin exposed unstable cases

The most unstable scenarios also had very small probability separation between the two leading actions.

Examples observed during the diagnostic experiments included average margins around:

```text
0.03
0.05
0.07
```

Stable cases often had substantially larger margins.

This suggests that probability margin may be useful as an uncertainty signal.

The evidence is still domain-specific and does not establish a universal threshold.

---

## 6. Moderate confidence could still be stable

Not every medium-confidence state was unstable.

Some cases produced the same action across every repetition even with substantially lower confidence than the high-certainty benchmark cases.

This is important because a naive policy such as:

```text
confidence < 0.70
→ reject
```

would discard some empirically stable decisions.

---

## 7. The evaluator reacted strongly to the type of unresolved uncertainty

A major semantic pattern appeared across the later experiments.

Consider a known business rule:

```text
The approved requirement says the username
becomes available again.
```

By itself, this does not completely specify what the agent should investigate next.

The evaluator divided probability mass between alternatives.

But adding:

```text
It is unclear where this behavior is implemented.
```

made the operational uncertainty explicit.

The routing became strongly:

```text
SEARCH_CODE
```

This suggests that Jev is sensitive not only to the desired behavior, but also to what information is still missing from the current agent state.

---

## 8. Wording matters

Small changes in wording changed probability distributions significantly.

For example, these phrases were not equivalent from the evaluator's perspective:

```text
the documentation never states...
```

```text
the current requirements never state...
```

```text
the current requirements do not define...
```

```text
no product decision has been made...
```

The last formulations produced much stronger routing toward:

```text
ASK_USER
```

This means agent-state construction is itself an important part of the routing system.

A poorly summarized state can create ambiguity that does not exist in the underlying task.

---

## 9. Explicit operational state can collapse uncertainty

The implementation-explicitness experiment showed a progression.

### Requirement only

Routing remained close to the decision boundary.

### Implementation not discussed

Routing became empirically stable toward:

```text
SEARCH_CODE
```

but probability separation remained moderate.

### Implementation location explicitly unclear

Routing became effectively deterministic in the tested runs.

This is useful for agent design:

> The router works best when the state clearly describes both what is known and what remains unresolved.

---

## 10. Empirical stability and internal certainty are different

A state can be:

```text
empirically stable
```

while still receiving:

```text
moderate confidence
moderate probability margin
```

For example, a state may route to the same action 10/10 times while the evaluator still assigns meaningful probability to another action.

Therefore a production agent may benefit from combining:

```text
current confidence
current margin
historical calibration
action risk
```

rather than relying on a single score.

---

## 11. Infrastructure failures must be separated from reasoning failures

During broader benchmark runs, external failures such as:

```text
429
503
provider overload
```

were observed.

These do not indicate that the semantic decision was incorrect.

A production integration therefore needs two independent safeguards:

```text
semantic uncertainty handling
```

and:

```text
provider reliability handling
```

---

## 12. Practical implication for agents

A useful integration pattern is:

```text
agent constructs current state
        ↓
Jev evaluates next action
        ↓
choice + probabilities + confidence
        ↓
calculate probability margin
        ↓
clear decision?
   yes        no
    │          │
 execute    fallback / second evaluation
```

Jev should therefore be treated as:

```text
decision router
```

rather than:

```text
full coding agent
```

---

## Working hypothesis

The current experiments support the following working hypothesis:

> In this routing domain, very small top-1/top-2 margins are a useful warning signal for semantic decision boundaries, but margin and confidence require further calibration before they should control production behavior automatically.

---

## What the results do not prove

The experiments do not prove that Jev:

```text
has universal 100% routing accuracy
is always better than general-purpose models
has universally calibrated confidence
will behave identically on real production repositories
```

The tested scenarios are synthetic and the action space is intentionally small.

The next important test is therefore a real multi-step agent using actual tools.