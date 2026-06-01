# Changelog

All notable changes to the Glossary Management project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added

- **Glossary Term CRUD Operations**
  - Add new glossary terms with name, scope, German translation (DE), Spanish translation (ES), keep-as-is flag, and notes fields
  - Edit existing glossary terms with pre-populated form fields
  - Delete glossary terms with confirmation modal
  - Inline form validation with error messages for required fields, duplicate name detection, and translation requirements

- **Search, Sort, and Pagination**
  - Real-time search filtering across term name, scope, translations, and notes with debounced input
  - Sortable table columns (name, scope, translations, keep-as-is, notes) with ascending/descending toggle
  - Paginated results with configurable page size (default: 10 items per page)
  - Previous/Next page navigation with boundary detection

- **Excel/CSV Import and Export**
  - Import glossary terms from `.xlsx`, `.xls`, and `.csv` files
  - Drag-and-drop file upload zone with click-to-browse fallback
  - File type validation for supported formats
  - Preview table showing up to 50 parsed rows before confirming import
  - Automatic column mapping with case-insensitive header matching
  - Duplicate detection and validation during import with skip/error reporting
  - Export all glossary terms to `.xlsx` file with automatic download

- **Notifications**
  - Success and error snackbar notifications for all CRUD and import/export operations
  - Auto-dismiss after 3 seconds with manual dismiss button
  - ARIA live region for screen reader accessibility

- **Mocked API with localStorage Persistence**
  - Simulated async API layer with configurable delay for realistic UX
  - In-memory cache with automatic localStorage synchronization
  - Maximum term limit of 5,000 entries

- **Accessibility Compliance**
  - ARIA dialog roles and `aria-modal` attributes on all modals
  - Focus trapping within modals with keyboard navigation support
  - `aria-sort` attributes on sortable table column headers
  - `aria-label` attributes on all interactive elements
  - `aria-required` and `aria-invalid` attributes on form fields
  - `aria-live` region for notification announcements
  - Keyboard-accessible sortable headers, buttons, and file upload zone
  - Focus restoration on modal close

- **UI and Styling**
  - Responsive layout with Tailwind CSS utility classes
  - Scope badges with color-coded styling
  - Loading spinner indicators for async operations
  - Empty state messaging when no terms are found
  - Truncated notes column with title tooltip for overflow text

- **Testing**
  - Comprehensive unit tests for glossary repository (CRUD, search, sort, paginate, import, export)
  - Integration tests for mock API layer
  - Component tests for GlossaryTable and TermModal
  - End-to-end application tests covering full CRUD lifecycle, search, sort, pagination, import, and export flows
  - Test utilities with Vitest, React Testing Library, and jsdom environment