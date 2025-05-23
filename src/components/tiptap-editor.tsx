'use client';

import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Italic,
    Strikethrough,
    Underline as UnderlineIcon,
    Youtube as YoutubeIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
    onChange?: (content: string) => void;
    initialContent?: string;
    placeholder?: string;
    className?: string;
}

export default function TiptapEditor({
    onChange,
    initialContent = '<p></p>',
    placeholder = 'Type text or add YouTube videos...',
    className,
}: TiptapEditorProps) {
    const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // Ensure initial content is valid HTML
    const ensureValidHtml = (htmlContent: string): string => {
        if (!htmlContent || !htmlContent.trim()) return '<p></p>';

        // If content doesn't look like HTML, wrap it in paragraph tags
        if (!htmlContent.trim().startsWith('<')) {
            return `<p>${htmlContent}</p>`;
        }

        return htmlContent;
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
                defaultAlignment: 'left',
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                modestBranding: true,
                allowFullscreen: true,
                width: 640, // Default width, will be overridden by CSS
                height: 360, // Default height, will be overridden by CSS
                HTMLAttributes: {
                    class: 'w-full', // Add a class that can be targeted by CSS
                },
            }),
        ],
        content: ensureValidHtml(initialContent),
        editorProps: {
            attributes: {
                class: cn(
                    'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl',
                    'min-h-[200px] w-full rounded-md border border-input bg-transparent p-4',
                    'focus-visible:outline-none',
                ),
            },
        },
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getHTML());
            }
        },
    });

    // Update editor content when initialContent prop changes
    useEffect(() => {
        if (editor) {
            const html = ensureValidHtml(initialContent);
            if (editor.getHTML() !== html) {
                editor.commands.setContent(html);
            }
        }
    }, [initialContent, editor]);

    const addYoutubeVideo = () => {
        if (editor && youtubeUrl) {
            editor.commands.setYoutubeVideo({
                src: youtubeUrl,
                width: 640, // Keep as number to satisfy type requirements
                height: 360, // Keep as number but use 16:9 aspect ratio
            });
            setYoutubeUrl('');
            setYoutubeDialogOpen(false);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className={cn('w-full', className)}>
            <div className="border-input bg-background rounded-t-md border">
                <div className="flex flex-wrap items-center gap-1 border-b p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        className={editor.isActive('bold') ? 'bg-accent' : ''}
                        aria-label="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        className={editor.isActive('italic') ? 'bg-accent' : ''}
                        aria-label="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        className={
                            editor.isActive('underline') ? 'bg-accent' : ''
                        }
                        aria-label="Underline"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        className={editor.isActive('strike') ? 'bg-accent' : ''}
                        aria-label="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        className={editor.isActive('code') ? 'bg-accent' : ''}
                        aria-label="Code"
                    >
                        <Code className="h-4 w-4" />
                    </Button>

                    <div className="bg-border mx-1 h-6 w-px" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setYoutubeDialogOpen(true)}
                        aria-label="Insert YouTube Video"
                    >
                        <YoutubeIcon className="h-4 w-4" />
                    </Button>

                    <div className="bg-border mx-1 h-6 w-px" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('left').run()
                        }
                        className={
                            editor.isActive({ textAlign: 'left' })
                                ? 'bg-accent'
                                : ''
                        }
                        aria-label="Align Left"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('center').run()
                        }
                        className={
                            editor.isActive({ textAlign: 'center' })
                                ? 'bg-accent'
                                : ''
                        }
                        aria-label="Align Center"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('right').run()
                        }
                        className={
                            editor.isActive({ textAlign: 'right' })
                                ? 'bg-accent'
                                : ''
                        }
                        aria-label="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <EditorContent
                editor={editor}
                className="border-input rounded-b-md border border-t-0"
            />

            <AlertDialog
                open={youtubeDialogOpen}
                onOpenChange={setYoutubeDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Insert YouTube Video
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        <div className="space-y-2">
                            <span className="text-muted-foreground block text-sm">
                                Enter a YouTube video URL (e.g.,
                                https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                            </span>
                            <Input
                                id="youtube-url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addYoutubeVideo();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={addYoutubeVideo}>
                            Embed
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
