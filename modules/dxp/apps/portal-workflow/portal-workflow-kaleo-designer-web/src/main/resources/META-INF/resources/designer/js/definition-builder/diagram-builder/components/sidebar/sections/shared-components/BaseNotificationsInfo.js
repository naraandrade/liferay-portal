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

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import {ClayDropDownWithItems} from '@clayui/drop-down';
import ClayForm, {ClayInput, ClaySelect} from '@clayui/form';
import PropTypes from 'prop-types';
import React, {useContext, useEffect, useState} from 'react';

import {DiagramBuilderContext} from '../../../../DiagramBuilderContext';
import ScriptInput from '../../../shared-components/ScriptInput';
import SidebarPanel from '../../SidebarPanel';
import Role from '../notifications/Role';
import RoleType from '../notifications/RoleType';
import User from '../notifications/User';
import {getRecipientTypeOptions} from '../utils';

const getRecipientType = (assignmentType) => {
	if (assignmentType === 'roleId') {
		return 'role';
	} else if (assignmentType === 'roleType') {
		return 'roleType';
	} else if (assignmentType === 'scriptedRecipient') {
		return 'scriptedRecipient';
	} else if (assignmentType === 'taskAssignees') {
		return 'taskAssignees';
	} else if (assignmentType === 'user') {
		return 'user';
	} else {
		return null;
	}
};

const recipientTypeComponents = {
	role: Role,
	roleType: RoleType,
	scriptedRecipient: ScriptInput,
	user: User,
};

const templateLanguageOptions = [
	{
		label: Liferay.Language.get('freemarker'),
		value: 'freemarker',
	},
	{
		label: Liferay.Language.get('text'),
		value: 'text',
	},
	{
		label: Liferay.Language.get('velocity'),
		value: 'velocity',
	},
];

