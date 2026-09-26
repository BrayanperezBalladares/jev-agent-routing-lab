# Jev Agent Routing Lab

An experimental evaluation of **Jev (`typesafe-ai/jev`) as a semantic decision router for software-engineering agents**.

The core question behind this project is simple:

> Can a small specialized evaluator reliably decide what a coding agent should do next?

Instead of asking a large language model to perform every step of an agent workflow, this project explores using Jev for small routing decisions between tools and actions.

---

## The routing problem

A coding agent repeatedly needs to make micro-decisions such as:

- search the repository
- inspect a known implementation file
- run tests after a change
- inspect persistent database state
- ask the user when the intended behavior is undefined

This project represents those decisions using five actions:

```text
SEARCH_CODE
READ_FILE
RUN_TESTS
QUERY_DATABASE
ASK_USER
```

Jev receives the current agent state and returns a structured decision containing:

```text
choice
probabilities
confidence
```

The probability distribution also allows us to calculate the margin between the two most likely actions.

```text
margin = P(top1) - P(top2)
```

---

## Why this matters

A coding agent does not only need intelligence.

It also needs to know:

> What is the correct next action?

For example:

```text
State:
The approved requirement says that usernames from deleted
accounts can be reused, but the implementation responsible
for this behavior has not been located.

Decision:
SEARCH_CODE
```

Jev can therefore act as a semantic routing layer between agent reasoning and tool execution.

---

## Architecture

```mermaid
flowchart TD

    A[Current Agent State] --> B[Jev Decision Router]

    B --> C[Choice]
    B --> D[Probabilities]
    B --> E[Confidence]

    D --> F[Calculate top1 / top2 margin]

    C --> G{Decision sufficiently clear?}
    E --> G
    F --> G

    G -->|Yes| H[Execute selected tool]
    G -->|No| I[Fallback / second evaluation / ask user]

    H --> J[New Agent State]
    J --> A
```

---

## Available actions

| Action | Meaning |
|---|---|
| `SEARCH_CODE` | Search the repository when the relevant implementation location is unknown |
| `READ_FILE` | Inspect a known implementation file |
| `RUN_TESTS` | Verify code that has already been modified |
| `QUERY_DATABASE` | Inspect persistent records, schema, constraints, or database state |
| `ASK_USER` | Request clarification when intended behavior cannot be determined |

These action definitions were frozen during the later experiments to avoid tuning the evaluator after observing failures.

---

## Research questions

This project investigates several questions:

1. How accurately can Jev route software-engineering micro-decisions?
2. How stable is the same decision across repeated evaluations?
3. Can one-shot accuracy hide unstable behavior?
4. What happens near semantic decision boundaries?
5. Can confidence and top-1/top-2 probability margin identify uncertainty?
6. How sensitive is routing to small changes in wording?
7. How does a specialized evaluator compare with simple rules and general-purpose LLMs?

---

## Experimental progression

| Experiment | Purpose |
|---|---|
| Baseline | Initial routing validation |
| Hard cases | More difficult semantic distinctions |
| Holdout | Evaluate frozen routing logic on a new balanced set |
| V4 | Adversarial minimal pairs |
| V5 | Cue-stripped cases with distractors |
| V5 consistency | Repeat low-confidence states |
| V6 | Decision-boundary sweep |
| V7 | Minimal linguistic ablation |
| V8 | Implementation-explicitness ablation |

The later experiments are diagnostic experiments, not independent untouched benchmarks.

---

## Key finding

The most important result was not a high accuracy score.

It was discovering that:

> **One-shot accuracy can hide decision instability.**

A state can produce the expected action once while still lying very close to a semantic decision boundary.

Repeated evaluation exposed states that alternated between:

```text
ASK_USER
SEARCH_CODE
```

even though the input text was identical.

---

## Example: unstable decision

A requirement was already approved:

```text
The current approved requirement says that
the username becomes available again.
```

Repeated evaluations produced both:

```text
SEARCH_CODE
ASK_USER
```

