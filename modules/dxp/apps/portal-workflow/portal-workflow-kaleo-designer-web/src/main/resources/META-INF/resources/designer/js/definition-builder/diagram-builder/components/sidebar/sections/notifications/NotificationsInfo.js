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

import PropTypes from 'prop-types';
import React, {useContext, useState} from 'react';

import {DEFAULT_LANGUAGE} from '../../../../../source-builder/constants';
import {DiagramBuilderContext} from '../../../../DiagramBuilderContext';
import BaseNotificationsInfo from '../shared-components/BaseNotificationsInfo';
import {getRecipientTypeOptions} from '../utils';

let executionTypeOptions = [
	{
		label: Liferay.Language.get('on-entry'),
		value: 'onEntry',
	},
	{
		label: Liferay.Language.get('on-exit'),
		value: 'onExit',
	},
];

const NotificationsInfo = ({index: notificationIndex, ...restProps}) => {
	const {selectedItem, setSelectedItem} = useContext(DiagramBuilderContext);
	const [executionType, setExecutionType] = useState(
		selectedItem.data.notifications?.executionType?.[notificationIndex] ||
			(selectedItem.type === 'task' ? 'onAssignment' : 'onEntry')
	);
	let recipientTypeOptions = getRecipientTypeOptions();

	if (selectedItem.type === 'task') {
		if (
			!recipientTypeOptions
				.map((option) => option.value)
				.includes('taskAssignees')
		) {
			recipientTypeOptions.push({
				label: Liferay.Language.get('task-assignees'),
				value: 'taskAssignees',
			});
		}

		if (
			!executionTypeOptions
				.map((option) => option.value)
				.includes('onAssignment')
		) {
			executionTypeOptions.unshift({
				label: Liferay.Language.get('on-assignment'),
				value: 'onAssignment',
			});
		}
	} else if (selectedItem.type !== 'task') {
		recipientTypeOptions = recipientTypeOptions.filter(({value}) => {
			return value !== 'taskAssignees';
		});

		executionTypeOptions = executionTypeOptions.filter(({value}) => {
			return value !== 'onAssignment';
		});
	}

	const scriptedRecipientUpdateSelectedItem = ({target}) =>
		setSelectedItem((previousItem) => {
			previousItem.data.notifications.recipients[notificationIndex] = {
				assignmentType: ['scriptedRecipient'],
				script: [target.value],
				scriptLanguage: [DEFAULT_LANGUAGE],
			};

			return previousItem;
		});

	const updateSelectedItem = (values) => {
		setSelectedItem((previousItem) => ({
			...previousItem,
			data: {
				...previousItem.data,
				notifications: {
					description: values.map(({description}) => description),
					executionType: values.map(
						({executionType}) => executionType
					),
					name: values.map(({name}) => name),
					notificationTypes: values.map(
						({notificationTypes}) => notificationTypes
					),
					recipients: !previousItem.data.notifications?.recipients
						? [
								{
									assignmentType: ['user'],
								},
						  ]
						: [...previousItem.data.notifications.recipients],
					template: values.map(({template}) => template),
					templateLanguage: values.map(
						({templateLanguage}) => templateLanguage
					),
				},
			},
		}));
	};

	return (
		<BaseNotificationsInfo
			executionType={executionType}
			executionTypeOptions={executionTypeOptions}
			notificationIndex={notificationIndex}
			scriptedRecipientUpdateSelectedItem={
				scriptedRecipientUpdateSelectedItem
			}
			setExecutionType={setExecutionType}
			updateSelectedItem={updateSelectedItem}
			{...restProps}
		/>
	);
};

NotificationsInfo.propTypes = {
	setContentName: PropTypes.func.isRequired,
};

export default NotificationsInfo;
