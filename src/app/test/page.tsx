'use client';
import TiptapEditor from '@/components/tiptap-editor';

export default function TestPage() {
    return (
        <div>
            <TiptapEditor
                onChange={(content) => {
                    console.log(content);
                }}
            />
        </div>
    );
}
