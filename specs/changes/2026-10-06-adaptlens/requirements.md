# 7.6 AdaptLens: requirements

Roadmap item: **7.6** (Phase 7). Branch: `feat/7.6-adaptlens`.

## Goal

AdaptLens notices patterns in what the user really does and suggests a preference change. The change applies only when the user accepts, and a dismissed suggestion doesn't come back right away.

## Signals

Signals are noted on the server, where the actions happen. There's no endpoint to write them.

| Signal | Noted when | Value |
|:--|:--|:--|
| `reading_level` | SimplifyCore simplifies an upload (its direct call; chat uses the default level, so it isn't a choice) | the level picked |
| `task_finished` | a task with steps is finished | the share of its steps still open, in percent |

## Rules

Each rule looks at the 5 newest signals of its kind; 3 must agree, and the suggestion must differ from the current preference.

- **Reading level:** the most common level, picked at least 3 times and not the default: "Make level 3 your default?"
- **Step size:** at least 3 of those tasks finished with half or more of their steps open: the next larger size ("Use large steps from now on?"). Nothing is suggested at "large".

Each suggestion carries the reason in plain words ("You picked level 3 for 4 of your last 5 documents. Your default is 5.").

## Answers

- **Accept:** `UserPreferences.update` applies it, and the browser takes the account's answer with `adopt()`, sending nothing back. An AdaptLens entry is logged, with WhyBot's explanation. If the suggestion changed meanwhile, it's a 409 and nothing changes.
- **Not now:** the dismissal is stored and the suggestion stays away for 14 days. Another rule's suggestion can still show.

## Decisions

1. **Rules, not a model.** They're predictable, free, and easy to explain and test; the "why" is the rule's own reason. WhyBot still explains an accepted change in the log. 7.9's evals therefore cover WhyBot; AdaptLens's "sensible suggestions" are these rules' unit tests.
2. **The roadmap's "step-size edits" signal was dropped.** Changing the step size is the preference itself, so there's nothing to suggest from it.
3. **One quiet card on Today, one suggestion at a time.** It sits under the Today heading, not as a pop-up.
4. **Every table keeps a one-column key.** The dismissals table first had a two-column key, which broke account deletion. It now has its own id and a unique (user, key) pair, and `test_account_data.py` asserts the rule for every table.
