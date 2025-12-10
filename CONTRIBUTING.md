# Contributing to QuickSell

Thank you for your interest in contributing to QuickSell! We're excited to work with you.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and constructive environment.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Traffic2umarketing.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Set up your development environment (see [GETTING_STARTED.md](./docs/GETTING_STARTED.md))
5. Make your changes
6. Push to your fork
7. Create a Pull Request

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable names
- Add comments for complex logic

### Naming Conventions
- **Files**: Use kebab-case (e.g., `user-service.ts`)
- **Classes**: Use PascalCase (e.g., `UserService`)
- **Functions/Variables**: Use camelCase (e.g., `getUserById`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_KEY`)
- **Directories**: Use kebab-case (e.g., `user-management`)

### Before Submitting

1. **Test your code**
   ```bash
   npm test
   npm run test:coverage
   ```

2. **Lint your code**
   ```bash
   npm run lint
   npm run format
   ```

3. **Type check**
   ```bash
   npm run typecheck
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Commit Messages

Use clear, descriptive commit messages:

```
type(scope): subject

body

footer
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, etc.

### Examples
```
feat(listings): add bulk photo upload capability

- Added support for uploading up to 100 photos at once
- Implemented progress tracking for batch uploads
- Added validation for image quality

Closes #123
```

```
fix(marketplace): correct eBay price calculation

The price calculation was not accounting for marketplace fees correctly.

Fixes #456
```

## Pull Request Process

1. **Fill in PR description** with:
   - What changes were made
   - Why they were made
   - How to test them

2. **Link related issues** using `Closes #issue-number`

3. **Screenshot/demo** if UI changes

4. **Ensure tests pass** in CI/CD

5. **Respond to code review feedback**

## Testing

### Writing Tests
```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when exists', async () => {
      const user = await userService.getUserById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should return null when user does not exist', async () => {
      const user = await userService.getUserById(999);
      expect(user).toBeNull();
    });
  });
});
```

### Test Coverage Goals
- Aim for >80% coverage for critical paths
- Test error cases
- Test edge cases
- Mock external dependencies

## Documentation

### Code Comments
```typescript
/**
 * Calculate estimated price for an item based on market data
 * @param category - Product category
 * @param condition - Item condition
 * @param features - Product features for comparison
 * @returns Estimated price with confidence score
 */
export async function estimatePrice(
  category: string,
  condition: string,
  features: Record<string, any>
): Promise<PriceEstimate> {
  // Implementation
}
```

### README Updates
Update README.md if you add new features that users should know about.

### API Documentation
Document new API endpoints with:
- HTTP method
- Endpoint path
- Required authentication
- Request parameters
- Response format
- Error codes

## Feature Development Workflow

### 1. Feature Planning
- Create GitHub issue with feature description
- Discuss implementation approach
- Get approval before starting

### 2. Implementation
- Create feature branch from `main`
- Implement with tests
- Update documentation
- Keep commits atomic and descriptive

### 3. Code Review
- Submit PR
- Address feedback
- Ensure CI passes
- Get approval from maintainers

### 4. Merge
- Squash commits if needed
- Delete feature branch
- Deploy to staging

### 5. Verification
- Test in staging environment
- Verify marketplace integrations work
- Check performance impact

## Bug Reports

When reporting bugs:
1. **Check if already reported** - search existing issues
2. **Include steps to reproduce**
3. **Expected vs actual behavior**
4. **Screenshots if applicable**
5. **Environment details** (OS, Node version, etc.)

Example:
```
### Description
Login button is not working on Firefox

### Steps to reproduce
1. Open app in Firefox
2. Enter credentials
3. Click login button
4. (Nothing happens)

### Expected behavior
Should redirect to dashboard

### Actual behavior
Page doesn't respond

### Environment
- OS: macOS 13.3
- Browser: Firefox 113
- Node: 18.15
```

## Performance Considerations

When making changes:
- Consider database query performance
- Optimize image sizes
- Cache frequently accessed data
- Use pagination for large datasets
- Profile before and after

## Security Considerations

- Never commit secrets or API keys
- Use environment variables
- Validate all user input
- Use parameterized queries (prevent SQL injection)
- Follow OWASP guidelines
- Report security issues privately to security@quicksell.app

## Database Changes

When modifying database schema:
1. Create migration file: `npm run migrate:make -- your-migration-name`
2. Implement up() and down() functions
3. Test migration with data
4. Document schema changes
5. Update DATABASE.md

## API Changes

When adding/modifying API endpoints:
1. Update API documentation
2. Update client libraries if needed
3. Consider backward compatibility
4. Add deprecation notices for removed endpoints
5. Update examples

## Deployment

After PR is merged:
1. Changes are automatically deployed to staging
2. Verify in staging environment
3. Request production deployment

## Review Process

Maintainers will review:
- Code quality and style
- Test coverage
- Documentation completeness
- Performance impact
- Security implications
- Backwards compatibility

## Questions?

- Comment on related GitHub issues
- Create a discussion thread
- Email support@quicksell.app

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Thank you for helping make QuickSell better! 🚀
