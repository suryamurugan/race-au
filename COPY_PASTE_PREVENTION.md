# Copy/Paste Prevention System

This document describes the comprehensive copy/paste prevention system implemented in the race challenge application to maintain exam integrity and prevent cheating.

## Overview

The system implements multiple layers of protection to prevent users from copying challenge content or pasting external answers during challenges. This is crucial for maintaining the integrity of coding challenges and assessments.

## Implementation Layers

### 1. JavaScript Event Prevention

#### Custom Hook: `useCopyPastePrevent`

Located in `src/hooks/useCopyPastePrevent.ts`

**Features:**

- Prevents keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A)
- Blocks clipboard events (copy, paste, cut)
- Disables developer tools access (F12, Ctrl+Shift+I, Ctrl+U)
- Prevents right-click context menu
- Blocks text selection
- Prevents drag and drop operations

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
- **OpenTextAnswer**: Input-specific protection with `useInputProtection()`

#### Event Handlers

Direct event prevention on critical components:

```typescript
const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error('Copy and paste is disabled during challenges');
};

const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error('Copy and paste is disabled during challenges');
};

const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.error('Right-click is disabled during challenges');
};
```

## Security Features

### 1. Multi-Browser Support

- Chrome/Chromium: Full protection including developer tools
- Firefox: Event prevention and CSS protection
- Safari: WebKit-specific protections
- Edge: Microsoft-specific protections

### 2. Mobile Protection

- Touch callout prevention
- Tap highlight removal
- Text size adjustment blocking

### 3. Developer Tools Prevention

- F12 key blocking
- Ctrl+Shift+I prevention
- Ctrl+Shift+C blocking
- Ctrl+U (view source) prevention

### 4. User Experience Considerations

- Input fields maintain text selection for usability
- Clear error messages when restrictions are triggered
- Toast notifications for user feedback
- Graceful degradation if JavaScript is disabled

## Protected Areas

### 1. Challenge Content

- Task descriptions
- Module information
- Challenge metadata
- Timer information

### 2. Answer Input Areas

- Text areas for open-ended responses
- Multiple choice selections
- File upload areas (if implemented)

### 3. Navigation Elements

- Module lists
- Task lists
- Progress indicators

## User Feedback System

### Toast Notifications

When users attempt restricted actions:

- "Copy and paste is disabled during challenges"
- "Right-click is disabled during challenges"
- Custom messages for specific violations

### Visual Indicators

- Cursor changes to indicate non-selectable text
- Hover effects disabled on protected content
- Focus indicators maintained for accessibility

## Configuration Options

### Hook Parameters

```typescript
interface UseCopyPastePreventOptions {
    preventCopy?: boolean; // Default: true
    preventPaste?: boolean; // Default: true
    preventCut?: boolean; // Default: true
    preventSelect?: boolean; // Default: true
    preventContextMenu?: boolean; // Default: true
    preventDragDrop?: boolean; // Default: true
    allowOnlyKeyboardInput?: boolean; // Default: false
}
```

### Specialized Hooks

#### `usePageProtection()`

Complete page protection with all restrictions enabled.

#### `useInputProtection()`

Input-focused protection that allows text selection within form fields while preventing copy/paste operations.

## Bypass Prevention

### 1. Multiple Event Listeners

Events are captured at the capture phase (true) to prevent stopPropagation bypasses.

### 2. CSS Reinforcement

CSS properties provide backup protection if JavaScript is disabled or bypassed.

### 3. Cross-Platform Coverage

Vendor-specific properties ensure protection across different browser engines.

### 4. Dynamic Application

Protection is applied dynamically and cannot be easily disabled through console manipulation.

## Accessibility Considerations

### 1. Screen Readers

- ARIA labels preserved
- Navigation remains accessible
- Focus management maintained

### 2. Keyboard Navigation

- Tab order preserved
- Enter/Space functionality maintained
- Escape key handling unaffected

### 3. Input Accessibility

- Text selection allowed in input fields
- Cut/copy/paste restrictions only for exam content
- Placeholder text and labels functional

## Limitations and Considerations

### 1. Browser Extensions

Advanced browser extensions may bypass some protections. Consider implementing server-side validation as additional security.

### 2. Developer Tools

While F12 and common shortcuts are blocked, experienced users may still access developer tools through alternative methods.

### 3. Mobile Browsers

Some mobile browsers may handle events differently. Test thoroughly on target devices.

### 4. Accessibility vs Security

Balance between security and accessibility is maintained, but some assistive technologies may be affected.

## Implementation Checklist

- [ ] Import hooks in protected components
- [ ] Apply CSS classes to container elements
- [ ] Add event handlers to input components
- [ ] Test across target browsers
- [ ] Verify accessibility compliance
- [ ] Implement user feedback messages
- [ ] Test on mobile devices
- [ ] Document any custom configurations

## Testing Recommendations

### 1. Manual Testing

- Try copying text from different areas
- Attempt pasting external content
- Test right-click prevention
- Verify keyboard shortcuts are blocked

### 2. Cross-Browser Testing

- Chrome/Chromium latest
- Firefox latest
- Safari (macOS/iOS)
- Edge latest

### 3. Device Testing

- Desktop computers
- Tablets
- Mobile phones
- Accessibility tools

### 4. Penetration Testing

- Advanced bypass attempts
- Extension interference testing
- Console manipulation attempts

## Maintenance

### 1. Browser Updates

Monitor browser changes that might affect protection mechanisms.

### 2. New Attack Vectors

Stay updated on new methods for bypassing client-side protections.

### 3. User Feedback

Monitor user reports of protection failures or usability issues.

### 4. Performance Impact

Regularly assess the performance impact of protection mechanisms.

## Server-Side Considerations

While this system provides comprehensive client-side protection, consider implementing additional server-side measures:

1. **Time-based Analysis**: Monitor submission timing patterns
2. **Answer Similarity Detection**: Check for identical or suspicious answers
3. **Session Monitoring**: Track user behavior patterns
4. **Rate Limiting**: Prevent rapid submissions
5. **IP Tracking**: Monitor for unusual access patterns

## Conclusion

This multi-layered copy/paste prevention system provides robust protection for challenge integrity while maintaining usability and accessibility. Regular testing and updates ensure continued effectiveness against evolving bypass techniques.
