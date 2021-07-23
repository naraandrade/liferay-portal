/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import dagre from 'dagre';
import React, {useCallback, useState} from 'react';
import ReactFlow, {
	Controls,
	ReactFlowProvider,
	addEdge,
	isNode,
	removeElements,
} from 'react-flow-renderer';

import JsonSample from './sampleDefinition';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (elements, direction = 'TB') => {
	const isHorizontal = direction === 'LR';
	dagreGraph.setGraph({rankdir: direction});

	elements.forEach((element) => {
		if (isNode(element)) {
			dagreGraph.setNode(element.id, {
				height: nodeHeight,
				width: nodeWidth,
			});
		} else {
			dagreGraph.setEdge(element.source, element.target);
		}
	});

	dagre.layout(dagreGraph);

	return elements.map((element) => {
		if (isNode(element)) {
			const nodeWithPosition = dagreGraph.node(element.id);
			element.targetPosition = isHorizontal ? 'left' : 'top';
			element.sourcePosition = isHorizontal ? 'right' : 'bottom';

			// unfortunately we need this little hack to pass a slightly different position
			// to notify react flow about the change. Moreover we are shifting the dagre node position
			// (anchor=center center) to the top left so it matches the react flow node anchor point (top left).

			element.position = {
				x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
				y: nodeWithPosition.y - nodeHeight / 2,
			};
		}

		return element;
	});
};

const position = {x: 0, y: 0};

const JSONnodes = JsonSample.nodes.map((node) => {
	return {
		data: {label: node.name},
		id: node.name,
		position,
	};
});

const JSONtransitions = JsonSample.transitions.map((transition) => {
	return {
		id: transition.name,
		source: transition.sourceNodeName,
		target: transition.targetNodeName,
		type: 'step',
	};
});

const JSONelements = JSONnodes.concat(JSONtransitions);

const layoutedElements = getLayoutedElements(JSONelements);

const LayoutFlow = () => {
	const [elements, setElements] = useState(layoutedElements);
	const onConnect = (params) =>
		setElements((els) =>
			addEdge({...params, animated: true, type: 'smoothstep'}, els)
		);
	const onElementsRemove = (elementsToRemove) =>
		setElements((els) => removeElements(elementsToRemove, els));

	const onLayout = useCallback(
		(direction) => {
			const layoutedElements = getLayoutedElements(elements, direction);
			setElements(layoutedElements);
		},
		[elements]
	);

	const onLoad = (reactFlowInstance) => {
		reactFlowInstance.fitView();
	};

	return (
		<div className="layoutflow">
			<ReactFlowProvider>
				<ReactFlow
					connectionLineType="smoothstep"
					elements={elements}
					onConnect={onConnect}
					onElementsRemove={onElementsRemove}
					onLoad={onLoad}
				/>
				<div className="controls">
					<button onClick={() => onLayout('TB')}>
						vertical layout
					</button>
					<button onClick={() => onLayout('LR')}>
						horizontal layout
					</button>
				</div>
				<Controls />
			</ReactFlowProvider>
		</div>
	);
};

export default LayoutFlow;
