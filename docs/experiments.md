# Experiment History

## Goal

This document records how the project evolved from a simple routing benchmark into a decision-boundary investigation.

The experiments are intentionally preserved rather than rewritten after later findings.

---

## Baseline

### Goal

Validate whether Jev could distinguish the five basic routing actions.

### Actions

```text
SEARCH_CODE
READ_FILE
RUN_TESTS
QUERY_DATABASE
ASK_USER
```

### Outcome

The initial results were strong enough to justify more difficult evaluation.

---

## Hard cases

### Goal

Introduce more complex distinctions where several actions might initially appear plausible.

### Observation

Jev continued to perform strongly.

This raised the question of whether the datasets contained cues that made the task easier than intended.

---

## Holdout

### Goal

Evaluate frozen routing logic on a balanced dataset created after the simple rule baseline had been defined.

### Importance

This reduced direct adaptation to the earlier cases.

The holdout also provided comparison data for:

```text
Jev
rule routing
general-purpose LLM
NVIDIA model
```

---

## V4 — Minimal pairs

### Goal

Create adversarial A/B pairs where a small change in evidence should change the next action.

### Main frontiers

```text
SEARCH_CODE ↔ READ_FILE
READ_FILE ↔ RUN_TESTS
QUERY_DATABASE ↔ RUN_TESTS
ASK_USER ↔ SEARCH_CODE
ASK_USER ↔ QUERY_DATABASE
```

### Observation

Successful Jev responses remained semantically correct, but several cases produced lower confidence.

This motivated repeated testing.

---

## V4 focused consistency

### Goal

Repeat the lowest-confidence V4 states.

### Observation

The tested states remained stable.

This demonstrated that:

```text
low confidence
```

does not automatically imply:

```text
unstable decision
```

---

## V5 — Cue-stripped routing

### Goal

Reduce obvious lexical cues and introduce irrelevant or competing evidence.

### Observation

One particular `ASK_USER` state produced very low confidence and a small top-1/top-2 probability margin.

The one-shot answer was correct.

Instead of accepting the correct result, the state was selected for repetition.

---

## V5 boundary consistency

### Goal

Repeat two low-confidence states twenty times each.

### Key discovery

One state remained stable.

The other changed repeatedly between:

```text
ASK_USER
SEARCH_CODE
```

This demonstrated that one-shot accuracy had hidden a real decision boundary.

---

## V6 — Username boundary sweep

### Goal

Gradually alter the semantic description around the unstable username-reuse state.

### Observation

Some changes made the intended action extremely clear.

However, the progression was not monotonic because one variant changed more than one semantic signal at the same time.

This motivated a stricter minimal-ablation design.

---

## V7 — Minimal linguistic ablation

### Goal

Keep the first sentence fixed and change only the second sentence.

### Key comparison

A known approved requirement without an explicit unresolved implementation question remained unstable.

Adding:

```text
the implementation responsible for this behavior
has not been located
```

made routing strongly favor:

```text
SEARCH_CODE
```

### Lesson

The evaluator appeared highly sensitive to the exact type of unresolved uncertainty.

---

## V8 — Implementation explicitness

### Goal

Hold the approved requirement constant while progressively increasing how explicitly the state describes the unknown implementation.

### Variants

```text
C1 — approved requirement only
C2 — implementation not discussed
C3 — implementation location unclear
C4 — responsible implementation unknown
C5 — implementation not located
C6 — implementation not located in repository
```

### Observation

C1 remained close to the decision boundary.

C2 became stable toward `SEARCH_CODE` while retaining moderate uncertainty.

C3 and later variants became extremely strongly separated toward `SEARCH_CODE`.

### Importance

This experiment provided the clearest evidence that routing depends on both:

```text
what the agent knows
```

and:

```text
what uncertainty remains unresolved
```

---

# Experimental lessons

The project evolved through the following sequence:

```text
accuracy
    ↓
harder cases
    ↓
holdout
    ↓
minimal pairs
    ↓
cue removal
    ↓
low-confidence investigation
    ↓
repeated evaluation
    ↓
decision-boundary discovery
    ↓
minimal linguistic ablation
```

The central methodological lesson is:

> When evaluating a semantic router, repeated evaluation near uncertain states can reveal behavior that a normal one-shot benchmark cannot.