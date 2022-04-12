/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import React, {useEffect, useState} from 'react';

import 'codemirror/addon/display/autorefresh';

import 'codemirror/addon/edit/closebrackets';

import 'codemirror/addon/edit/closetag';

import 'codemirror/addon/edit/matchbrackets';

import 'codemirror/addon/fold/brace-fold';

import 'codemirror/addon/fold/comment-fold';

import 'codemirror/addon/fold/foldcode';

import 'codemirror/addon/fold/foldgutter.css';

import 'codemirror/addon/fold/foldgutter';

import 'codemirror/addon/fold/indent-fold';

import 'codemirror/addon/fold/xml-fold';

import 'codemirror/addon/hint/show-hint.css';

import 'codemirror/addon/hint/show-hint';

import 'codemirror/addon/hint/xml-hint';

import 'codemirror/lib/codemirror.css';

import 'codemirror/mode/htmlmixed/htmlmixed';

// @ts-ignore

import CodeMirror from 'codemirror';

import './Editor.scss';

export default function Editor({content}: EditorProps) {
	const [editor, setEditor] = useState<any>();
	const [editorWrapper, setEditorWrapper] = useState<any>();
	const [script, setScript] = useState(content);

	

	useEffect(() => {
		setEditor(
			CodeMirror(editorWrapper, {
				autoCloseTags: true,
				autoRefresh: true,
				foldGutter: true,
				gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
				indentWithTabs: true,
				inputStyle: 'contenteditable',
				lineNumbers: true,
				matchBrackets: true,
				showHint: true,
				tabSize: 2,
				theme: 'blackboard',
				viewportMargin: Infinity,
			})
		);
	}, [editorWrapper]);

	useEffect(() => {
		if (!editor) {
			return;
		}

		const handleChange = () => {
			setScript(editor.getValue());
		};

		editor.on('change', handleChange);

		return () => {
			editor.off('change', handleChange);
		};
	}, [editor, setScript]);

	useEffect(() => {
		if (editor && editor.getValue() !== content) {
			editor.setValue(content);
		}
	}, [content, editor]);

	return (
		<div
			className="lfr-objects__editor__CodeMirrorEditor"
			ref={setEditorWrapper}
		/>
	);
}

interface EditorProps {
	content: string;
}
