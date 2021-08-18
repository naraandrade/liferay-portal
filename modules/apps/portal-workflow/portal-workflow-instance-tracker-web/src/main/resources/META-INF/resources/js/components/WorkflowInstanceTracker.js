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
import ReactFlow, {Controls, ReactFlowProvider} from 'react-flow-renderer';

import '../../css/main.scss';
import {useFetch} from '../hooks/useFetch';
import {useFetchWithParams} from '../hooks/useFetchWithParams';
import {
	getLayoutedElements,
	getNodeType,
	isCompleted,
	isCurrent,
	nodeTypes,
} from '../util/util';

export default function WorkflowInstanceTracker({workflowInstanceId}) {
	const [nodes, setNodes] = useState([]);
	const [transitions, setTransitions] = useState([]);
	const [workflowDefinitionName, setWorkflowDefinitionName] = useState('');
	const [nodeElements, setNodeElements] = useState([]);
	const [completedNodes, setCompletedNodes] = useState([]);
	const [transitionElements, setTransitionElements] = useState([]);
	const [currentSteps, setCurrentSteps] = useState([]);

	const {data, fetchData} = useFetch({
		urls: [
			`/workflow-instances/${workflowInstanceId}`,
			`/workflow-instances/${workflowInstanceId}/workflow-logs?types=NodeEntry`,
		],
	});

	const {data: dataP, fetchData: fetchDataP} = useFetchWithParams({
		url: '/workflow-definitions/by-name/:workflowDefinitionName',
	});

	useEffect(() => {
		fetchData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (data.length) {
			setWorkflowDefinitionName(data[0].workflowDefinitionName);
			setCurrentSteps(data[0].state);
			setCompletedNodes(data[1].state);
		}
	}, [data]);

	useEffect(() => {
		if (workflowDefinitionName) {
			fetchDataP({workflowDefinitionName});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowDefinitionName]);

	useEffect(() => {
		if (dataP.nodes) {
			setNodeElements(dataP.nodes);
			setTransitionElements(dataP.transitions);
		}
	}, [dataP]);

	const position = {x: 0, y: 0};

	useEffect(() => {
		if (nodeElements?.length && transitionElements?.length) {
			const elementsN = nodeElements.map((node) => {
				return {
					data: {
						current: isCurrent(currentSteps, node),
						done: isCompleted(completedNodes, node),
						initial: node.type == 'INITIAL_STATE',
						label: node.name,
					},
					id: node.name,
					position,
					type: getNodeType(node.type),
				};
			});

			setNodes(elementsN);

			const elementsT = transitionElements.map((transition) => {
				return {
					arrowHeadType: 'arrowclosed',
					id: transition.name,
					source: transition.sourceNodeName,
					target: transition.targetNodeName,
					type: 'smoothstep',
				};
			});

			setTransitions(elementsT);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nodeElements, transitionElements]);

	const elements = nodes.concat(transitions);

	const layoutedElements = getLayoutedElements(elements);

	const onLoad = (reactFlowInstance) => {
		reactFlowInstance.fitView();
	};

	return (
		<div className="workflow-instance-tracker">
			{layoutedElements.length && (
				<ReactFlowProvider>
					<ReactFlow
						elements={layoutedElements}
						minZoom="0.1"
						nodeTypes={nodeTypes}
						onLoad={onLoad}
					/>

					<Controls showInteractive={false} />
				</ReactFlowProvider>
			)}
		</div>
	);
}
