# GSC CSV Analyzer (Production Architecture)

## Stack

React + TypeScript + Vite + TailwindCSS + shadcn/ui compatible primitives + TanStack Table + PapaParse + Recharts + Zod + Zustand.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Folder Structure

- `src/components`: shared UI components (ready for shadcn generation)
- `src/features/upload`: drag & drop/file picker CSV upload
- `src/features/table`: high-performance TanStack table + row virtualization
- `src/features/filters`: reusable filtering engine + SEO presets
- `src/features/charts`: KPI charts
- `src/features/export`: CSV/JSON export services
- `src/services`: parsing/data services
- `src/utils`: Arabic normalization utilities
- `src/types`: shared domain types
- `src/hooks`, `src/lib`: extension points for future modules

## Enterprise SEO Knowledge Graph

The enterprise SEO knowledge graph architecture, PostgreSQL DDL, seed data, page-generation workflow, and NestJS target module layout are documented in [`docs/enterprise-seo-knowledge-graph.md`](docs/enterprise-seo-knowledge-graph.md).

## Production Notes

- UTF-8 Arabic-safe parsing via PapaParse
- Validation pipeline with malformed-row reporting
- Arabic normalization for keyword filtering
- Ready for large datasets (50k+ rows) through memoization and virtualization
- Scalable architecture for AI clustering, GSC API ingestion, trend analysis, semantic grouping
