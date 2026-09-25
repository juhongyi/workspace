Keep code, names, and responsibilities clear; modules focused; boundaries and dependencies explicit.\
Apply OOP, modular design, SRP, DRY, KISS, and YAGNI; maintain high cohesion and low coupling.\
Use TDD for behavior changes; cover meaningful success, failure, boundary, and edge cases.\
Run focused tests and the full suite; fix regressions; report unrelated failures.\
Make atomic, reviewable commits.

Development environment: all development runs in the Compose environment defined in compose.yaml.\
If a port conflicts, override it with a temporary port so other containers and resources are not disturbed and work does not collide.

PRs: English titles; clear, concise Korean bodies that respect reviewers' time by providing enough context.\
Commit and PR titles must be natural English sentences, not prefixed with tags such as `feat:` or `docs:`.
