// client/src/components/CodeEditor.jsx
import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, code, setCode, isSessionActive, onKeyDown, onFocus, onBlur, onPaste }) => {
    const editorRef = useRef(null);

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    useEffect(() => {
        if (editorRef.current) {
            const keyDownListener = editorRef.current.onKeyDown(onKeyDown);
            const focusListener = editorRef.current.onDidFocusEditorWidget(onFocus);
            const blurListener = editorRef.current.onDidBlurEditorWidget(onBlur);
            
            // This is the correct way to handle the paste event
            const pasteListener = editorRef.current.onDidPaste((e) => {
                // We listen for the editor's paste event, get the model's value in the pasted range,
                // and then call our onPaste handler with ONLY the text string.
                const pastedText = editorRef.current.getModel().getValueInRange(e.range);
                onPaste(pastedText);
            });

            return () => {
                keyDownListener.dispose();
                focusListener.dispose();
                blurListener.dispose();
                pasteListener.dispose();
            };
        }
    }, [onKeyDown, onFocus, onBlur, onPaste]);

    return (
        <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
                readOnly: !isSessionActive,
                fontSize: 16,
                minimap: { enabled: false },
                wordWrap: 'on',
                contextmenu: false,
            }}
        />
    );
};

export default CodeEditor;