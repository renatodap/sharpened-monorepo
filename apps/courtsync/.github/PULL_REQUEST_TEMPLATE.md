# CourtSync Pull Request

## 🎾 Description
Brief description of the changes and their purpose.

## 🔄 Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🧪 Test improvements
- [ ] 🔧 Configuration or build changes
- [ ] ♻️ Code refactoring

## 🏗️ Changes Made
- [ ] List specific changes made
- [ ] Include any architectural decisions
- [ ] Note any performance implications

## 🧪 Testing Checklist
- [ ] Unit tests added/updated and passing
- [ ] Integration tests added/updated and passing  
- [ ] E2E tests added/updated and passing
- [ ] Manual testing completed on mobile
- [ ] Manual testing completed on desktop
- [ ] Tested offline functionality (if applicable)
- [ ] Tested with different user roles (coach/captain/player)

## 📱 Mobile & Accessibility
- [ ] Responsive design tested on mobile devices
- [ ] Touch targets meet 44px minimum requirement
- [ ] Keyboard navigation works properly
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] PWA functionality unaffected

## 🔐 Security & RLS
- [ ] Row Level Security policies reviewed and appropriate
- [ ] Input validation implemented where needed
- [ ] Authentication/authorization properly enforced
- [ ] No sensitive data exposed in client-side code
- [ ] Rate limiting considered for new endpoints

## 📊 Performance
- [ ] Bundle size impact analyzed (budget: 200KB JS)
- [ ] Core Web Vitals maintained (LCP < 2.5s)
- [ ] Database queries optimized
- [ ] Images optimized and properly sized
- [ ] Lighthouse score >90 maintained

## 📚 Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Component documentation updated
- [ ] CLAUDE.md updated if development patterns changed
- [ ] Architecture docs updated for significant changes

## 🚀 Feature Flags & Deployment
- [ ] New features behind appropriate feature flags
- [ ] Environment variables documented in .env.example
- [ ] Database migrations included (if applicable)
- [ ] Deployment considerations documented

## 💰 Budget Compliance
- [ ] No new paid dependencies added
- [ ] Supabase free tier limits respected
- [ ] Local development alternatives provided
- [ ] Cost implications documented

## 🔗 Related Issues
Fixes #(issue number)
Related to #(issue number)

## 📸 Screenshots/GIFs
<!-- Add screenshots or GIFs showing the changes, especially for UI changes -->

## 🧑‍💻 Reviewer Notes
<!-- Add any specific notes for reviewers, areas of concern, or requests for feedback -->

## ✅ Final Checklist
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

---

**⚡ Strike Team Member**: [Your Role - e.g., Frontend Lead, Backend Engineer, etc.]
**🕐 Estimated Review Time**: [e.g., 15 minutes, 1 hour]
**🚨 Priority**: [Low/Medium/High/Critical]