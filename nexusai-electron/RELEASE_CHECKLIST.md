# Release Checklist

Use this checklist before releasing a new version of NexusAI Gateway.

## Pre-Release

### Code Quality
- [ ] All features working as expected
- [ ] No console errors in development mode
- [ ] All services start and stop correctly
- [ ] Chat interface works with both providers
- [ ] Token configuration works for both services

### Testing
- [ ] Test on clean Windows 10 installation
- [ ] Test on clean Windows 11 installation
- [ ] Test with Python 3.8, 3.9, 3.10, 3.11, 3.12
- [ ] Test installer with and without Python pre-installed
- [ ] Test uninstaller
- [ ] Test upgrade from previous version

### Documentation
- [ ] Update version number in `package.json`
- [ ] Update version number in `USER_GUIDE.md`
- [ ] Update `README.md` with new features
- [ ] Update `BUILD.md` if build process changed
- [ ] Create CHANGELOG.md entry

### Assets
- [ ] Icon file exists at `assets/icon.ico`
- [ ] Icon has all required sizes (256, 128, 64, 48, 32, 16)
- [ ] Screenshots are up to date
- [ ] LICENSE.txt is present

## Build Process

### Preparation
- [ ] Clean build environment
  ```bash
  rmdir /s /q dist
  rmdir /s /q dist-installer
  rmdir /s /q node_modules
  ```
- [ ] Fresh install of dependencies
  ```bash
  npm install
  python -m pip install -r requirements.txt
  ```

### Build
- [ ] Run build script
  ```bash
  build.bat
  ```
- [ ] Verify no build errors
- [ ] Check installer size (should be 200-300MB)
- [ ] Verify installer file name format

### Testing Built Installer
- [ ] Install on clean Windows machine
- [ ] Verify all files are copied correctly
- [ ] Verify shortcuts are created
- [ ] Launch application from shortcut
- [ ] Test all features in installed version
- [ ] Check for any missing dependencies
- [ ] Verify uninstaller works

## Release

### GitHub Release
- [ ] Create new tag: `v1.0.0`
- [ ] Create GitHub release
- [ ] Upload installer to release
- [ ] Write release notes
- [ ] Mark as pre-release if beta

### Release Notes Template
```markdown
## NexusAI Gateway v1.0.0

### New Features
- Feature 1
- Feature 2

### Improvements
- Improvement 1
- Improvement 2

### Bug Fixes
- Fix 1
- Fix 2

### Installation
Download `NexusAI Gateway-Setup-1.0.0.exe` and run the installer.

### Requirements
- Windows 10/11 (64-bit)
- Python 3.8+

### Full Changelog
See [CHANGELOG.md](CHANGELOG.md)
```

### Distribution
- [ ] Upload to GitHub Releases
- [ ] Update download links in README
- [ ] Announce on relevant platforms
- [ ] Update documentation website (if applicable)

## Post-Release

### Monitoring
- [ ] Monitor for installation issues
- [ ] Check for bug reports
- [ ] Respond to user feedback
- [ ] Update FAQ if needed

### Metrics
- [ ] Track download count
- [ ] Monitor error reports
- [ ] Collect user feedback

## Version Numbering

Follow Semantic Versioning (SemVer):

- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backwards compatible
- **Patch** (1.0.1): Bug fixes, backwards compatible

## Rollback Plan

If critical issues are found:

1. Mark release as "Pre-release" on GitHub
2. Add warning to README
3. Prepare hotfix
4. Release patch version
5. Notify users of update

## Code Signing (Future)

For production releases, consider:

- [ ] Obtain code signing certificate
- [ ] Configure electron-builder with certificate
- [ ] Sign installer
- [ ] Verify signature

## Notes

- Always test on clean machines
- Keep installer size reasonable
- Maintain backwards compatibility
- Document breaking changes clearly
- Provide migration guides for major versions
