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

import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';
import React from 'react';

import WorkflowInstanceTracker from '../../src/main/resources/META-INF/resources/js/components/WorkflowInstanceTracker';

const firstRequest = {
	state: 'Review',
	workflowDefinitionName: 'Single Approver',
};

const secondRequest = {
	items: [
		{
			state: 'review',
		},
		{
			state: 'created',
		},
	],
};

const thirdRequest = {
	name: 'Single Approver',
	nodes: [
		{
			label: 'Approved',
			name: 'approved',
			type: 'TERMINAL_STATE',
		},
		{
			label: 'Created',
			name: 'created',
			type: 'INITIAL_STATE',
		},
		{
			label: 'Review',
			name: 'review',
			type: 'TASK',
		},
		{
			label: 'Update',
			name: 'update',
			type: 'TASK',
		},
	],
	title: 'Single Approver',
	transitions: [
		{
			label: 'Review',
			name: 'review',
			sourceNodeName: 'created',
			targetNodeName: 'review',
		},
		{
			label: 'Approve',
			name: 'approve',
			sourceNodeName: 'review',
			targetNodeName: 'approved',
		},
		{
			label: 'Reject',
			name: 'reject',
			sourceNodeName: 'review',
			targetNodeName: 'update',
		},
		{
			label: 'Resubmit',
			name: 'resubmit',
			sourceNodeName: 'update',
			targetNodeName: 'review',
		},
	],
};

describe('The TaskNode component should', () => {
	it('Be rendered with nodes and transitions', () => {
		jest.fn()
			.mockResolvedValueOnce({data: {...firstRequest}})
			.mockResolvedValueOnce({data: {...secondRequest}})
			.mockResolvedValueOnce({data: {...thirdRequest}});

		render(<WorkflowInstanceTracker instanceId={41769} />);
	});
});
