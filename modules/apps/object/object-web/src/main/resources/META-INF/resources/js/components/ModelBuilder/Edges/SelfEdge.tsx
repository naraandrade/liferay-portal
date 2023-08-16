/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useMemo} from 'react';
import {
	EdgeProps,
	EdgeText,
	getBezierPath,
	getEdgeCenter,
	getSmoothStepPath,
	useStoreState,
} from 'react-flow-renderer';

import {ObjectRelationshipEdgeData} from '../types';
import ManyMarkerEnd from './ManyMarkerEnd';
import OneMarkerEnd from './OneMarkerEnd';

export default function SelfEdge({
	id,
	source,
	style = {},
	data,
	sourceX,
	sourceY,
	targetX,
	targetY,
}: EdgeProps<ObjectRelationshipEdgeData>) {
	const nodes = useStoreState((state) => state.nodes);

	const sourceTargetNode = useMemo(
		() => nodes.find((node) => node.id === source),
		[source, nodes]
	);

	if (!sourceTargetNode) {
		return null;
	}

	const radiusX = (sourceX - targetX) * 0.6;
	const radiusY = 50;

	// const edgePath = getSmoothStepPath({
	// 	sourcePosition: sourcePos,
	// 	sourceX,
	// 	sourceY,
	// 	targetPosition: targetPos,
	// 	targetX,
	// 	targetY,
	// });

	const edgePath = `M ${
		sourceX - 5
	} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX + 2} ${targetY}`;

	const [edgeCenterX, edgeCenterY] = getEdgeCenter({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return (
		<g className="react-flow__connection">
			<OneMarkerEnd />

			<ManyMarkerEnd />

			<path
				className="react-flow__edge-path"
				d={edgePath}
				id={id}
				markerEnd={`url(#${data?.markerEndId})`}
				style={{
					...style,
					stroke: '#0B5FFF',
					strokeWidth: '2px',
				}}
			/>

			<EdgeText
				label={data?.label}
				labelBgBorderRadius={4}
				labelBgPadding={[8, 5]}
				labelBgStyle={{
					fill: '#0B5FFF',
					height: '24px',
				}}
				labelShowBg
				labelStyle={{
					fill: '#FFF',
					fontSize: '12px',
					fontWeight: 600,
				}}
				x={edgeCenterX}
				y={edgeCenterY}
			/>
		</g>
	);
}
