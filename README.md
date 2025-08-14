## Salesforce Sandbox Refresh Utility

This project provides scripts and utilities to automate and manage Salesforce sandbox refresh operations, including metadata retrieval and user management.

### Features
- Retrieve and store Salesforce static resources metadata
- Batch processing for large metadata sets
- Utilities for user and certificate management
- Configurable paths and queries

### Project Structure

```
src/
	postRefresh.js           # Post-refresh automation script
	preRefresh.js            # Pre-refresh automation script
	config/
		paths.js               # Path configuration
		queries.js             # Query definitions
	enums/
		constants.js           # Enum/constants definitions
	files/
		metadata/
			staticResources.json # Output for static resources metadata
		sobjects/
			user.json            # Output for user sObject data
	services/
		metadata/
			certificateService.js
			customMetadataService.js
			staticResources.js   # Static resources retrieval logic
		sobjects/
			userService.js       # User management logic
	utils/
		metadataUtils.js       # Utility functions for metadata
enums.js                   # Project-wide enums
package.json               # Project dependencies and scripts
```

### Prerequisites
- Node.js (v14 or higher recommended)
- Salesforce credentials with API access

### Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Configure environment variables as needed (e.g., `API_VERSION`).

### Usage
- Run pre-refresh or post-refresh scripts as needed:
	```bash
	node src/preRefresh.js
	node src/postRefresh.js
	```
- Outputs will be saved in the `src/files/metadata/` and `src/files/sobjects/` directories.

### Customization
- Update `src/config/paths.js` to change file output locations.
- Modify `src/config/queries.js` for custom Salesforce queries.

### License
This project is for internal use. Contact the author for licensing details.
