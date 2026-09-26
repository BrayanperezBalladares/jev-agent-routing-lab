# Methodology

## Objective

The objective of this project is to evaluate whether Jev can function as a semantic decision router inside a software-engineering agent.

The evaluator does not solve the complete programming task.

Instead, it selects the next action from a small fixed action space.

---

## Action space

The routing action space contains five actions.

### SEARCH_CODE

Search the repository when the relevant implementation location is unknown.

### READ_FILE

Inspect a specific implementation file when the relevant file is already known or when code behavior needs investigation.

### RUN_TESTS

Run tests when code has already been modified and needs verification.

### QUERY_DATABASE

Inspect persistent records, schema, constraints, or database state when stored state may explain the problem.

### ASK_USER

Ask the user when the intended behavior or requirement is insufficiently defined.

---

## Frozen routing criteria

The semantic meaning of the five actions was frozen before the later diagnostic experiments.

The evaluator criteria were not modified in response to failures in V4, V5, V6, V7, or V8.

This is important because changing the criteria after observing failures would contaminate comparisons between experiments.

---

## Dataset progression

The experimental process evolved through several stages.

### Initial baseline

The first dataset verified that Jev could distinguish the basic routing actions.

### Hard cases

The second dataset introduced more difficult distinctions.

### Holdout

A balanced holdout dataset was created after the simple rule-based router had been frozen.

This helped reduce direct tuning to the earlier benchmark.

### V4 minimal pairs

V4 introduced pairs of scenarios where a small semantic change should flip the correct action.

These cases focused on boundaries such as:

```text
SEARCH_CODE ↔ READ_FILE
READ_FILE ↔ RUN_TESTS
QUERY_DATABASE ↔ RUN_TESTS
ASK_USER ↔ SEARCH_CODE
ASK_USER ↔ QUERY_DATABASE
```

### V5 cue-stripped cases

V5 reduced direct lexical cues and introduced distractors.

The goal was to test whether the evaluator followed the relevant uncertainty rather than simply matching obvious words.

### Repeated consistency experiments

Low-confidence states were repeated multiple times without modifying the input.

This was used to distinguish:

```text
low-confidence but stable
```

from:

```text
low-confidence and genuinely unstable
```

### V6 boundary sweep

V6 gradually modified the semantic description around an `ASK_USER ↔ SEARCH_CODE` boundary.

### V7 minimal ablation

V7 controlled the experiment more strictly by changing only one sentence while leaving the rest of the scenario fixed.

### V8 implementation explicitness

V8 studied how explicitly describing an unknown implementation location affected routing toward `SEARCH_CODE`.

---

## One-shot evaluation

For normal benchmark cases, the primary metrics were:

```text
chosen action
exact match
acceptable match
confidence
probability distribution
latency
API usage
provider errors
```

---

## Repeated evaluation

For boundary experiments, the exact same input was evaluated multiple times.

Additional measurements included:

```text
choice frequency
choice stability
instability rate
choice entropy
average confidence
top-1/top-2 margin
probability distributions
```

---

## Probability margin

For every response, actions are ranked by their returned probability.

The decision margin is calculated as:

```text
margin = P(top1) - P(top2)
```

Example:

```text
SEARCH_CODE  0.39
ASK_USER     0.38
```

produces:

```text
margin = 0.01
```

A small margin means the two leading actions are close.

A large margin means the top action is strongly separated from the alternative.

The project investigates whether this quantity can help detect decision boundaries.

---

## Choice instability

For repeated experiments, the dominant action rate is:

```text
dominantChoiceRate =
max(action counts) / successful runs
```

Instability is:

```text
instabilityRate =
1 - dominantChoiceRate
```

Example:

```text
SEARCH_CODE = 7
ASK_USER    = 3
```

produces:

```text
dominantChoiceRate = 0.70
instabilityRate    = 0.30
```

---

## Choice entropy

Repeated experiments also report entropy over the empirical action distribution.

A deterministic result such as:

```text
10 / 0
```

has:

```text
entropy = 0
```

A more balanced split has greater entropy.

This provides another way to describe decision instability independently of the evaluator's own confidence score.

---

## Semantic errors vs infrastructure errors

Two classes of failure are tracked separately.

### Semantic failure

The evaluator successfully returns a response but selects an action that does not match the benchmark label.

### Infrastructure failure

The request does not successfully produce a semantic decision.

Examples include:

```text
HTTP 429
HTTP 503
timeouts
provider overload
```

Infrastructure failures are not counted as semantic reasoning errors.

---

## Latency methodology

Latency values must be interpreted carefully.

The project records both end-to-end latency and provider latency when available.

End-to-end latency may include:

```text
gateway overhead
retry delays
network latency
provider fallback
```

Therefore a very large end-to-end latency does not necessarily indicate slow model inference.

Median latency is generally more representative than the mean when large retry outliers occur.

---

## Cost methodology

Cost fields are provider-specific.

Examples include:

```text
Gateway market cost
estimated model-list pricing
free endpoint observations
```

These values are not perfectly equivalent billing measures.

Cost comparisons should therefore be interpreted as operational observations rather than exact normalized economic benchmarks.

---

## Comparator methodology

Three broad alternatives were explored.

### Rule baseline

A simple keyword-scoring router was implemented.

Because early datasets influenced its design, results on those datasets are not treated as independent evidence.

### General-purpose LLM

A general-purpose OpenAI model was evaluated using the same five routing actions.

### NVIDIA Nemotron Ultra

Nemotron Ultra was evaluated through NVIDIA NIM with constrained action output.

Provider formatting and infrastructure differed from Jev.

These comparisons therefore provide context rather than a perfectly controlled model leaderboard.

---

## Dataset freezing

Once an experiment had been executed:

```text
states were not rewritten
expected labels were not changed
routing criteria were not tuned
```

If a scenario later appeared genuinely ambiguous, the intended methodology was to document that issue and create a new experiment rather than retroactively modify the previous result.

---

## Interpretation principles

The project intentionally avoids several unsupported conclusions.

The experiments do not establish that:

```text
confidence is a calibrated probability of correctness
a single margin threshold works universally
Jev is universally superior to general LLMs
synthetic routing performance guarantees production behavior
```

The correct interpretation is narrower:

> Within the investigated software-engineering routing setting, repeated evaluations and probability margins exposed meaningful decision boundaries that one-shot accuracy alone did not reveal.

---

## Reproducibility

The repository includes:

```text
datasets
routing criteria
experiment scripts
dependency configuration
environment template
```

Raw generated result files are local artifacts and can be regenerated by rerunning the corresponding experiment scripts.

API behavior may change over time because provider infrastructure and hosted models are external dependencies.