# Document Deletion Feature - Implementation Progress

## Backend
- [x] 1. Add `deletePDF` to StorageService
- [x] 2. Add `delete` method to DocumentService (ownership check, DB delete first, then storage cleanup)
- [x] 3. Add `deleteDocument` controller handler
- [x] 4. Add `DELETE /:id` route

## Frontend
- [x] 5. Add `deleteDocument` API function
- [x] 6. Add Delete button with confirmation dialog to Documents page
