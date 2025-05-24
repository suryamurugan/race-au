# Copy/Paste Prevention System

This document describes the comprehensive copy/paste prevention system implemented in the race challenge application to maintain exam integrity and prevent cheating.

## Overview

The system implements multiple layers of protection to prevent users from copying challenge content while **allowing paste operations** for user convenience during challenges. This balanced approach maintains security while improving user experience.

## Implementation Layers

### 1. JavaScript Event Prevention

#### Custom Hook: `useCopyPastePrevent`

Located in `src/hooks/useCopyPastePrevent.ts`

**Features:**

- Prevents keyboard shortcuts (Ctrl+C, Ctrl+X, Ctrl+A) **but ALLOWS Ctrl+V (paste)**
- Blocks clipboard events (copy, cut) **but ALLOWS paste**
- Disables developer tools access (F12, Ctrl+Shift+I, Ctrl+U)
- Prevents right-click context menu
- Blocks text selection (except in input fields)

**Usage:**

```typescript
import {
    usePageProtection,
    useInputProtection,
} from '@/hooks/useCopyPastePrevent';

// For entire page protection
const { elementRef } = usePageProtection();

// For specific input field protection
const { elementRef } = useInputProtection();
```

### 2. CSS-Based Protection

#### Custom CSS Classes

Located in `src/app/globals.css`

**Classes:**

- `.no-copy-paste`: Disables text selection and touch interactions
- `.prevent-interactions`: Comprehensive interaction prevention
- `.secure-input`: Allows text selection only in input fields

**Features:**

- Cross-browser compatibility with vendor prefixes
- Prevents text selection
- Disables touch callouts on mobile
- Maintains input field usability

### 3. Component-Level Protection

#### Protected Components

- **ChallengePage**: Full page protection with `usePageProtection()`
- **OpenTextAnswer**: Input-specific protection (copy/cut prevented, paste allowed)

#### Event Handlers

Direct event prevention on critical components:

```typescript
const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error('Copy is disabled during challenges');
};

// Note: handlePaste removed - pasting is now allowed

const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.error('Right-click is disabled during challenges');
};
```

## Security Features

### 1. What's Restricted ❌

- **Copy operations** (Ctrl+C/Cmd+C) - Prevents copying challenge content
- **Cut operations** (Ctrl+X/Cmd+X) - Prevents cutting challenge content
- **Select All** (Ctrl+A/Cmd+A) - Prevents mass selection
- **Right-click context menu** - Blocks alternative copy methods
- **Developer tools** (F12, Ctrl+Shift+I, Ctrl+U) - Prevents inspection
- **Text selection** - Except in input fields

### 2. What's Allowed ✅

- **Paste operations** (Ctrl+V/Cmd+V) - Users can paste external content
- **Text selection in input fields** - For normal editing
- **Keyboard navigation** - Tab, Enter, Escape work normally
- **Screen reader compatibility** - Accessibility maintained
- **Normal typing** - All regular input functionality preserved

### 3. Multi-Browser Support

- Chrome/Chromium: Full protection with paste allowed
- Firefox: Event prevention and CSS protection
- Safari: WebKit-specific protections
- Edge: Microsoft-specific protections

### 4. Mobile Protection

- Touch callout prevention
- Tap highlight removal
- Text size adjustment blocking

## Protected Areas

### 1. Challenge Content (Copy/Cut Restricted)

- Task descriptions
- Module information
- Challenge metadata
- Timer information

### 2. Answer Input Areas (Paste Allowed)

- Text areas for open-ended responses
- Multiple choice selections
- File upload areas (if implemented)

### 3. Navigation Elements (Copy/Cut Restricted)

- Module lists
- Task lists
- Progress indicators

## User Feedback System

### Toast Notifications

When users attempt restricted actions:

- "Copying is disabled during challenges"
- "Cutting is disabled during challenges"
- "Select all is disabled during challenges"
- "Right-click is disabled during challenges"
- "Developer tools access is disabled during challenges"

**Note:** No paste restrictions - users can paste freely

### Visual Indicators

- Cursor changes to indicate non-selectable text
- Hover effects disabled on protected content
- Focus indicators maintained for accessibility

## Configuration Options

### Current Implementation

The system is configured to:

- ✅ Allow paste operations (Ctrl+V)
- ❌ Prevent copy operations (Ctrl+C)
- ❌ Prevent cut operations (Ctrl+X)
- ❌ Prevent select all (Ctrl+A)
- ❌ Prevent right-click context menu
- ❌ Prevent developer tools access

## Bypass Prevention

### 1. Document-Level Event Listeners

Events are captured at the document level to ensure comprehensive coverage.

### 2. CSS Reinforcement

CSS properties provide backup protection if JavaScript is disabled or bypassed.

### 3. Cross-Platform Coverage

Vendor-specific properties ensure protection across different browser engines.

### 4. Selective Protection

Only restricts problematic actions while allowing beneficial ones (like paste).

## Use Case Benefits

### 1. Security Maintained

- Prevents users from copying challenge questions
- Blocks access to developer tools
- Stops content extraction through selection

### 2. User Experience Enhanced

- **Users can paste code snippets** from their notes
- **Users can paste documentation** they're allowed to reference
- **Normal editing workflows** remain functional
- **Accessibility features** continue working

### 3. Practical Applications

- Coding challenges where reference material is allowed
- Open-book exams with external resources
- Scenarios where paste functionality improves productivity

## Testing Recommendations

### 1. Manual Testing

- ✅ **Try pasting text** - Should work normally with no restrictions
- ❌ **Try copying challenge text** - Should be blocked with toast notification
- ❌ **Try cutting text** - Should be blocked with toast notification
- ❌ **Try Ctrl+A** - Should be blocked with toast notification
- ❌ **Try right-click** - Should show error message
- ❌ **Try F12** - Should be blocked with toast notification

### 2. Input Field Testing

- ✅ **Text selection in answers** - Should work normally
- ✅ **Pasting in answer fields** - Should work without restrictions
- ❌ **Copying from answer fields** - Should be prevented
- ❌ **Right-clicking in fields** - Should be prevented

### 3. Cross-Browser Testing

- Chrome/Chromium latest
- Firefox latest
- Safari (macOS/iOS)
- Edge latest

### 4. Accessibility Testing

- Screen reader compatibility
- Keyboard navigation
- Focus management
- Tab order preservation

## Implementation Checklist

- [x] Remove paste event prevention from hook
- [x] Remove 'v' key from keyboard shortcut prevention
- [x] Update component-level paste handlers
- [x] Test paste functionality in input fields
- [x] Verify copy/cut restrictions still work
- [x] Update user feedback messages
- [x] Test across target browsers
- [x] Verify accessibility compliance
- [x] Update documentation

## Conclusion

This balanced copy/paste prevention system provides security against content extraction while maintaining user productivity through allowed paste operations. The system prevents cheating through copying while supporting legitimate use cases where external content needs to be referenced or pasted into answers.

Regular testing ensures continued effectiveness while maintaining the enhanced user experience that paste functionality provides.
