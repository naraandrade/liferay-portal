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

import ClayIcon from '@clayui/icon';
import classnames from 'classnames';
import React from 'react';
import {Handle} from 'react-flow-renderer';

import '../../../css/main.scss';

export default function TaskNode({
	data: {current = false, done = false, label},
}) {
	return (
		<>
			<Handle
				id="leftSource1"
				position="left"
				style={{top: '20%'}}
				type="source"
			/>

			<Handle
				id="leftTarget1"
				position="left"
				style={{top: '40%'}}
				type="target"
			/>

			<Handle
				id="leftSource2"
				position="left"
				style={{top: '60%'}}
				type="source"
			/>

			<Handle
				id="leftTarget2"
				position="left"
				style={{top: '80%'}}
				type="target"
			/>

			<Handle
				id="topSource1"
				position="top"
				style={{left: '20%'}}
				type="source"
			/>

			<Handle
				id="topTarget1"
				position="top"
				style={{left: '40%'}}
				type="target"
			/>

			<Handle
				id="topSource2"
				position="top"
				style={{left: '60%'}}
				type="source"
			/>

			<Handle
				id="topTarget2"
				position="top"
				style={{left: '80%'}}
				type="target"
			/>

			<div
				className={classnames(
					'node task-node',
					current ? 'current-task text-white' : 'text-secondary'
				)}
			>
				<span>{label}</span>

				{current ? (
					<ClayIcon className="current-icon ml-2" symbol="live" />
				) : (
					done && (
						<ClayIcon className="done-icon ml-2" symbol="check" />
					)
				)}
			</div>

			<Handle
				id="rightSource1"
				position="right"
				style={{top: '20%'}}
				type="source"
			/>

			<Handle
				id="rightTarget1"
				position="right"
				style={{top: '40%'}}
				type="target"
			/>

			<Handle
				id="rightSource2"
				position="right"
				style={{top: '60%'}}
				type="source"
			/>

			<Handle
				id="rightTarget2"
				position="right"
				style={{top: '80%'}}
				type="target"
			/>

			<Handle
				id="bottomTarget1"
				position="bottom"
				style={{left: '20%'}}
				type="target"
			/>

			<Handle
				id="bottomSource1"
				position="bottom"
				style={{left: '40%'}}
				type="source"
			/>

			<Handle
				id="bottomTarget2"
				position="bottom"
				style={{left: '60%'}}
				type="target"
			/>

			<Handle
				id="bottomSource2"
				position="bottom"
				style={{left: '80%'}}
				type="source"
			/>
		</>
	);
}
