# FlipWish Git Workflow

This document outlines the Git workflow currently utilized in the development and maintenance of FlipWish, ensuring stable and traceable version control.

## Branching Strategy

The project employs a structured branching model:
- **`main`**: The primary stable branch that reflects the production-ready state of the application.
- **Feature Branches**: New developments, migrations, and fixes are implemented in dedicated feature branches before being merged into the main branch. 

### Current Active Feature Branch
- **`feature/postgresql-neon-migration`**: This branch was created specifically for the migration of relational data (Products, Cart, Wishlist) from MongoDB to a Neon PostgreSQL database using Prisma. All related development and bug fixes occurred within this isolated environment.

## Commit Conventions
We use meaningful, atomic commits to ensure clear project history. Examples from our recent history on the migration branch:

- `feat: migrate FlipWish to Neon PostgreSQL and implement JS concepts`
- `fix: enable cors`
- `fix: restore controller exports after postgres migration`
- `fix: restore exact MongoDB API payload structures for Prisma endpoints`

These commits separate feature development from bug fixes, providing a granular and understandable history.

## Pull Request and Merge Workflow
1. A developer creates a feature branch (e.g., `feature/postgresql-neon-migration`) from `main`.
2. The developer makes atomic commits representing logical units of work.
3. Once the feature is complete and tested, a Pull Request (PR) is opened against `main`.
4. After review and successful testing, the feature branch is merged into `main`.

*Note: This workflow is actively demonstrated in the repository's Git history and branches.*
