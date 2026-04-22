# Contributing to Spike

First off, thank you for considering contributing to Spike! It's people like you that make Spike such a great tool for the AI community.

## 🌟 Ways to Contribute

There are many ways you can contribute to Spike:

- **Report bugs** and issues
- **Suggest new features** or enhancements
- **Improve documentation**
- **Write code** to fix bugs or add features
- **Help others** in discussions and issues
- **Share Spike** with others who might find it useful

## 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g., Windows 11]
 - Spike Version: [e.g., 1.0.0]
 - Python Version: [e.g., 3.11]

**Logs**
Please attach relevant logs from the Logs tab in Spike.

**Additional context**
Add any other context about the problem here.
```

## 💡 Suggesting Features

Feature requests are welcome! Before suggesting a feature:

1. **Check existing issues** to see if it's already been suggested
2. **Consider the scope** - does it fit Spike's goals?
3. **Provide details** - explain the use case and benefits

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context, mockups, or examples.
```

## 🔧 Development Setup

### Prerequisites

- Windows 10/11 (64-bit)
- Node.js 16+ and npm
- Python 3.8+
- Git

### Setting Up Your Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/spike.git
   cd spike
   ```

2. **Install Node.js dependencies**
   ```bash
   cd nexusai-electron
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

This will start:
- Vite dev server on `http://localhost:5173`
- Electron app with hot reload

### Project Structure

```
spike/
├── nexusai-electron/
│   ├── electron/              # Electron main process
│   │   ├── main.js           # Main process entry
│   │   └── preload.js        # Preload script
│   ├── src/                   # React frontend
│   │   ├── components/       # React components
│   │   ├── styles/           # CSS styles
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # React entry point
│   ├── python/               # Python services
│   │   ├── nexusai/          # Core logic
│   │   └── services/         # AI bridges
│   └── assets/               # Icons and images
```

## 📝 Coding Guidelines

### TypeScript/React

- Use **TypeScript** for type safety
- Follow **React hooks** best practices
- Use **functional components** over class components
- Keep components **small and focused**
- Use **Tailwind CSS** for styling
- Follow the existing **naming conventions**

### Python

- Follow **PEP 8** style guide
- Use **type hints** where appropriate
- Write **docstrings** for functions and classes
- Keep functions **small and focused**
- Use **async/await** for I/O operations

### General

- Write **clear commit messages**
- Add **comments** for complex logic
- Update **documentation** for new features
- Add **tests** when applicable
- Keep **dependencies minimal**

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow the coding guidelines
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

   Commit message prefixes:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes
   - `Refactor:` for code refactoring
   - `Test:` for adding tests

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Wait for review

### Pull Request Template

```markdown
**Description**
Brief description of what this PR does.

**Type of change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**How Has This Been Tested?**
Describe the tests you ran and how to reproduce them.

**Checklist:**
- [ ] My code follows the style guidelines
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes on Windows

**Screenshots (if applicable)**
Add screenshots to demonstrate the changes.
```

## 🧪 Testing

### Manual Testing

Before submitting a PR, please test:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test all features**
   - Start/stop services
   - Chat interface
   - Token management
   - Logs viewer
   - Window controls

3. **Check for errors**
   - Look for console errors
   - Check application logs
   - Test edge cases

### Automated Testing

We're working on adding automated tests. Contributions to testing infrastructure are welcome!

## 📚 Documentation

Good documentation is crucial. When adding features:

- Update the **README.md** if needed
- Update the **USER_GUIDE.md** for user-facing features
- Add **inline comments** for complex code
- Update **API documentation** if applicable

## 🎨 Design Guidelines

Spike has a specific aesthetic:

- **Color Scheme**: Beige/sand tones (`#E4E0D5`, `#D4CFC1`)
- **Typography**: Crimson Text (serif) for headings, Inter (sans) for body
- **Spacing**: Generous padding and margins
- **Animations**: Smooth, subtle transitions
- **Icons**: Lucide React icons

When adding UI elements, maintain consistency with the existing design.

## 🤔 Questions?

If you have questions about contributing:

- Open a **Discussion** on GitHub
- Check existing **Issues** and **Pull Requests**
- Read the **documentation**

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

- **Be respectful** and considerate
- **Be collaborative** and helpful
- **Be patient** with newcomers
- **Accept constructive criticism** gracefully
- **Focus on what's best** for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## 🙏 Recognition

Contributors will be recognized in:

- The project README
- Release notes
- GitHub contributors page

Thank you for making Spike better! 🚀
