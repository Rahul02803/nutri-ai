# ZenLog — Premium Design System & UI Specifications

ZenLog represents a state-of-the-art, premium, and luxury-grade AI-powered nutrition and physique transformation platform. Inspired by the clean structural grids of **Stripe**, the ultra-minimalist focus of **Cal AI**, the clean data visualizations of **Apple Health**, and the spatial elegance of **Linear** and **Notion**, this system establishes a futuristic and trustworthy experience.

---

## 🎨 ZenLog AI-Powered Dashboard Mockup

Below is the validated high-fidelity dark-theme dashboard design mock for the ZenLog premium startup:

![ZenLog AI-Powered Premium SaaS Dashboard Mockup](https://raw.githubusercontent.com/Rahul02803/nutri-ai/main/public/zenlog_dashboard.png)

---

## 🎨 Unified Color Token System

| Token Name | Light Mode Value | Dark Mode Value | System Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#FFFFFF` (Pure White) | `#0A0A0A` (Deep Obsidian) | Core viewport background |
| **Secondary Background** | `#F8F9FB` (Soft Sky-Gray) | `#111111` (Matte Charcoal) | Outer gutters & container fills |
| **Card Background** | `#FFFFFF` | `#161616` (Pitch-Slate) | Floating panel widgets & sections |
| **Primary Text** | `#111827` (Rich Graphite) | `#FFFFFF` (Pristine White) | Headings, logs, & key metrics |
| **Secondary Text** | `#6B7280` (Muted Slate) | `#A1A1AA` (Cool Gray) | Labels, details, & helpers |
| **Borders** | `#E5E7EB` (Silver Hairline) | `#27272A` (Charcoal Hairline) | Grids, segment bounds, & separators |
| **Primary Accent** | `#3B82F6` (Electric Blue) | `#4F8CFF` (Bright Azure) | Highlights, circular progress tracks |
| **Success** | `#22C55E` (Emerald Mint) | `#22C55E` (Emerald Mint) | Verified food indicators, logged goals |
| **Warning** | `#F59E0B` (Amber) | `#F59E0B` (Amber) | Calibration triggers & alert announcements |
| **Error** | `#EF4444` (Rose-Red) | `#EF4444` (Rose-Red) | Out-of-budget markers, deletions |

---

## 📐 Structural UI & UX Guidelines

### 1. Rounded Borders & Canvas Flow
- **Radius Token**: All primary card components, modals, sheets, and action buttons must strictly apply a **`20px` border-radius** (`rounded-2.5xl` or custom `border-radius: 20px`).
- **Gutter Fills**: Fills inside grids must remain flat, maintaining a consistent `1px` border separator. Avoid double borders.
- **Glassmorphic Accents**: On fixed header overlays or floating banners, apply a frosted glass filter:
  `background: rgba(22, 22, 22, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.08);`

### 2. Typographic Grid (Inter Sans-Serif)
- Headings must utilize high-end letter-spacing (`tracking-tight` or `-0.03em`) and high weights (`font-black` or `font-extrabold`).
- Maintain a clean hierarchical layout:
  *   **Hero Headers**: `72px` (Line height: `1.02`)
  *   **Section Headers**: `28px` (Line height: `1.15`)
  *   **Widget Labels**: `10px` (All-caps, bold, tracking-widest)
  *   **Descriptions / Body**: `13px` (Line height: `1.5` for effortless readability)

### 3. Apple-Inspired Micro-Interactions
- **Interactive Calorie Slider**: Transitions must remain smooth. As the serving slider drags:
  *   Values update instantly on the client side with zero API calls.
  *   Circular progress Dashoffsets transition using quadratic easing.
- **Accordion Segment FAQs**: Hovering FAQ blocks applies a subtle transform transition (`translate-y-[-2px]`), sliding down content block grids using Framer Motion with standard `duration: 0.2` springs.

---

## 🎯 ZenLog Aesthetics Checklist

- `[x]` **Large White Space**: Keep at least 40% of the screen blank to maximize high-contrast readability.
- `[x]` **No Clutter**: Avoid dense charts, bright neon grids, or aggressive fitness visual tags.
- `[x]` **Subtle Shadows**: Apply only soft, clean drop shadows (`rgba(0, 0, 0, 0.02)` for light, `rgba(0, 0, 0, 0.2)` for dark) to denote depth.
- `[x]` **Focus on Usability**: Ensure every visual statistic (e.g. Protein tracked vs target) is instantly scannable within 0.5 seconds.

<!-- Deploy trigger: 2026-06-05T19:12:00Z -->

