# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-02-22

### Added

- Added quantity input controls
- Added a placeholder when no items are available in the Ingredients select field

### Changed

- Made the unit price input editable

## [1.2.0] - 2025-02-21

### Added

- Enabled dark mode for the entire application

## [1.1.0] - 2025-02-19

### Added

- Added pull-to-refresh to refresh data in data tables

### Changed

- Sorted records from latest to oldest by default

## [1.0.0] - 2025-02-17

### Getting Started

- Introduced username and password login.
- Added eye icon to toggle password visibility.
- Provided test credentials for demonstration purposes.
  - Username: `testadmin`
  - Password: `Test123!`

### Admin Features

- Implemented Daily Count section for managing delivery records.
  - Admins can now view, create, edit, and delete delivery records.
- Wastes pages are currently view-only.
  - Adding, editing, and deleting features will be implemented after
    further discussion.

### Upcoming Features

- Password reset functionality will be added in the next update.
- Thermal printer support for delivery records will be included in the next
  update.
- Authentication features are under development and will be released soon.
- User profile settings for logged-in users will be added in upcoming
  updates.
- A new dashboard-style landing page will be implemented after branch
  selection.

### Areas for Improvement

- The application's user interface currently follows a web-based design.
  - Future updates will implement native mobile UI components for a better
    user experience.
- The login page needs clear error messages.
  - Implement error messages when users enter incorrect credentials or try
    to access non-existent accounts.
- The app requires user feedback notifications (toasts).
  - Implement toasts to confirm successful record creation, editing, and
    deletion.
- Enhance the web version's user interface for better usability.
- Customize the color theme based on client requirements (optional).

### Try Inventory Lite

- Android: Coming soon
- iOS: Coming soon
- Web: Test the app here → [Inventory Lite](https://inventory-lite.vercel.app)
