'use client'

import { useState } from 'react'

import {
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    type EditorInstance,
    EditorRoot,
    type JSONContent
} from 'novel'

import { ImageResizer, handleCommandNavigation } from 'novel/extensions'
import { handleImageDrop, handleImagePaste } from 'novel/plugins'

import {
    slashCommand,
    suggestionItems
} from '@/components/Novel/editor/slash-command'
import EditorMenu from '@/components/Novel/editor/editor-menu'
import { uploadFn } from '@/components/Novel/editor/image-upload'
import { defaultExtensions } from '@/components/Novel/editor/extensions'
import { TextButtons } from '@/components/Novel/editor/selectors/text-buttons'
import { LinkSelector } from '@/components/Novel/editor/selectors/link-selector'
import { NodeSelector } from '@/components/Novel/editor/selectors/node-selector'
import { MathSelector } from '@/components/Novel/editor/selectors/math-selector'
import { ColorSelector } from '@/components/Novel/editor/selectors/color-selector'

import { Separator } from '@/components/Novel/ui/separator'

const hljs = require('highlight.js')

const extensions = [...defaultExtensions, slashCommand]

export const defaultEditorContent = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: []
        }
    ]
}

interface EditorProps {
    initialValue?: JSONContent
    onChange: (content: string) => void
}

export default function Editor({ initialValue, onChange }: EditorProps) {
    const [openNode, setOpenNode] = useState(false)
    const [openColor, setOpenColor] = useState(false)
    const [openLink, setOpenLink] = useState(false)
    const [openAI, setOpenAI] = useState(false)

    //Apply Codeblock Highlighting on the HTML from editor.getHTML()
    const highlightCodeblocks = (content: string) => {
        const doc = new DOMParser().parseFromString(content, 'text/html')
        doc.querySelectorAll('pre code').forEach(el => {
            // @ts-ignore
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el)
        })
        return new XMLSerializer().serializeToString(doc)
    }

    return (
        <div className='relative w-full max-w-screen-lg'>
            <EditorRoot>
                <EditorContent
                    immediatelyRender={false}
                    initialContent={initialValue}
                    extensions={extensions}
                    className='min-h-96 rounded-xl border p-4'
                    editorProps={{
                        handleDOMEvents: {
                            keydown: (_view, event) => handleCommandNavigation(event)
                        },
                        handlePaste: (view, event) =>
                            handleImagePaste(view, event, uploadFn),
                        handleDrop: (view, event, _slice, moved) =>
                            handleImageDrop(view, event, moved, uploadFn),
                        attributes: {
                            class:
                                'prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full'
                        }
                    }}
                    onUpdate={({ editor }) => {
                        onChange(editor.getHTML())
                    }}
                    slotAfter={<ImageResizer />}
                >
                    <EditorCommand className='z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all'>
                        <EditorCommandEmpty className='px-2 text-muted-foreground'>
                            No results
                        </EditorCommandEmpty>
                        <EditorCommandList>
                            {suggestionItems.map(item => (
                                <EditorCommandItem
                                    value={item.title}
                                    onCommand={val => item.command?.(val)}
                                    className='flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent'
                                    key={item.title}
                                >
                                    <div className='flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background'>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className='font-medium'>{item.title}</p>
                                        <p className='text-xs text-muted-foreground'>
                                            {item.description}
                                        </p>
                                    </div>
                                </EditorCommandItem>
                            ))}
                        </EditorCommandList>
                    </EditorCommand>

                    <EditorMenu open={openAI} onOpenChange={setOpenAI}>
                        <Separator orientation='vertical' />
                        <NodeSelector open={openNode} onOpenChange={setOpenNode} />

                        <Separator orientation='vertical' />
                        <LinkSelector open={openLink} onOpenChange={setOpenLink} />

                        <Separator orientation='vertical' />
                        <MathSelector />

                        <Separator orientation='vertical' />
                        <TextButtons />

                        <Separator orientation='vertical' />
                        <ColorSelector open={openColor} onOpenChange={setOpenColor} />
                    </EditorMenu>
                </EditorContent>
            </EditorRoot>
        </div>
    )
}