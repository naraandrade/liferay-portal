/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {TreeView} from '@clayui/core';
import React, {useRef} from 'react';
import {useDrag} from 'react-dnd';

export default function SidebarItem({
	id,
	index,
	name,
	type,
}: {
	id: string;
	index?: number;
	name: string;
	type: string;
}) {
	const ref = useRef<HTMLDivElement | null>(null);

	const [{isDragging}, dragRef] = useDrag({
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
		item: {
			id,
			index,
			name,
			type,
		},
	});

	return (
		<TreeView.Item
			itemType={type}
			key={id}
			ref={(element) => {
				dragRef(element);
				ref.current = element;
			}}
		>
			{name}
		</TreeView.Item>
	);
}