const BaseNotificationsInfo = ({
	executionType,
	executionTypeOptions,
	identifier,
	notificationIndex,
	scriptedRecipientUpdateSelectedItem,
	sectionsLength,
	setExecutionType,
	setSections,
	updateSelectedItem,
	updateTimersNotificationInfo,
	...restProps
}) => {
	const {selectedItem, setSelectedItem} = useContext(DiagramBuilderContext);

	const notificationsPath = executionType
		? selectedItem.data.notifications
		: selectedItem.data.taskTimers?.timerNotifications[notificationIndex];

	const [notificationDescription, setNotificationDescription] = useState(
		notificationsPath?.description?.[notificationIndex] || ''
	);
	const [notificationName, setNotificationName] = useState(
		notificationsPath?.name?.[notificationIndex] || ''
	);

	const [notificationTypeEmail, setNotificationTypeEmail] = useState(
		notificationsPath?.notificationTypes?.[notificationIndex]?.some(
			(value) => value.notificationType === 'email'
		) || false
	);

	const [
		notificationTypeUserNotification,
		setNotificationTypeUserNotification,
	] = useState(
		notificationsPath?.notificationTypes?.[notificationIndex]?.some(
			(value) => value.notificationType === 'user-notification'
		) || false
	);

	const [recipientType, setRecipientType] = useState(
		getRecipientType(
			notificationsPath?.recipients?.[notificationIndex]
				?.assignmentType?.[0]
		) || 'assetCreator'
	);
	const [template, setTemplate] = useState(
		notificationsPath?.template?.[notificationIndex] || ''
	);
	const [templateLanguage, setTemplateLanguage] = useState(
		notificationsPath?.templateLanguage?.[notificationIndex] || 'freemarker'
	);

	const [internalSections, setInternalSections] = useState([
		{identifier: `${Date.now()}-0`},
	]);

	const notificationTypesOptions = [
		{
			checked: notificationTypeEmail,
			label: Liferay.Language.get('email'),

			onBlur: () => {
				const notificationTypes = [];

				if (notificationTypeEmail) {
					notificationTypes.push({notificationType: 'email'});
				}
				if (notificationTypeUserNotification) {
					notificationTypes.push({
						notificationType: 'user-notification',
					});
				}
				updateNotificationInfo({
					description: notificationDescription,
					executionType,
					name: notificationName,
					notificationTypes,
					template,
					templateLanguage,
				});
			},

			onChange: (value) => {
				setNotificationTypeEmail(value);
			},

			type: 'checkbox',
			value: 'email',
		},
		{
			checked: notificationTypeUserNotification,
			label: Liferay.Language.get('user-notification'),

			onBlur: () => {
				const notificationTypes = [];

				if (notificationTypeEmail) {
					notificationTypes.push({notificationType: 'email'});
				}

				if (notificationTypeUserNotification) {
					notificationTypes.push({
						notificationType: 'user-notification',
					});
				}

				updateNotificationInfo({
					description: notificationDescription,
					executionType,
					name: notificationName,
					notificationTypes,
					template,
					templateLanguage,
				});
			},

			onChange: (value) => {
				setNotificationTypeUserNotification(value);
			},

			type: 'checkbox',
			value: 'userNotification',
		},
	];

	useEffect(() => {
		if (notificationsPath) {
			setSelectedItem((previousItem) => {
				let recipientDetails = {};

				if (recipientType === 'assetCreator') {
					recipientDetails = {assignmentType: ['user']};
				} else if (recipientType === 'taskAssignees') {
					recipientDetails = {assignmentType: ['taskAssignees']};
				}

				const currentRecipient = {
					...recipientDetails,
				};

				const previousItemNotificationsPath = executionType
					? previousItem.data.notifications
					: previousItem.data.taskTimers?.timerNotifications[
							notificationIndex
					  ];

				if (
					previousItemNotificationsPath.recipients?.[
						notificationIndex
					]
				) {
					previousItemNotificationsPath.recipients[
						notificationIndex
					] = {
						...previousItemNotificationsPath.recipients[
							notificationIndex
						],
						...currentRecipient,
					};
				} else {
					previousItemNotificationsPath.recipients = [];

					previousItemNotificationsPath.recipients[
						notificationIndex
					] = currentRecipient;
				}

				return previousItem;
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [notificationIndex, recipientType, setSelectedItem]);

	useEffect(() => {
		let sectionsData = [];

		const recipients =
			notificationsPath &&
			notificationsPath.recipients[notificationIndex];

		if (recipients && recipientType === 'roleType') {
			for (let i = 0; i < recipients.roleName.length; i++) {
				sectionsData.push({
					autoCreate: recipients.autoCreate?.[i],
					identifier: `${Date.now()}-${i}`,
					roleName: recipients.roleName[i],
					roleType: recipients.roleType[i],
				});
			}
		} else if (
			recipients &&
			notificationsPath.recipients[notificationIndex].sectionsData &&
			recipientType === 'user'
		) {
			sectionsData =
				notificationsPath.recipients[notificationIndex].sectionsData;
		}

		if (sectionsData.length) {
			setInternalSections(sectionsData);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const deleteSection = () => {
		setSections((prevSections) => {
			const newSections = prevSections.filter(
				(prevSection) => prevSection.identifier !== identifier
			);

			updateSelectedItem(newSections);

			return newSections;
		});
	};

	const updateNotificationsNotificationInfo = (item) => {
		if (item.name && item.template && item.notificationTypes.length) {
			setSections((prev) => {
				prev[notificationIndex] = {
					...prev[notificationIndex],
					...item,
				};

				updateSelectedItem(prev);

				return prev;
			});
		}
	};

	const updateNotificationInfo = (item) => {
		if (updateTimersNotificationInfo) {
			updateTimersNotificationInfo(item);
		} else {
			updateNotificationsNotificationInfo(item);
		}
	};

	const RecipientTypeComponent = recipientTypeComponents[recipientType];

	return (
		<SidebarPanel panelTitle={Liferay.Language.get('information')}>
			<ClayForm.Group>
				<label htmlFor="notificationName">
					{Liferay.Language.get('name')}

					<span className="ml-1 mr-1 text-warning">*</span>
				</label>

				<ClayInput
					autoComplete="off"
					id="notificationName"
					onBlur={() => {
						const notificationTypes = [];

						if (notificationTypeEmail) {
							notificationTypes.push({notificationType: 'email'});
						}

						if (notificationTypeUserNotification) {
							notificationTypes.push({
								notificationType: 'user-notification',
							});
						}

						updateNotificationInfo({
							description: notificationDescription,
							executionType,
							name: notificationName,
							notificationTypes,
							template,
							templateLanguage,
						});
					}}
					onChange={({target}) => setNotificationName(target.value)}
					placeholder={Liferay.Language.get('notification')}
					type="text"
					value={notificationName}
				/>
			</ClayForm.Group>

			<ClayForm.Group>
				<label htmlFor="notificationDescription">
					{Liferay.Language.get('description')}
				</label>

				<ClayInput
					autoComplete="off"
					id="notificationDescription"
					onBlur={() => {
						const notificationTypes = [];

						if (notificationTypeEmail) {
							notificationTypes.push({notificationType: 'email'});
						}

						if (notificationTypeUserNotification) {
							notificationTypes.push({
								notificationType: 'user-notification',
							});
						}

						updateNotificationInfo({
							description: notificationDescription,
							executionType,
							name: notificationName,
							notificationTypes,
							template,
							templateLanguage,
						});
					}}
					onChange={({target}) =>
						setNotificationDescription(target.value)
					}
					type="text"
					value={notificationDescription}
				/>
			</ClayForm.Group>

			<ClayForm.Group>
				<label htmlFor="template-language">
					{Liferay.Language.get('template-language')}
				</label>

				<ClaySelect
					aria-label="Select"
					id="template-language"
					onBlur={() => {
						const notificationTypes = [];

						if (notificationTypeEmail) {
							notificationTypes.push({notificationType: 'email'});
						}

						if (notificationTypeUserNotification) {
							notificationTypes.push({
								notificationType: 'user-notification',
							});
						}

						updateNotificationInfo({
							description: notificationDescription,
							executionType,
							name: notificationName,
							notificationTypes,
							template,
							templateLanguage,
						});
					}}
					onChange={({target}) => setTemplateLanguage(target.value)}
					value={templateLanguage}
				>
					{templateLanguageOptions.map((item) => (
						<ClaySelect.Option
							key={item.value}
							label={item.label}
							value={item.value}
						/>
					))}
				</ClaySelect>
			</ClayForm.Group>

			<ClayForm.Group>
				<label htmlFor="template">
					{Liferay.Language.get('template')}

					<span className="ml-1 mr-1 text-warning">*</span>
				</label>

				<ClayInput
					component="textarea"
					id="template"
					onBlur={() => {
						const notificationTypes = [];

						if (notificationTypeEmail) {
							notificationTypes.push({notificationType: 'email'});
						}

						if (notificationTypeUserNotification) {
							notificationTypes.push({
								notificationType: 'user-notification',
							});
						}

						updateNotificationInfo({
							description: notificationDescription,
							executionType,
							name: notificationName,
							notificationTypes,
							template,
							templateLanguage,
						});
					}}
					onChange={({target}) => setTemplate(target.value)}
					placeholder="${userName} sent you a ${entryType} for review in the workflow."
					type="text"
					value={template}
				/>
			</ClayForm.Group>

			<ClayForm.Group>
				<label htmlFor="notification-types">
					{Liferay.Language.get('notification-types')}

					<span className="ml-1 mr-1 text-warning">*</span>
				</label>

				<ClayDropDownWithItems
					items={notificationTypesOptions}
					trigger={
						<ClayInput
							id="notification-types"
							value={Liferay.Language.get('select')}
						/>
					}
				/>
			</ClayForm.Group>

			{executionType && (
				<ClayForm.Group>
					<label htmlFor="execution-type">
						{Liferay.Language.get('execution-type')}
					</label>

					<ClaySelect
						aria-label="Select"
						id="execution-type"
						onBlur={() => {
							const notificationTypes = [];
							if (notificationTypeEmail) {
								notificationTypes.push({
									notificationType: 'email',
								});
							}
							if (notificationTypeUserNotification) {
								notificationTypes.push({
									notificationType: 'user-notification',
								});
							}
							updateNotificationInfo({
								description: notificationDescription,
								executionType,
								name: notificationName,
								notificationTypes,
								template,
								templateLanguage,
							});
						}}
						onChange={({target}) => setExecutionType(target.value)}
						value={executionType}
					>
						{executionTypeOptions.map((item) => (
							<ClaySelect.Option
								key={item.value}
								label={item.label}
								value={item.value}
							/>
						))}
					</ClaySelect>
				</ClayForm.Group>
			)}

			<ClayForm.Group className="recipient-type-form-group">
				<label htmlFor="recipient-type">
					{Liferay.Language.get('recipient-type')}
				</label>

				<ClaySelect
					aria-label="Select"
					disabled={
						notificationName.trim() === '' ||
						template.trim() === '' ||
						(!notificationTypeEmail &&
							!notificationTypeUserNotification)
					}
					id="recipient-type"
					onChange={({target}) => {
						setRecipientType(target.value);

						const notificationTypes = [];

						if (notificationTypeEmail) {
							notificationTypes.push({notificationType: 'email'});
						}

						if (notificationTypeUserNotification) {
							notificationTypes.push({
								notificationType: 'user-notification',
							});
						}

						updateNotificationInfo({
							description: notificationDescription,
							executionType,
							name: notificationName,
							notificationTypes,
							template,
							templateLanguage,
						});
					}}
					value={recipientType}
				>
					{getRecipientTypeOptions().map((item) => (
						<ClaySelect.Option
							disabled={item.disabled}
							key={item.value}
							label={item.label}
							value={item.value}
						/>
					))}
				</ClaySelect>
			</ClayForm.Group>

			{recipientType !== 'assetCreator' &&
				recipientType !== 'taskAssignees' && (
					<SidebarPanel panelTitle={Liferay.Language.get('type')}>
						<ClayForm.Group className="recipient-type-form-group">
							{internalSections.map((props, index) => (
								<RecipientTypeComponent
									index={index}
									inputValue={
										notificationsPath?.recipients?.[
											notificationIndex
										]?.script?.[0]
									}
									key={`section-${props.identifier}`}
									notificationIndex={notificationIndex}
									sectionsLength={internalSections.length}
									setSections={setInternalSections}
									updateSelectedItem={
										scriptedRecipientUpdateSelectedItem
									}
									{...props}
									{...restProps}
								/>
							))}
						</ClayForm.Group>
					</SidebarPanel>
				)}

			<div className="sheet-subtitle" />

			<div className="section-buttons-area">
				<ClayButton
					className="mr-3"
					disabled={
						notificationName.trim() === '' ||
						template.trim() === '' ||
						(!notificationTypeEmail &&
							!notificationTypeUserNotification)
					}
					displayType="secondary"
					onClick={() =>
						setSections((prev) => {
							return [
								...prev,
								{identifier: `${Date.now()}-${prev.length}`},
							];
						})
					}
				>
					{Liferay.Language.get('new-notification')}
				</ClayButton>

				{sectionsLength > 1 && (
					<ClayButtonWithIcon
						className="delete-button"
						displayType="unstyled"
						onClick={deleteSection}
						symbol="trash"
					/>
				)}
			</div>
		</SidebarPanel>
	);
};

BaseNotificationsInfo.propTypes = {
	setContentName: PropTypes.func.isRequired,
};

export default BaseNotificationsInfo;
