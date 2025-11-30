# GitHub Repository Setup Checklist

Use this checklist to ensure your repository is ready for deployment.

## ✅ Pre-Push Checklist

### Files Created
- [x] `.gitignore` - Excludes unnecessary files
- [x] `vercel.json` - Vercel deployment configuration
- [x] `DEPLOYMENT.md` - Detailed deployment guide
- [x] `QUICK_START.md` - Quick deployment guide
- [x] `README.md` - Updated with deployment info
- [x] `.github/workflows/ci.yml` - CI/CD pipeline (already exists)

### Files to Review Before Pushing

1. **`.gitignore`** - Verify it excludes:
   - `node_modules/`
   - `.env` files
   - `coverage/` directories
   - `build/` directories
   - Uploaded files in `backend/uploads/`
   - Data files in `backend/data/` (JSON files)

2. **Environment Variables** - Document in:
   - `backend/.env.example` (create manually if needed)
   - `frontend/.env.example` (create manually if needed)
   - `DEPLOYMENT.md` (already documented)

3. **Sensitive Data** - Ensure these are NOT committed:
   - `.env` files
   - API keys
   - JWT secrets
   - Database credentials

## 🚀 Git Commands to Push

```bash
# 1. Check status
git status

# 2. Add all files (respects .gitignore)
git add .

# 3. Commit
git commit -m "Initial commit - Ready for GitHub and Vercel deployment"

# 4. Create GitHub repository first, then:
git remote add origin https://github.com/YOUR_USERNAME/devops-insurance.git
git branch -M main
git push -u origin main
```

## 📋 Post-Push Checklist

After pushing to GitHub:

- [ ] Verify repository is public/private as desired
- [ ] Check that `.gitignore` is working (no sensitive files visible)
- [ ] Verify CI/CD pipeline runs (check Actions tab)
- [ ] Review GitHub repository structure
- [ ] Update README badges with your repository URL

## 🔐 Security Reminders

Before pushing, ensure:

1. **No secrets in code**: 
   - Check for hardcoded API keys
   - Check for hardcoded JWT secrets
   - Check for database credentials

2. **Environment files excluded**:
   - `.env` files should be in `.gitignore`
   - `.env.local` files should be in `.gitignore`
   - All environment variable files excluded

3. **Sensitive data excluded**:
   - User uploads (already in `.gitignore`)
   - Data files (already in `.gitignore`)
   - Log files (already in `.gitignore`)

## 📝 Next Steps After Push

1. **Deploy Frontend to Vercel**:
   - Follow [QUICK_START.md](./QUICK_START.md)
   - Or see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

2. **Deploy Backend**:
   - Choose Railway, Render, or Heroku
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for options

3. **Configure Environment Variables**:
   - Set in Vercel dashboard (frontend)
   - Set in backend hosting platform

4. **Test Deployment**:
   - Verify frontend loads
   - Verify backend health endpoint
   - Test authentication
   - Test file upload

## 🐛 Common Issues

### Issue: Large files in repository
**Solution**: Check `.gitignore` is working. Remove large files:
```bash
git rm --cached large-file.txt
git commit -m "Remove large file"
```

### Issue: Sensitive data already committed
**Solution**: 
1. Remove from git history (use `git filter-branch` or BFG Repo-Cleaner)
2. Rotate any exposed secrets
3. Update `.gitignore` to prevent future commits

### Issue: CI/CD pipeline fails
**Solution**:
- Check Actions tab for error details
- Verify Node.js version compatibility
- Check test coverage meets 70% threshold
- Review build logs

---

**Ready to deploy?** Follow [QUICK_START.md](./QUICK_START.md) for step-by-step instructions!

