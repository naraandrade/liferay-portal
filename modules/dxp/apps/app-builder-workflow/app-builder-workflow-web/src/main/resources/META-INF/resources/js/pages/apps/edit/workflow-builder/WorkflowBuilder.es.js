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

import EditAppContext from 'app-builder-web/js/pages/apps/edit/EditAppContext.es';
import React, {useContext, useRef, useState} from 'react';
import ReactFlow, {
	Controls,
	ReactFlowProvider,
	addEdge,
	removeElements,
} from 'react-flow-renderer';

import {
	ADD_STEP,
	REMOVE_STEP,
	REMOVE_STEP_EMPTY_FORM_VIEWS,
	UPDATE_STEP_INDEX,
} from '../configReducer.es';
import WorkflowStep from './WorkflowStep.es';

import './dnd.scss';

export default function WorkflowBuilder() {
	const {
		config: {dataObject, stepIndex, steps},
		dispatchConfig,
	} = useContext(EditAppContext);

	const badgeLabel = (stepIndex) => {
		if (stepIndex === 0) {
			return Liferay.Language.get('start');
		} else if (stepIndex === steps.length - 1) {
			return Liferay.Language.get('end');
		}

		return stepIndex;
	};

	const onClickStep = (index) => {
		if (index !== stepIndex) {
			if (steps[stepIndex].initial === undefined) {
				dispatchConfig({
					stepIndex,
					type: REMOVE_STEP_EMPTY_FORM_VIEWS,
				});
			}

			dispatchConfig({stepIndex: index, type: UPDATE_STEP_INDEX});
		}
	};

	let id = 0;
	const getId = () => `dndnode_${id++}`;

	const stepInfo = [
		[
			{
				...dataObject,
				label: Liferay.Language.get('data-object'),
			},
		],
		...steps
			.filter(({initial}) => initial === undefined)
			.map(({appWorkflowRoleAssignments = []}) =>
				appWorkflowRoleAssignments.length > 0
					? [
							{
								label: Liferay.Language.get('assignee'),
								name: appWorkflowRoleAssignments
									.map(({roleName}) => roleName)
									.reduce((acc, cur) => `${acc}, ${cur}`),
							},
					  ]
					: []
			),
	];

	const customElements = steps.map((step, index) => {
		step.id = `${getId()}`;
		step.position = {x: 100, y: 25};
		step.type = 'selectorNode';
		step.data = {
			props: {
				actions: [
					{
						label: Liferay.Language.get('delete-step'),
						onClick: () =>
							dispatchConfig({
								stepIndex: index,
								type: REMOVE_STEP,
							}),
					},
				],
				addStep: () =>
					dispatchConfig({stepIndex: index, type: ADD_STEP}),
				badgeLabel: badgeLabel(index),
				onClick: () => onClickStep(index),
				selected: stepIndex === index,
				stepInfo:
					index < steps.length - 1 && stepInfo[index]
						? stepInfo[index]
						: [],
				...step,
			},
		};

		return step;
	});

	const reactFlowWrapper = useRef(null);
	const [reactFlowInstance, setReactFlowInstance] = useState(null);
	const [elements, setElements] = useState(customElements);
	const onConnect = (params) => setElements((els) => addEdge(params, els));
	const onElementsRemove = (elementsToRemove) =>
		setElements((els) => removeElements(elementsToRemove, els));
	const onLoad = (_reactFlowInstance) =>
		setReactFlowInstance(_reactFlowInstance);
	const onDragOver = (event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	};
	const onDrop = (event) => {
		event.preventDefault();
		const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
		const type = event.dataTransfer.getData('application/reactflow');
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		});

		const newNode = {
			data: {label: `${type} node`},
			id: getId(),
			position,
			type,
		};
		setElements((es) => es.concat(newNode));
	};

	const nodeTypes = {
		selectorNode: WorkflowStep,
	};

	return (
		<div className="app-builder-workflow-app__builder">
			<div className="dndflow">
				<ReactFlowProvider>
					<div className="reactflow-wrapper" ref={reactFlowWrapper}>
						<ReactFlow
							elements={elements}
							nodeTypes={nodeTypes}
							onConnect={onConnect}
							onDragOver={onDragOver}
							onDrop={onDrop}
							onElementsRemove={onElementsRemove}
							onLoad={onLoad}
						>
							<Controls />
						</ReactFlow>
					</div>
				</ReactFlowProvider>
			</div>
		</div>
	);
}
