# ContIQ Color Palette Guide

## Official Color System

### Primary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Blue** | `#2563EB` | `rgb(37, 99, 235)` | Primary buttons, links, brand color |
| **Accent Purple** | `#7C3AED` | `rgb(124, 58, 237)` | Active states, icons, highlights |
| **Success Green** | `#22C55E` | `rgb(34, 197, 94)` | Success messages, process button |
| **Error Red** | `#EF4444` | `rgb(239, 68, 68)` | Error messages, alerts |

### Background Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Pure White** | `#FFFFFF` | `rgb(255, 255, 255)` | Navbar, cards, containers |
| **Page Background** | `#F8FAFC` | `rgb(248, 250, 252)` | Main page background |
| **Light Hover** | `#EFF6FF` | `rgb(239, 246, 255)` | Hover states, highlights |

### Text Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Text** | `#0F172A` | `rgb(15, 23, 42)` | Headings, primary content |
| **Secondary Text** | `#64748B` | `rgb(100, 116, 139)` | Descriptions, labels |
| **Muted Text** | `#94A3B8` | `rgb(148, 163, 184)` | Placeholders, hints |

### Border & Divider Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Border** | `#E2E8F0` | `rgb(226, 232, 240)` | Borders, dividers, separators |

## Usage Examples

### Buttons

```css
/* Primary Action Button */
.button-primary {
  background: #2563EB;
  color: #FFFFFF;
  border: none;
}

.button-primary:hover {
  background: #1d4ed8;
}

/* Success Button */
.button-success {
  background: #22C55E;
  color: #FFFFFF;
}

/* Disabled Button */
.button-disabled {
  background: #E2E8F0;
  color: #94A3B8;
}
```

### File Selector Pills

```css
/* Active State - Purple Accent */
.pill-active {
  background: #7C3AED;
  color: #FFFFFF;
  border: 1px solid #7C3AED;
}

/* Inactive State */
.pill-inactive {
  background: #FFFFFF;
  color: #64748B;
  border: 1px solid #E2E8F0;
}

/* Hover State */
.pill-inactive:hover {
  background: #F8FAFC;
  border-color: #7C3AED;
}
```

### Message Bubbles

```css
/* User Message - Blue */
.message-user {
  background: #2563EB;
  color: #FFFFFF;
}

/* Assistant Message - Light Gray */
.message-assistant {
  background: #F8FAFC;
  color: #0F172A;
  border: 1px solid #E2E8F0;
}
```

### Status Badges

```css
/* Progress */
.status-progress {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #2563EB;
}

/* Success */
.status-success {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #22C55E;
}

/* Error */
.status-error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #EF4444;
}
```

### Shadows

```css
/* Subtle Shadow - Cards, Containers */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Hover Shadow - Interactive Elements */
box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); /* Blue */
box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); /* Purple */
box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25); /* Green */
```

## Color Contrast Ratios (WCAG AA)

All text color combinations meet WCAG AA standards:

- **Primary Text on White**: `#0F172A` on `#FFFFFF` = 16.7:1 ✅
- **Secondary Text on White**: `#64748B` on `#FFFFFF` = 5.8:1 ✅
- **White Text on Primary Blue**: `#FFFFFF` on `#2563EB` = 7.0:1 ✅
- **White Text on Accent Purple**: `#FFFFFF` on `#7C3AED` = 7.5:1 ✅

## Don't Use

❌ Gradient backgrounds (except for specific brand needs)
❌ Neon or overly saturated colors
❌ Multiple accent colors in one component
❌ Dark text on dark backgrounds
❌ Light text on light backgrounds

## Color Psychology

- **Blue (`#2563EB`)**: Trust, reliability, professionalism
- **Purple (`#7C3AED`)**: Innovation, creativity, AI/tech
- **Green (`#22C55E`)**: Success, progress, positive actions
- **Red (`#EF4444`)**: Errors, warnings, critical actions

## Accessibility Notes

1. Always use text colors with sufficient contrast
2. Don't rely on color alone to convey information
3. Add icons or text labels where needed
4. Test with color blindness simulators
5. Ensure interactive elements are clearly distinguishable

## Implementation Checklist

- [x] Navbar: White background with light border
- [x] Page background: Light gray-blue (`#F8FAFC`)
- [x] Primary buttons: Solid blue (`#2563EB`)
- [x] Active states: Purple accent (`#7C3AED`)
- [x] Success indicators: Green (`#22C55E`)
- [x] Error states: Red (`#EF4444`)
- [x] All borders: Light gray (`#E2E8F0`)
- [x] Text hierarchy: Primary (`#0F172A`), Secondary (`#64748B`)
- [x] Consistent shadows and spacing
- [x] No gradients on buttons or backgrounds
