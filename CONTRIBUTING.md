# Contributing to ParkOps

We welcome contributions! Please follow these guidelines to help keep the project clean and maintainable.

## Branching Strategy
- `main`: Production-ready code.
- `staging`: Pre-production testing environment.
- Feature branches: Created from `main` using the format `feature/your-feature-name` or `bugfix/issue-description`.

## Development Setup
1. Clone the repository and install dependencies per the [README](README.md).
2. Set up your local `.env` files from `.env.example`.
3. Use `npm run dev` to start the frontend and backend concurrently.

## Commit Expectations
We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring without feature changes
- `test:` for adding missing tests

## Pull Requests
1. Ensure your branch is up to date with `main`.
2. Run `npm test` and `npm run lint` locally before submitting.
3. Provide a clear description of the problem solved or feature added.
4. If your PR introduces architectural changes, please submit an ADR in `docs/adr/` first.

## Testing
Always include unit tests for new backend controllers and services. Concurrency critical paths (like booking) must have integration tests to prevent regression.
