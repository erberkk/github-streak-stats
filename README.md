# 🎨 Modern GitHub Streak Stats Widget

Ultra-modern, animated GitHub streak statistics widget with cutting-edge UI/UX design. Perfect for GitHub README profiles!

![Preview](https://via.placeholder.com/600x300/0a0a0a/00d4ff?text=Modern+GitHub+Widget+Preview)

## ✨ Features

- 🚀 **Ultra-Modern Design** - Sleek dark theme with gradient backgrounds
- 🎭 **Smooth Animations** - Framer Motion + React Spring animations
- 🎨 **Material-UI Integration** - Professional component library
- 🔥 **Real-time Streaks** - Accurate current & longest streak calculation
- 📊 **Comprehensive Stats** - Total contributions, repos, followers
- 🔒 **Private Repo Support** - GitHub token ile private repo'ları dahil et
- 📏 **Fixed Dimensions** - Perfect 1000px × 320px widget size
- ⚡ **Lightning Fast** - Optimized performance with caching
- 🎯 **GitHub README Ready** - Perfect for profile README files

## 🎯 Live Demo

- **Main Demo:** [https://your-domain.com/demo](https://your-domain.com/demo)
- **Your Profile:** [https://your-domain.com/user/erberkk](https://your-domain.com/user/erberkk)
- **Any User:** [https://your-domain.com/user/username](https://your-domain.com/user/username)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

## 🎨 Usage Examples

### Direct URL Access
```
https://your-domain.com/user/erberkk
```

### Query Parameter
```
https://your-domain.com/?user=erberkk
```

### GitHub README Usage
```markdown
<!-- GitHub Streak Widget -->
<img src="https://your-domain.com/user/erberkk" alt="GitHub Streak Widget" width="1000" height="320" />

<!-- Or embed in HTML -->
<iframe src="https://your-domain.com/user/erberkk" width="1000" height="320" frameborder="0"></iframe>
```

### Direct Image URL
```
https://your-domain.com/user/erberkk
```

**Note:** Widget automatically renders as an image when accessed directly, perfect for GitHub README files.

## 🔑 Private Repository Support

Add your GitHub token to include private repositories:

### 1. Create GitHub Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create new token with these scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:org` - Read org membership
   - ✅ `read:user` - Read user profile

### 2. Add to Environment
```bash
# Create .env.local file
echo "GITHUB_TOKEN=ghp_your_token_here" > .env.local
```

### 3. For Vercel Deployment
Add `GITHUB_TOKEN` in Vercel dashboard → Project Settings → Environment Variables

## 🎭 Design Features

- **Gradient Backgrounds** - Dynamic color gradients
- **Hover Effects** - Interactive animations on hover
- **Loading Animations** - Smooth loading states
- **Glass Morphism** - Modern frosted glass effects
- **Typography** - JetBrains Mono font for developer aesthetic
- **Color Scheme** - Cyan (#00d4ff) & Pink (#ff4081) accents

## 📏 Widget Specifications

- **Dimensions:** 1000px × 320px (perfect for GitHub README)
- **Design:** Dark theme with gradient backgrounds
- **Animations:** Framer Motion + React Spring
- **Components:** Material-UI with custom styling
- **Data:** Real-time GitHub contributions & streaks

## 🎨 Widget Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [Avatar]  Erberk Akbulut @erberkk                                🔥 1,250 🔥 21 ⭐ 45 📅 180     │
│  "execute order 66"                                                                          │
│                                                                                             │
│  [Total Contributions] [Current Streak] [Longest Streak] [Active Days]                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 API Endpoints

### Get User Stats
```
GET /api/github/[username]
```

**Response:**
```json
{
  "user": {
    "login": "erberkk",
    "name": "Erberk Akbulut",
    "avatar_url": "...",
    "bio": "...",
    "public_repos": 17,
    "followers": 15,
    "following": 21
  },
  "contributions": {
    "totalContributions": 1250
  },
  "streak": {
    "current": 21,
    "longest": 45,
    "total": 180
  },
  "_metadata": {
    "includesPrivateRepos": true,
    "dataSource": "Authenticated API"
  }
}
```

## 🛠️ Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Framer Motion** - Animation library
- **React Spring** - Physics-based animations
- **Lucide React** - Beautiful icons
- **Tailwind CSS** - Utility-first CSS
- **GitHub GraphQL API** - Data source

## 📱 Responsive Design

- **Mobile First** - Optimized for all screen sizes
- **Tablet Support** - Perfect tablet experience
- **Desktop Enhanced** - Full desktop features

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Auto-deploy with environment variables

### Other Platforms
Compatible with any Node.js hosting platform.

## 🎨 Customization

### Colors
Modify colors in `src/components/GitHubStreakWidget.tsx`:
```typescript
const darkTheme = createTheme({
  palette: {
    primary: { main: '#00d4ff' },    // Cyan accent
    secondary: { main: '#ff4081' },  // Pink accent
    background: {
      default: '#0a0a0a',           // Dark background
      paper: '#1a1a1a'              // Card background
    }
  }
})
```

### Animations
Customize animations in the component using Framer Motion props.

## 📈 Performance

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js built-in optimization
- **Caching** - Smart caching strategies
- **Lazy Loading** - Components load as needed

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

- GitHub API for providing amazing data
- Material-UI for beautiful components
- Framer Motion for smooth animations
- React Spring for physics-based animations

---

**Made with ❤️ for the developer community**
