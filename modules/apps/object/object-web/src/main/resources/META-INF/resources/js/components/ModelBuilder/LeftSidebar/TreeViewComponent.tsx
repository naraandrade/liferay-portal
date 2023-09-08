/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import {Text, TreeView} from '@clayui/core';
import {ClayDropDownWithItems} from '@clayui/drop-down';
import Icon from '@clayui/icon';
import {ClayTooltipProvider} from '@clayui/tooltip';
import {
	API,
	getLocalizableLabel,
	stringIncludesQuery,
} from '@liferay/object-js-components-web';
import classNames from 'classnames';
import {openToast, sub} from 'frontend-js-web';
import React, {useMemo} from 'react';
import {Node, useStore, useZoomPanHelper} from 'react-flow-renderer';

import './LeftSidebar.scss';
import {useObjectFolderContext} from '../ModelBuilderContext/objectFolderContext';
import {TYPES} from '../ModelBuilderContext/typesEnum';
import {
	LeftSidebarItemType,
	LeftSidebarObjectDefinitionItemType,
} from '../types';

const TYPES_TO_SYMBOLS = {
	objectDefinition: 'catalog',
	objectFolder: 'folder',
	objectGoToFolder: 'arrow-right-full',
	objectLink: 'link',
};

export default function TreeViewComponent({
	query,
	showActions,
}: {
	query: string;
	showActions?: boolean;
}) {
	const [
		{leftSidebarItems, selectedObjectFolder},
		dispatch,
	] = useObjectFolderContext();
	const store = useStore();
	const {setCenter} = useZoomPanHelper();

	const changeNodeViewButton = (hiddenNode: boolean, dispatch: Function) => (
		<ClayButtonWithIcon
			aria-label={
				hiddenNode
					? Liferay.Language.get('hidden')
					: Liferay.Language.get('show')
			}
			displayType="unstyled"
			onClick={(event) => {
				event.stopPropagation();
				dispatch();
			}}
			symbol={hiddenNode ? 'hidden' : 'view'}
		/>
	);

	const filteredItems = useMemo(() => {
		return leftSidebarItems.map((sidebarItem) => {
			if (!sidebarItem.objectDefinitions) {
				return sidebarItem;
			}

			const newObjectDefinitions = sidebarItem.objectDefinitions.filter(
				(objectDefinition) =>
					stringIncludesQuery(objectDefinition.label, query)
			);

			return {
				...sidebarItem,
				objectDefinitions: newObjectDefinitions,
			};
		});
	}, [leftSidebarItems, query]);

	const handleMove = async ({
		objectDefinitionId,
		objectFolderName,
	}: {
		objectDefinitionId: number;
		objectFolderName: string;
	}) => {
		const objectFoldersResponse = await API.getAllObjectFolders();

		const currentObjectFolder = objectFoldersResponse.find(
			(objectFolder) => objectFolder.name === objectFolderName
		);

		const objectDefinitionsFilteredByObjectFolder = await API.getObjectDefinitions(
			`filter=objectFolderExternalReferenceCode eq '${currentObjectFolder?.externalReferenceCode}'`
		);

		const objectDefinition = objectDefinitionsFilteredByObjectFolder.find(
			(objectDefinition) => objectDefinition.id === objectDefinitionId
		) as ObjectDefinitionNodeData;

		if (objectDefinition) {
			const movedObjectDefinition: ObjectDefinitionNodeData = {
				...objectDefinition,
				objectFolderExternalReferenceCode:
					selectedObjectFolder.externalReferenceCode,
			};

			try {
				const newObjectDefinition = (await API.save({
					item: movedObjectDefinition,
					method: 'PATCH',
					returnValue: true,
					url: `/o/object-admin/v1.0/object-definitions/${objectDefinition?.id}`,
				})) as ObjectDefinition;

				dispatch({
					payload: {
						newObjectDefinition,
						selectedObjectFolderName: selectedObjectFolder.name,
					},
					type: TYPES.ADD_NEW_NODE_TO_OBJECT_FOLDER,
				});

				if (!objectDefinition.linked) {
					dispatch({
						payload: {
							currentObjectFolderName: currentObjectFolder!.name,
							deletedNodeName: newObjectDefinition.name,
						},
						type: TYPES.DELETE_OBJECT_FOLDER_NODE,
					});
				}

				openToast({
					message: sub(
						Liferay.Language.get('x-was-moved-successfully'),
						`<strong>${getLocalizableLabel(
							objectDefinition.defaultLanguageId,
							movedObjectDefinition.label
						)}</strong>`
					),
					type: 'success',
				});
			}
			catch (error) {}
		}
	};

	const onClickGoToFolder = (selectedObjectFolderName: string) => {
		dispatch({
			payload: {
				objectFolderName: selectedObjectFolderName,
			},
			type: TYPES.SET_OBJECT_FOLDER_NAME,
		});
	};

	const leftSidebarOtherObjectFoldersItems = filteredItems.filter(
		(item) => item.objectFolderName !== selectedObjectFolder.name
	);

	const leftSidebarSelectedObjectFolderItem = filteredItems.find(
		(item) => item.objectFolderName === selectedObjectFolder.name
	) as LeftSidebarItemType;

	const linkedObjectDefinitionNodes = leftSidebarSelectedObjectFolderItem.objectDefinitions?.filter(
		(objectDefinition) => objectDefinition.type === 'objectLink'
	);

	const newLeftSidebarOtherObjectFoldersItems = leftSidebarOtherObjectFoldersItems.map(
		(leftSidebarObjectFolderItem) => {
			const leftSidebarObjectDefinitionItems = leftSidebarObjectFolderItem.objectDefinitions?.map(
				(leftSidebarObjectDefinitionItem) => {
					const linkedObjectDefinitionNode = linkedObjectDefinitionNodes?.find(
						(linkedObjectDefinitionNode) =>
							linkedObjectDefinitionNode.id ===
							leftSidebarObjectDefinitionItem.id
					);
					if (linkedObjectDefinitionNode) {
						return {
							...leftSidebarObjectDefinitionItem,
							linked: true,
						};
					}

					return leftSidebarObjectDefinitionItem;
				}
			);

			return {
				...leftSidebarObjectFolderItem,
				objectDefinitions: leftSidebarObjectDefinitionItems,
			};
		}
	);

	return (
		<TreeView<LeftSidebarItemType | LeftSidebarObjectDefinitionItemType>
			items={
				showActions
					? newLeftSidebarOtherObjectFoldersItems
					: [leftSidebarSelectedObjectFolderItem]
			}
			nestedKey="objectDefinitions"
			onSelect={(item) => {
				if (
					selectedObjectFolder.objectDefinitions?.find(
						(objectDefinition) =>
							objectDefinition.id ===
							(item as LeftSidebarObjectDefinitionItemType).id
					)
				) {
					const {edges, nodes} = store.getState();

					dispatch({
						payload: {
							edges,
							nodes,
							selectedObjectDefinitionId: (item as LeftSidebarObjectDefinitionItemType).id.toString(),
						},
						type: TYPES.SET_SELECTED_NODE,
					});

					const selectedNode = (nodes as Node<
						ObjectDefinitionNodeData
					>[]).find(
						(objectDefinitionNode) =>
							objectDefinitionNode.data?.name ===
							(item as LeftSidebarObjectDefinitionItemType).name
					);

					if (selectedNode) {
						const x =
							selectedNode.__rf.position.x +
							selectedNode.__rf.width / 2;
						const y =
							selectedNode.__rf.position.y +
							selectedNode.__rf.height / 2;
						setCenter(x, y, 1.2);
					}
				}
			}}
			showExpanderOnHover={false}
		>
			{(item: LeftSidebarItemType) => (
				<TreeView.Item>
					<TreeView.ItemStack>
						<div className="lfr-objects__model-builder-left-sidebar-current-object-folder-container">
							<div className="lfr-objects__model-builder-left-sidebar-current-object-folder-content">
								<Icon symbol={TYPES_TO_SYMBOLS[item.type]} />

								<Text weight="semi-bold">{item.name}</Text>

								{item.objectFolderName !==
									selectedObjectFolder.name && (
									<ClayTooltipProvider>
										<div className="lfr-objects__model-builder-left-sidebar-go-to-folder-button">
											<ClayButton
												data-tooltip-align="bottom"
												displayType={null}
												onClick={() =>
													onClickGoToFolder(
														item.objectFolderName
													)
												}
												title={Liferay.Language.get(
													'go-to-folder'
												)}
											>
												<Icon
													className="text-5"
													symbol={
														TYPES_TO_SYMBOLS.objectGoToFolder
													}
												/>
											</ClayButton>
										</div>
									</ClayTooltipProvider>
								)}
							</div>

							{!showActions &&
								changeNodeViewButton(
									item.hiddenObjectFolderNodes,
									() =>
										dispatch({
											payload: {
												hiddenObjectFolderNodes:
													item.hiddenObjectFolderNodes,
												leftSidebarItem: item,
											},
											type: TYPES.BULK_CHANGE_NODE_VIEW,
										})
								)}
						</div>
					</TreeView.ItemStack>

					<TreeView.Group items={item.objectDefinitions}>
						{({
							hiddenNode,
							id,
							label,
							linked,
							name,
							selected,
							type,
						}) => (
							<TreeView.Item
								actions={
									showActions ? (
										type === 'objectLink' ? (
											<></>
										) : (
											<>
												<ClayDropDownWithItems
													items={[
														{
															label: Liferay.Language.get(
																'move-to-current-folder'
															),
															onClick: () =>
																handleMove({
																	objectDefinitionId: id,
																	objectFolderName:
																		item.objectFolderName,
																}),
															symbolLeft:
																'move-folder',
														},
													]}
													trigger={
														<ClayButton
															displayType={null}
															monospaced
														>
															<Icon symbol="ellipsis-v" />
														</ClayButton>
													}
												/>
											</>
										)
									) : (
										changeNodeViewButton(hiddenNode, () =>
											dispatch({
												payload: {
													hiddenNode,
													leftSidebarItem: item,
													objectDefinitionId: id,
													objectDefinitionName: name,
												},
												type: TYPES.CHANGE_NODE_VIEW,
											})
										)
									)
								}
								active={selected}
								className={classNames({
									'lfr-objects__model-builder-left-sidebar-item': selected,
									'lfr-objects__model-builder-left-sidebar-item-linked': linked,
								})}
							>
								<Icon symbol={TYPES_TO_SYMBOLS[type]} />

								{label}
							</TreeView.Item>
						)}
					</TreeView.Group>
				</TreeView.Item>
			)}
		</TreeView>
	);
}
