# Changelog

## [1.1.0] - 2026-01-15

### Added
- **Path parameter**: Added optional `path` parameter to save generated images directly to disk
- **Multi-image support**: Now handles multiple images returned from a single API call
  - Previously only processed the first image from the first candidate
  - Now processes all images from all candidates and parts
- **Automatic directory creation**: Creates the target directory if it doesn't exist
- **Timestamped filenames**: Images are saved with unique timestamped names (e.g., `image_1737023456789_1.png`)

### Changed
- Updated tool description to reflect new save-to-disk capability
- Enhanced response messages to show number of images generated
- Improved documentation with examples for both base64 and file-saving modes

### Technical Details
- Added Node.js `fs` and `path` modules for file operations
- Refactored image extraction logic to handle multiple candidates and parts
- File naming format: `image_{timestamp}_{index}.{extension}`

## [1.0.0] - 2026-01-15

### Initial Release
- Generate images using Gemini Banana API
- Support for text prompts and negative prompts
- Configurable aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4)
- Returns base64 encoded images
- Environment variable configuration
- MCP protocol support
