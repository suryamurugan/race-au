'use client';

import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/lib/utils';

interface TiptapViewerProps {
    content: string;
    className?: string;
}

export default function TiptapViewer({
    content,
    className,
}: TiptapViewerProps) {
    // Handle empty or undefined content
    const safeContent = content ? content : '<p></p>';

    // Ensure content is valid HTML, wrap plaintext in paragraph if needed
    const ensureValidHtml = (htmlContent: string): string => {
        if (!htmlContent.trim()) return '<p></p>';

        // If content doesn't start with an HTML tag, wrap it in a paragraph
        if (!htmlContent.trim().startsWith('<')) {
            return `<p>${htmlContent}</p>`;
        }

        return htmlContent;
    };

    const isPreviewMode = className?.includes('preview-only');
    const isDocumentPreview = className?.includes('document-preview');
    const isNoticePreview = className?.includes('notice-preview');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                modestBranding: true,
                allowFullscreen: true,
            }),
        ],
        content: ensureValidHtml(safeContent),
        editable: false,
        editorProps: {
            attributes: {
                class: cn(
                    'prose dark:prose-invert',
                    // Different prose sizes based on type
                    isPreviewMode && 'prose-xs max-h-16 line-clamp-2',
                    isDocumentPreview &&
                        'prose-sm text-[0.8rem] leading-normal p-0 border-0 max-w-none',
                    isNoticePreview &&
                        'prose-xs text-[0.75rem] leading-snug text-muted-foreground p-0 border-0 max-w-none',
                    // Normal mode
                    !isPreviewMode &&
                        !isDocumentPreview &&
                        !isNoticePreview &&
                        'prose-sm sm:prose-base lg:prose-lg xl:prose-xl',
                    // Conditionally apply padding and border for non-preview modes
                    !isPreviewMode &&
                        !isDocumentPreview &&
                        !isNoticePreview &&
                        'w-full rounded-md border border-input bg-transparent p-4',
                    'focus-visible:outline-none',
                ),
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div
            className={cn(
                'w-full',
                (isPreviewMode || isDocumentPreview || isNoticePreview) &&
                    'overflow-hidden',
                className,
            )}
        >
            <EditorContent editor={editor} />
        </div>
    );
}
