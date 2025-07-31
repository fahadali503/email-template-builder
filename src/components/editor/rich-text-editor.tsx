'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Palette,
    Link as LinkIcon,
    ImageIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store/editor'

interface RichTextEditorProps {
    content?: string
    onChange?: (content: string) => void
    placeholder?: string
    className?: string
    editable?: boolean
}

export function RichTextEditor({
    content = '',
    onChange,
    placeholder = 'Start writing your email template...',
    className,
    editable = true,
}: RichTextEditorProps) {
    const { variables } = useEditorStore()

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto',
                },
            }),

        ],
        content,
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChange?.(html)
        },
    })

    const insertVariable = (variableKey: string) => {
        if (editor) {
            editor.chain().focus().insertContent(`{{${variableKey}}}`).run()
        }
    }

    if (!editor) {
        return null
    }

    return (
        <div className={cn('relative border rounded-lg', className)}>
            {/* Toolbar */}
            <div className="border-b p-2 flex flex-wrap items-center gap-1">
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-gray-100' : ''}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-gray-100' : ''}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'bg-gray-100' : ''}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={editor.isActive('code') ? 'bg-gray-100' : ''}
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Color and Formatting */}
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <input
                        type="color"
                        onInput={(event) => {
                            const target = event.target as HTMLInputElement
                            editor.chain().focus().setColor(target.value).run()
                        }}
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        className="w-8 h-8 border rounded cursor-pointer"
                        title="Text Color"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={editor.isActive('highlight') ? 'bg-gray-100' : ''}
                    >
                        <Palette className="h-4 w-4" />
                    </Button>
                </div>

                {/* Links and Images */}
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const url = window.prompt('Enter URL:')
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run()
                            }
                        }}
                        className={editor.isActive('link') ? 'bg-gray-100' : ''}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const url = window.prompt('Enter image URL:')
                            if (url) {
                                editor.chain().focus().setImage({ src: url }).run()
                            }
                        }}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-gray-100' : ''}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'bg-gray-100' : ''}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <select
                        className="text-sm border rounded px-2 py-1"
                        onChange={(e) => {
                            const level = parseInt(e.target.value)
                            if (level === 0) {
                                editor.chain().focus().setParagraph().run()
                            } else {
                                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
                            }
                        }}
                        value={
                            editor.isActive('heading', { level: 1 }) ? 1 :
                                editor.isActive('heading', { level: 2 }) ? 2 :
                                    editor.isActive('heading', { level: 3 }) ? 3 :
                                        0
                        }
                    >
                        <option value={0}>Paragraph</option>
                        <option value={1}>Heading 1</option>
                        <option value={2}>Heading 2</option>
                        <option value={3}>Heading 3</option>
                    </select>
                </div>

                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                {/* Variables dropdown */}
                <div className="relative">
                    <select
                        className="text-sm border rounded px-2 py-1"
                        onChange={(e) => {
                            if (e.target.value) {
                                insertVariable(e.target.value)
                                e.target.value = ''
                            }
                        }}
                        defaultValue=""
                    >
                        <option value="">Insert Variable</option>
                        {Array.isArray(variables) ? variables.map((variable) => (
                            <option key={variable.key} value={variable.key}>
                                {variable.key}
                            </option>
                        )) : null}
                    </select>
                </div>
            </div>



            {/* Editor content */}
            <EditorContent
                editor={editor}
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-96 p-4"
            />
        </div>
    )
}