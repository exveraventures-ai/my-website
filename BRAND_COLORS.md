# Burnout IQ Brand Color Scheme

## Primary Colors

- **Deep Indigo**: `#4F46E5` - Intelligence, professionalism, depth
  - Used for: Primary branding, hero gradients, accent colors

- **Vibrant Coral**: `#FF6B6B` - Alertness, awareness, energy
  - Used for: Primary action buttons, CTAs, important highlights, links

- **Electric Cyan**: `#06B6D4` - Clarity, intelligence, IQ accent
  - Used for: Success states, positive indicators, "IQ" text accent, positive metrics

## Gradients

- **Hero Gradient**: `linear-gradient(135deg, #4F46E5 0%, #FF6B6B 100%)`
  - Deep Indigo to Vibrant Coral transition
  - Creates sense of intelligence transitioning to awareness

- **Landing Page Gradient**: `linear-gradient(135deg, #4F46E5 0%, #1a1a2e 50%, #FF6B6B 100%)`
  - Three-color gradient for depth and visual interest

## Special Colors

- **Gold (Pro Feature)**: `#FFD700` - Premium, exclusive
  - Used for: Pro user profile buttons, premium features

- **Dark Slate**: `#0F172A` or `#1d1d1f` - Text and backgrounds
  - Used for: Primary text, dark backgrounds

- **Light Gray**: `#f3f4f6` or `#f5f5f7` - Backgrounds
  - Used for: Page backgrounds, card backgrounds

## Color Usage Guidelines

### Buttons & CTAs
- Primary actions: `#FF6B6B` (Vibrant Coral)
- Hover states: Slightly darker shade of coral
- Pro features: `#FFD700` (Gold)

### Success/Positive States
- Success messages: `#06B6D4` (Electric Cyan)
- Positive metrics: `#06B6D4`
- Good status indicators: `#06B6D4`

### Brand Text
- Logo: "Burnout" in primary color, "IQ" in `#06B6D4` with bold weight
- Format: `Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>`

### Charts & Visualizations
- Primary data: `#FF6B6B` (Coral)
- Secondary/success data: `#06B6D4` (Cyan)
- Gradients: Use indigo-to-coral gradient for hero sections

## Implementation Notes

- All instances of old colors have been updated:
  - `#007AFF` (Blue) → `#FF6B6B` (Coral)
  - `#34C759` (Green) → `#06B6D4` (Cyan)
  - `#667eea` / `#764ba2` (Purple gradient) → `#4F46E5` / `#FF6B6B` (Indigo-Coral gradient)

- Pro feature gold (`#FFD700`) remains unchanged as it's already premium

- All localStorage keys updated from `workwell_user_id` to `burnoutiQ_user_id`

---

**Brand Name**: Burnout IQ  
**Tagline**: Track your hours. Analyze your risk. Maintain your edge.
