
# GitHub Actions - Disabled

All workflows in this directory are disabled to prevent commit/PR conflicts.

To enable a workflow:
1. Move it from `disabled/` to parent `.github/workflows/`
2. Update configuration as needed
3. Test thoroughly before merging

## Available (Disabled) Workflows

- `ci.yml` - Continuous Integration
- `deploy.yml` - Deployment automation
- `test.yml` - Test suite runner

## Why Disabled?

GitHub Actions and automated bots can create conflicts during active development:
- Automatic PR creation
- CI/CD pipeline failures during rapid iteration
- Dependency update conflicts

## Re-enabling Workflows

When the project is stable and ready for automated workflows:

1. Review and update workflow configurations
2. Move desired workflows from `disabled/` to `.github/workflows/`
3. Test workflows in a separate branch first
4. Monitor for conflicts and adjust as needed

## Manual Testing

Until workflows are re-enabled, use manual testing:

```bash
# Run tests
yarn test

# Build project
yarn build

# Type checking
yarn tsc --noEmit

# Linting
yarn lint
```
