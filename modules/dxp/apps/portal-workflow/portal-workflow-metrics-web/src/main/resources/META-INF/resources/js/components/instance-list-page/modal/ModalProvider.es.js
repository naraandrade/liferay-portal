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

import React, {createContext, useState} from 'react';

const ModalContext = createContext();

const ModalProvider = ({children, processId}) => {
	const [selectTasks, setSelectTasks] = useState({
		selectAll: false,
		tasks: []
	});
	const [visibleModal, setVisibleModal] = useState('');

	const [bulkReassign, setBulkReassign] = useState({
		reassignedTasks: [],
		reassigning: false,
		selectedAssignee: null,
		useSameAssignee: false
	});

	const modalState = {
		bulkReassign,
		processId,
		selectTasks,
		setBulkReassign,
		setSelectTasks,
		setVisibleModal,
		visibleModal
	};

	return (
		<ModalContext.Provider value={modalState}>
			{children}
		</ModalContext.Provider>
	);
};

export {ModalContext};
export default ModalProvider;
