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

import React, {useReducer} from 'react';

import {defaultNodes} from './diagram-builder/components/nodes/utils';
import populateAssignmentsData from './diagram-builder/util/populateAssignmentsData';
import populateNotificationsData from './diagram-builder/util/populateNotificationsData';

const DefinitionBuilderContext = React.createContext();

const TYPES = {
	DESERIALIZE_DEFINITION: 'DESERIALIZE_DEFINITION',
	SERIALIZE_DEFINITION: 'SERIALIZE_DEFINITION',
	UPDATE_DEFINITION_INFO: 'UPDATE_DEFINITION_INFO',
	UPDATE_ELEMENTS: 'UPDATE_ELEMENTS',
};

const initialState = {
	active: true,
	alertMessage: '',
	alertType: null,
	blockingErrors: {errorType: ''},
	currentEditor: null,
	definitionDescription: '',
	definitionInfo: null,
	definitionName: null,
	elements: defaultNodes,
	selectedLanguageId: '',
	showAlert: false,
	showDefinitionInfo: false,
	showInvalidContentMessage: false,
};

const definitionReducer = (state, action) => {
	switch (action.type) {
		case TYPES.DESERIALIZE_DEFINITION: {
			const {deserializeUtil} = action.payload;

			const xmlDefinition = state.currentEditor.getData();

			deserializeUtil.updateXMLDefinition(xmlDefinition);

			const elements = deserializeUtil.getElements();
			const metadata = deserializeUtil.getMetadata();

			const definitionDescription = metadata.description;
			const definitionName = metadata.name;

			populateAssignmentsData(elements);
			populateNotificationsData(elements);

			return {
				...state,
				definitionDescription,
				definitionName,
				elements,
			};
		}
		case TYPES.SERIALIZE_DEFINITION: {
			return {
				...state,
			};
		}
		case TYPES.UPDATE_DEFINITION_INFO: {
			const {
				active,
				content,
				dateCreated,
				dateModified,
				description,
				deserializeUtil,
				version,
			} = action.payload;

			deserializeUtil.updateXMLDefinition(content);

			const elements = deserializeUtil.getElements();

			populateAssignmentsData(elements);
			populateNotificationsData(elements);

			return {
				...state,
				active,
				definitionDescription: description,
				definitionInfo: {
					dateCreated,
					dateModified,
					totalModifications: version,
				},
				elements,
			};
		}
		case TYPES.UPDATE_ELEMENTS: {
			return {...state};
		}
		default:
			return state;
	}
};

const DefinitionBuilderContextProvider = ({
	accountEntryId,
	children,
	definitionName,
	title,
	version,
	...restProps
}) => {
	const [state, dispatch] = useReducer(definitionReducer, {
		...initialState,
		accountEntryId,
		definitionId: definitionName,
		definitionTitle: title,
		version: parseInt(version, 10),
		...restProps,
	});

	return (
		<DefinitionBuilderContext.Provider value={[state, dispatch]}>
			{children}
		</DefinitionBuilderContext.Provider>
	);
};

export {TYPES, DefinitionBuilderContext, DefinitionBuilderContextProvider};
