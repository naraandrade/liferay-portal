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

import React, {useState} from 'react';

import {DEFAULT_LANGUAGE} from '../../../../../../source-builder/constants';
import BaseNotificationsInfo from '../../shared-components/BaseNotificationsInfo';

const ActionTypeNotification = ({
	actionSectionsIndex,
	actionType,
	setActionSections,
}) => {
	const [notificationSections, setNotificationSections] = useState([
		{identifier: `${Date.now()}-0`},
	]);

	const scriptedRecipientUpdateSelectedItem = ({target}) =>
		setActionSections((previousSections) => {
			const updatedSections = [...previousSections];

			updatedSections[actionSectionsIndex].recipients[
				actionSectionsIndex
			] = {
				assignmentType: ['scriptedRecipient'],
				script: [target.value],
				scriptLanguage: [DEFAULT_LANGUAGE],
			};

			return updatedSections;
		});

	const updateNotificationInfo = (item) => {
		if (item.name && item.template && item.notificationTypes.length) {
			console.log('chegou aqui', item);

			setActionSections((previousSections) => {
				const updatedSections = [...previousSections];

				updatedSections[actionSectionsIndex] = {
					...previousSections[actionSectionsIndex],
					...item,
					actionType,
					recipients: !updatedSections[actionSectionsIndex]
						?.recipients
						? [
								{
									assignmentType: ['user'],
								},
						  ]
						: [...updatedSections[actionSectionsIndex].recipients],
				};

				return updatedSections;
			});
		}
	};

	return notificationSections.map(({identifier, ...restProps}, index) => {
		return (
			<BaseNotificationsInfo
				identifier={identifier}
				key={index}
				notificationIndex={actionSectionsIndex}
				scriptedRecipientUpdateSelectedItem={
					scriptedRecipientUpdateSelectedItem
				}
				setSections={setNotificationSections}
				updateTimersNotificationInfo={updateNotificationInfo}
				{...restProps}
			/>
		);
	});
};

export default ActionTypeNotification;