The average separation between the two most likely actions was extremely small.

This indicates that the state did not clearly specify what operational uncertainty remained.

---

## Example: resolving the uncertainty

Adding:

```text
It is unclear where this behavior is implemented.
```

changed the behavior dramatically.

The evaluator consistently routed to:

```text
SEARCH_CODE
```

The experiment suggests that Jev responds strongly not only to the business rule itself, but also to the type of unresolved uncertainty present in the agent state.

---

## Confidence is not accuracy

A major lesson from the experiments is:

```text
low confidence != incorrect
high confidence != universally correct
```

Confidence should not be interpreted as a direct probability that the selected action is correct.

In this project, the top-1/top-2 probability margin was also useful.

```text
very small margin
→ possible decision boundary

large margin
→ strongly separated alternatives
```

This is currently an empirical observation from the tested routing families, not a universal calibration guarantee.

---

## Proposed agent policy

A future agent can use Jev as a routing layer rather than blindly executing every decision.

Conceptually:

```ts
const decision = await evaluate(state)

const margin =
  decision.top1Probability -
  decision.top2Probability

if (margin < ambiguityThreshold) {
  return fallback()
}

return execute(decision.choice)
```

The threshold must be calibrated on the target domain.

Values observed in this project should not be treated as universal production thresholds.

---

## Reliability vs semantic correctness

The experiments separate two different failure classes:

```text
semantic routing error
```

and

```text
provider / infrastructure failure
```

Examples of infrastructure failures observed during testing included HTTP `429` and `503` responses.

These should not be counted as semantic reasoning errors.

Production systems should handle them through retry, fallback, or provider redundancy.

---

## Comparators

The project also experimented with:

- deterministic keyword/rule routing
- a general-purpose OpenAI model
- NVIDIA Nemotron Ultra through NVIDIA NIM

These comparisons are useful context, but they are not perfectly equivalent in latency, cost accounting, infrastructure, or output structure.

---

## Repository structure

```text
cases/      benchmark and diagnostic datasets
src/        evaluator and experiment runners
docs/       methodology and findings
results/    local generated result files
```

Generated result JSON files are ignored by Git because they can be regenerated from the included datasets and scripts.

---

## Setup

Requirements:

```text
Node.js
pnpm
Vercel AI Gateway API key
```

Install dependencies:

```bash
pnpm install
```

Create:

```text
.env
```

from:

```text
.env.example
```

Example:

```env
AI_GATEWAY_API_KEY=your_key_here
NVIDIA_API_KEY=your_key_here
```

Never commit `.env` or real API credentials.

---

## Verification

Run TypeScript validation:

```bash
pnpm typecheck
```

Run the available benchmark commands defined in `package.json`.

Individual diagnostic experiments can also be executed directly with `tsx`.

Example:

```bash
pnpm exec tsx src/v8-implementation-explicitness.ts
```

---

## Methodology

See:

```text
docs/methodology.md
```

for experimental design, freezing rules, measurement methodology, and limitations.

---

## Findings

See:

```text
docs/findings.md
```

for the main observations discovered across the experiments.

---

## Experiment history

See:

```text
docs/experiments.md
```

for the progression from the initial benchmark to the later decision-boundary experiments.

---

## Limitations

This project does **not** demonstrate universal Jev performance.

Important limitations include:

- synthetic software-engineering scenarios
- a small fixed action space
- datasets authored specifically for this research
- later experiments designed after earlier observations
- limited repeated samples per state
- provider and gateway variability

The results should therefore be interpreted as evidence about the investigated routing setting, not as a general benchmark of all agent tasks.

---

## Next step

The next phase of the project is to integrate Jev into a small working coding agent with real tools:

```text
search_code()
read_file()
run_tests()
query_database()
ask_user()
```

The goal is to evaluate whether semantic routing remains useful once decisions are embedded inside a real multi-step agent loop.

---

## Project status

Research phase:

```text
V1–V8 completed
```

Next:

```text
real agent integration
uncertainty gate
fallback routing
live demonstration
```