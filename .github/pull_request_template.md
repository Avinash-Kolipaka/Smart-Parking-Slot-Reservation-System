## What changed?
<!-- Describe what this PR does in 1-2 sentences -->

## Why?
<!-- Explain the motivation. Link to any related issues: Fixes #123 -->

## Type of Change
- [ ] Bug fix (non-breaking, fixes an issue)
- [ ] New feature (non-breaking, adds functionality)
- [ ] Breaking change (existing functionality changes)
- [ ] Documentation update
- [ ] Refactor / performance improvement
- [ ] Infrastructure / DevOps change

## Testing
- [ ] Existing tests pass (`npm test`)
- [ ] New tests added for this change
- [ ] Manually tested the affected flow
- [ ] Tested in staging

## Security Impact
- [ ] No security impact
- [ ] Changes authentication / authorization logic (describe below)
- [ ] Changes tenant isolation (describe below)
- [ ] Touches secrets or sensitive data (describe below)

**Security notes:**
<!-- If any of the above are checked, explain the impact and mitigation -->

## Database Changes
- [ ] No database changes
- [ ] New model / schema fields added
- [ ] New indexes added
- [ ] Existing indexes modified
- [ ] Migration required

## Deployment Impact
- [ ] No special deployment steps
- [ ] Requires environment variable change (document below)
- [ ] Requires infrastructure change (`terraform apply`)
- [ ] Requires database migration

**Deployment notes:**
<!-- If any deployment steps are needed, describe them clearly -->

## Checklist
- [ ] My code follows the project code style
- [ ] I have self-reviewed my code
- [ ] I have added comments where the logic is non-obvious
- [ ] The change does not expose secrets or credentials
- [ ] I have checked for N+1 queries and performance implications
