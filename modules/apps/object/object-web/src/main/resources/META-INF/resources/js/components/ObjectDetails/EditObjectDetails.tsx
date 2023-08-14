/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {TreeView} from '@clayui/core';
import ClayPanel from '@clayui/panel';
import {
	API,
	BetaButton,
	getLocalizableLabel,
	openToast,
} from '@liferay/object-js-components-web';
import React, {useEffect, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import ObjectManagementToolbar from '../ObjectManagementToolbar';
import {ConfigurationContainer} from './ConfigurationContainer';
import {EntryDisplayContainer} from './EntryDisplayContainer';
import {ObjectDataContainer} from './ObjectDataContainer';
import {ScopeContainer} from './ScopeContainer';
import Sheet from './Sheet';
import {useObjectDetailsForm} from './useObjectDetailsForm';

import './ObjectDetails.scss';
import {AccountRestrictionContainer} from './AccountRestrictionContainer';
import {ExternalDataSourceContainer} from './ExternalDataSourceContainer';
import SidebarItem from './SidebarItem';
import {TranslationsContainer} from './TranslationsContainer';

export type KeyValuePair = {
	key: string;
	value: string;
};
interface EditObjectDetailsProps {
	backURL: string;
	companyKeyValuePair: KeyValuePair[];
	dbTableName: string;
	externalReferenceCode: string;
	hasPublishObjectPermission: boolean;
	hasUpdateObjectDefinitionPermission: boolean;
	isApproved: boolean;
	label: LocalizedValue<string>;
	nonRelationshipObjectFieldsInfo: {
		label: LocalizedValue<string>;
		name: string;
	}[];
	objectDefinitionId: number;
	pluralLabel: LocalizedValue<string>;
	portletNamespace: string;
	shortName: string;
	siteKeyValuePair: KeyValuePair[];
	storageTypes: LabelValueObject[];
}

function setAccountRelationshipFieldMandatory(
	values: Partial<ObjectDefinition>
) {
	const {objectFields} = values;

	const newObjectFields = objectFields?.map((field) => {
		if (field.name === values.accountEntryRestrictedObjectFieldName) {
			return {
				...field,
				required: true,
			};
		}

		return field;
	});

	return {
		...values,
		objectFields: newObjectFields,
	};
}

export default function EditObjectDetails({
	backURL,
	companyKeyValuePair,
	dbTableName,
	externalReferenceCode,
	hasPublishObjectPermission,
	hasUpdateObjectDefinitionPermission,
	isApproved,
	label,
	nonRelationshipObjectFieldsInfo,
	objectDefinitionId,
	pluralLabel,
	portletNamespace,
	shortName,
	siteKeyValuePair,
	storageTypes,
}: EditObjectDetailsProps) {
	const [objectFields, setObjectFields] = useState<ObjectField[]>([]);

	const {
		errors,
		handleChange,
		handleValidate,
		setValues,
		values,
	} = useObjectDetailsForm({
		initialValues: {
			defaultLanguageId: 'en_US',
			externalReferenceCode,
			id: objectDefinitionId,
			label,
			name: shortName,
			pluralLabel,
		},
		onSubmit: () => {},
	});

	const onSubmit = async (draft: boolean) => {
		const validationErrors = handleValidate();

		if (!Object.keys(validationErrors).length) {
			delete values.objectRelationships;
			delete values.objectActions;
			delete values.objectLayouts;
			delete values.objectViews;

			let objectDefinition = values;

			if (values.accountEntryRestricted) {
				objectDefinition = setAccountRelationshipFieldMandatory(values);
			}

			const saveResponse = await API.putObjectDefinitionByExternalReferenceCode(
				objectDefinition
			);

			if (!saveResponse.ok) {
				const {title} = (await saveResponse.json()) as {
					status: string;
					title: string;
				};

				openToast({
					message: title,
					type: 'danger',
				});

				return;
			}

			if (!draft) {
				const publishResponse = await API.publishObjectDefinitionById(
					values.id as number
				);

				if (!publishResponse.ok) {
					const {title} = (await publishResponse.json()) as {
						status: string;
						title: string;
					};

					openToast({
						message: title,
						type: 'danger',
					});

					return;
				}

				openToast({
					message: Liferay.Language.get(
						'the-object-was-published-successfully'
					),
					type: 'success',
				});

				setTimeout(() => window.location.reload(), 1000);

				return;
			}

			openToast({
				message: Liferay.Language.get(
					'the-object-was-saved-successfully'
				),
				type: 'success',
			});

			setTimeout(() => window.location.reload(), 1000);
		}
	};

	useEffect(() => {
		const makeFetch = async () => {
			const objectFieldsResponse = await API.getObjectFieldsByExternalReferenceCode(
				externalReferenceCode
			);
			const objectDefinitionResponse = await API.getObjectDefinitionByExternalReferenceCode(
				externalReferenceCode
			);

			setValues(objectDefinitionResponse);
			setObjectFields(objectFieldsResponse);
		};

		makeFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [objectDefinitionId]);

	const [treeViewItems, setTreeViewItems] = useState<TreeViewItem[]>([
		{
			children: [
				{id: 'oHobbit', name: 'O Hobbit', type: 'treeViewItem'},
				{
					id: 'aSociedadeDoAnel',
					name: 'A Sociedade do Anel',
					type: 'treeViewItem',
				},
				{
					id: 'asDuasTorres',
					name: 'As Duas Torres',
					type: 'treeViewItem',
				},
				{
					id: 'oRetornoDoRei',
					name: 'O Retorno do Rei',
					type: 'treeViewItem',
				},
			],
			id: 'lordOfTheRingsBooks',
			name: 'Lord of the Rings books',
			type: 'treeViewItem',
		},
		{
			id: 'cart2',
			name: 'Cart2',
			type: 'treeViewItem',
		},
	]);

	const fixedItems: TreeViewItem[] = [
		{id: 'author', index: 0, name: 'Author', type: 'treeViewItem'},
		{
			id: 'singleContainer',
			index: 1,
			name: 'Single Container',
			type: 'treeViewItem',
		},
	];

	type TreeViewItem = {
		children?: TreeViewItem[];
		id: string;
		index?: number;
		name: string;
		type: string;
	};

	return (
		<>
			<div className="lfr-objects__object-definition-details-management-toolbar">
				<ObjectManagementToolbar
					backURL={backURL}
					externalReferenceCode={externalReferenceCode}
					hasPublishObjectPermission={hasPublishObjectPermission}
					hasUpdateObjectDefinitionPermission={
						hasUpdateObjectDefinitionPermission
					}
					isApproved={isApproved}
					label={getLocalizableLabel(
						values.defaultLanguageId as Liferay.Language.Locale,
						values.label,
						values.name
					)}
					objectDefinitionId={objectDefinitionId}
					onSubmit={onSubmit}
					portletNamespace={portletNamespace}
					screenNavigationCategoryKey="details"
					setValues={setValues}
					system={values.system as boolean}
				/>
			</div>

			<DndProvider backend={HTML5Backend} context={window}>
				<div className="d-flex">
					<TreeView
						dragAndDrop
						items={treeViewItems}
						onItemMove={(item, parentItem, index) => {

							// Add external item to its respective position inside treeViewItems
							// TO DO: only execute the following code if the item is external because right now it's impacting the behavior for moving internal items

							const newTreeViewItems = treeViewItems;

							const updateParentItem = (
								array: TreeViewItem[]
							) => {
								const parent = array.find(
									(arrayItem) =>
										arrayItem.id === parentItem.id
								);

								if (parent) {
									const parentIndex = array.findIndex(
										(arrayItem) =>
											arrayItem.id === parentItem.id
									);

									parent.children?.splice(
										index.previous,
										0,
										item
									);

									array[parentIndex] = parent;
								}
								else {
									const allItemsWithChildren = array.map(
										(arrayItem) => arrayItem.children
									);

									if (allItemsWithChildren.length) {
										allItemsWithChildren.forEach((i) =>
											updateParentItem(i!)
										);
									}
								}
							};

							updateParentItem(newTreeViewItems);

							setTreeViewItems(newTreeViewItems);

							return false;
						}}
					>
						{(item: TreeViewItem) => (
							<TreeView.Item key={item.id}>
								<TreeView.ItemStack>
									{item.name}
								</TreeView.ItemStack>

								<TreeView.Group items={item.children}>
									{({id, name}) => (
										<TreeView.Item key={id}>
											{name}
										</TreeView.Item>
									)}
								</TreeView.Group>
							</TreeView.Item>
						)}
					</TreeView>

					<TreeView dragAndDrop items={fixedItems}>
						{({id, index, name, type}: TreeViewItem) => (
							<SidebarItem
								id={id}
								index={index}
								name={name}
								type={type}
							/>
						)}
					</TreeView>
				</div>
			</DndProvider>

			<div className="lfr-objects__object-definition-details">
				<Sheet title={Liferay.Language.get('basic-information')}>
					<ClayPanel
						displayTitle={Liferay.Language.get(
							'object-definition-data'
						)}
						displayType="unstyled"
					>
						<ClayPanel.Body>
							<ObjectDataContainer
								dbTableName={dbTableName}
								errors={errors}
								handleChange={handleChange}
								hasUpdateObjectDefinitionPermission={
									hasUpdateObjectDefinitionPermission
								}
								isApproved={isApproved}
								setValues={setValues}
								values={values}
							/>
						</ClayPanel.Body>
					</ClayPanel>

					<ClayPanel
						collapsable
						defaultExpanded
						displayTitle={Liferay.Language.get('entry-display')}
						displayType="unstyled"
					>
						<ClayPanel.Body>
							<EntryDisplayContainer
								errors={errors}
								nonRelationshipObjectFieldsInfo={
									nonRelationshipObjectFieldsInfo
								}
								objectFields={objectFields}
								setValues={setValues}
								values={values}
							/>
						</ClayPanel.Body>
					</ClayPanel>

					{Liferay.FeatureFlags['LPS-135430'] && (
						<ClayPanel
							collapsable
							defaultExpanded
							displayTitle={Liferay.Language.get(
								'external-data-source'
							)}
							displayType="unstyled"
						>
							<ClayPanel.Body>
								<div className="lfr__object-web-edit-object-details-external-data-source-container">
									<ExternalDataSourceContainer
										errors={errors}
										setValues={setValues}
										storageTypes={storageTypes}
										values={values}
									/>

									<div className="lfr__object-web-edit-object-details-external-data-source-container-beta">
										{values.storageType ===
											'salesforce' && <BetaButton />}
									</div>
								</div>
							</ClayPanel.Body>
						</ClayPanel>
					)}

					<ClayPanel
						collapsable
						defaultExpanded
						displayTitle={Liferay.Language.get('scope')}
						displayType="unstyled"
					>
						<ClayPanel.Body>
							<ScopeContainer
								companyKeyValuePair={companyKeyValuePair}
								errors={errors}
								hasUpdateObjectDefinitionPermission={
									hasUpdateObjectDefinitionPermission
								}
								isApproved={isApproved}
								setValues={setValues}
								siteKeyValuePair={siteKeyValuePair}
								values={values}
							/>
						</ClayPanel.Body>
					</ClayPanel>

					{(Liferay.FeatureFlags['LPS-167253']
						? values.modifiable
						: !values.system) && (
						<ClayPanel
							collapsable
							defaultExpanded
							displayTitle={Liferay.Language.get(
								'account-restriction'
							)}
							displayType="unstyled"
						>
							<ClayPanel.Body>
								<AccountRestrictionContainer
									errors={errors}
									isApproved={isApproved}
									objectFields={objectFields}
									setValues={setValues}
									values={values}
								/>
							</ClayPanel.Body>
						</ClayPanel>
					)}

					<ClayPanel
						collapsable
						defaultExpanded
						displayTitle={Liferay.Language.get('configuration')}
						displayType="unstyled"
					>
						<ClayPanel.Body>
							<ConfigurationContainer
								hasUpdateObjectDefinitionPermission={
									hasUpdateObjectDefinitionPermission
								}
								setValues={setValues}
								values={values}
							/>
						</ClayPanel.Body>
					</ClayPanel>

					{Liferay.FeatureFlags['LPS-172017'] && (
						<ClayPanel
							collapsable
							defaultExpanded
							displayTitle={Liferay.Language.get('translations')}
							displayType="unstyled"
						>
							<ClayPanel.Body>
								<TranslationsContainer
									setValues={setValues}
									values={values}
								/>
							</ClayPanel.Body>
						</ClayPanel>
					)}
				</Sheet>
			</div>
		</>
	);
}
