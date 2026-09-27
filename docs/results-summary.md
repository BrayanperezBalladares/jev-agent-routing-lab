# Results Summary

This page contains the main historical results from the
Jev Agent Routing Lab.

Raw experiment outputs are generated locally and are not
committed to the repository.

The purpose of this page is to preserve the main quantitative
results without requiring readers to rerun every external API
experiment.

---

## Main benchmark results

| Experiment | Successful requests | Semantic accuracy on successful responses | All-attempt correct | Notes |
|---|---:|---:|---:|---|
| V1 Baseline | 20/20 | 100% | 20/20 | Initial routing validation |
| V2 Hard | 30/30 | 100% | 30/30 | Harder semantic routing cases |
| V3 Balanced Holdout | 50/50 | 100% | 50/50 | Frozen balanced holdout |
| V4 Minimal Pairs | 39/40 | 100% | 39/40 | 1 infrastructure failure |
| V5 Cue-Stripped | 39/40 | 100% | 39/40 | 1 infrastructure failure |

The distinction between semantic accuracy and all-attempt
correctness is intentional.

A provider or gateway failure such as an HTTP `429` or `503`
is treated separately from a semantic routing error.

---

## V3 holdout comparator results

The balanced holdout was also used to compare Jev with
alternative routing approaches.

| Router | Successful requests | Correct decisions | Accuracy on successful responses | Notes |
|---|---:|---:|---:|---|
| Jev | 50/50 | 50/50 | 100% | Specialized semantic evaluator |
| Rule baseline | 50/50 | 24/50 | 48% | Simple lexical / keyword scoring |
| General-purpose LLM | 50/50 | 40/50 | 80% | OpenAI GPT-5-mini |
| NVIDIA Nemotron Ultra | 48/50 | 47/48 | 97.9% | 2 infrastructure failures |

These are not perfectly normalized model comparisons.

Differences existed in:

- provider infrastructure
- retry behavior
- latency measurement
- pricing methodology
- output parsing
- endpoint availability

The table should therefore be interpreted as experimental
context rather than a universal model leaderboard.

---

## Repeated boundary experiments

The most important later experiments repeated the exact same
or closely controlled states multiple times.

| Experiment | Key state | Choice distribution | Avg confidence | Avg margin |
|---|---|---|---:|---:|
| V5 consistency | V5U02 | `ASK_USER` 6/20, `SEARCH_CODE` 14/20 | 0.315 | 0.071 |
| V6 | B3 | `ASK_USER` 4/10, `SEARCH_CODE` 6/10 | 0.317 | 0.068 |
| V7 | A5 | `ASK_USER` 3/10, `SEARCH_CODE` 7/10 | 0.248 | 0.047 |
| V8 | C1 | `ASK_USER` 2/10, `SEARCH_CODE` 8/10 | 0.242 | 0.034 |
| V8 | C2 | `SEARCH_CODE` 10/10 | 0.534 | 0.284 |
| V8 | C3 | `SEARCH_CODE` 10/10 | 1.000 | 1.000 |
| V8 | C4 | `SEARCH_CODE` 10/10 | 0.987 | 0.982 |
| V8 | C5 | `SEARCH_CODE` 10/10 | 1.000 | 1.000 |
| V8 | C6 | `SEARCH_CODE` 10/10 | 1.000 | 1.000 |

Repeated evaluations of identical text are not independent
samples.

They are used here to characterize empirical stochastic
behavior of the router, not to estimate population-level
generalization.

---

## V8 implementation-explicitness progression

V8 kept the approved business rule fixed while changing how
explicitly the unresolved implementation problem was stated.

### C1 — approved requirement only

```text
SEARCH_CODE 8/10
ASK_USER    2/10

average confidence = 0.242
average margin     = 0.034
```

This state remained close to the observed decision boundary.

---

### C2 — implementation not discussed

```text
SEARCH_CODE 10/10

average confidence = 0.534
average margin     = 0.284
```

The selected action became empirically stable, although
meaningful probability mass remained on `ASK_USER`.

---

### C3 — implementation location unclear

```text
SEARCH_CODE 10/10

average confidence = 1.000
average margin     = 1.000
```

Making the unresolved operational information explicit caused
the routing distribution to become strongly separated.

---

## Main empirical finding

The central result of the project is not simply high
one-shot benchmark accuracy.

It is:

> One-shot accuracy can hide routing instability near semantic
> decision boundaries.

Repeated evaluation showed that an input may produce the
expected decision once while still alternating between
different actions across identical evaluations.

---

## Confidence and margin

The experiments also showed that:

```text
low confidence != incorrect
```

and:

```text
high confidence != universally correct
```

Some relatively low-confidence states were stable across
every repeated run.

Others were genuinely unstable.

The top-1/top-2 probability margin was useful as an additional
signal:

```text
margin = P(top1) - P(top2)
```

Very small average margins appeared in several of the
unstable boundary states investigated in this project.

However, the current evidence does not establish a universal
margin threshold for production systems.

---

## Reliability

Infrastructure behavior was tracked separately from semantic
behavior.

Observed external failures included:

```text
HTTP 429
HTTP 503
provider overload
timeouts
```

These failures motivate separate production policies for:

```text
semantic uncertainty
```

and:

```text
provider reliability
```

---

## Interpretation

These results apply to the specific software-engineering
routing task investigated in this repository.

They do not demonstrate that Jev:

- has universal 100% accuracy
- is always more accurate than general-purpose LLMs
- has universally calibrated confidence
- will behave identically in production agents
- supports one universal uncertainty threshold

The later V4–V8 suites are diagnostic experiments designed
after earlier observations and should not be treated as
independent untouched benchmarks.

---

## Related documentation

See:

- [`methodology.md`](methodology.md) for experimental design
- [`findings.md`](findings.md) for interpretation
- [`experiments.md`](experiments.md) for the experiment history
- [`../results/README.md`](../results/README.md) for generated result artifacts