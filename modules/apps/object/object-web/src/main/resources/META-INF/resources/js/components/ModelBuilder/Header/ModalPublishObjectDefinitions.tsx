/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {Text} from '@clayui/core';
import {ClayCheckbox} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayList from '@clayui/list';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import ClayModal from '@clayui/modal';
import {Observer} from '@clayui/modal/lib/types';
import {API, getLocalizableLabel} from '@liferay/object-js-components-web';
import {sub} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';
import {Elements, FlowElement, isNode} from 'react-flow-renderer';

import {defaultLanguageId} from '../../../utils/constants';
import {TYPES} from '../ModelBuilderContext/typesEnum';
import {ObjectRelationshipEdgeData, TAction} from '../types';

import './ModalPublishObjectDefinitions.scss';

enum STATUS {
	APPROVED = 0,
	DRAFT = 2,
	PENDING = 1,
	REJECTED = -1,
}

interface ObjectDefinitionStatus {
	code: number;
	label?: string;
	label_i18n?: string;
}

interface ModalPublishObjectDefinitionsProps {
	disableAutoClose: boolean;
	dispatch: React.Dispatch<TAction>;
	elements: Elements<ObjectDefinitionNodeData | ObjectRelationshipEdgeData>;
	observer: Observer;
	onClose: () => void;
}

interface SelectedItem {
	id: number;
	message?: string;
	status: ObjectDefinitionStatus;
}

type TStatus = 'danger' | 'info' | 'success' | 'warning';

export function ModalPublishObjectDefinitions({
	disableAutoClose,
	dispatch,
	elements,
	observer,
	onClose,
}: ModalPublishObjectDefinitionsProps) {
	const objectDefinitionNodes = elements.filter((element) =>
		isNode(element)
	) as Elements<ObjectDefinitionNodeData>;

	const [filteredObjectDefinitionNodes] = useState<
		Elements<ObjectDefinitionNodeData>
	>(
		objectDefinitionNodes.filter(
			(element) =>
				isNode(element) && element.data?.status?.code === STATUS.DRAFT
		)
	);
	const [messageHeaderModal, setMessageHeaderModal] = useState<string>(
		Liferay.Language.get('confirm-publishing')
	);
	const [publishStatus, setPublishStatus] = useState<number>(STATUS.DRAFT);
	const [selectAll, setSelectAll] = useState<boolean>(false);
	const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

	const updateObjectStatus = (
		items: SelectedItem[],
		id: number,
		status: ObjectDefinitionStatus,
		message?: string
	) => {
		return items.map((item) => {
			if (item.id === id) {
				return {
					id,
					status,
					...(status.code === STATUS.REJECTED && {message}),
				};
			}
			else {
				return item;
			}
		}) as SelectedItem[];
	};

	const publishObjectDefinition = (
		objectId: number
	): Promise<ObjectDefinition | number> => {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise<ObjectDefinition | number>(async (resolve) => {
			try {
				const response = await API.publishObjectDefinitionById(
					objectId
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.title);
				}

				setSelectedItems((prevState) =>
					updateObjectStatus(prevState, objectId, data.status)
				);

				resolve(data);
			}
			catch (error: any) {
				setSelectedItems((prevState) =>
					updateObjectStatus(
						prevState,
						objectId,
						{code: STATUS.REJECTED},
						error.message
					)
				);

				// don't throw reject, so that it doesn't go to the catch flow of the promise.all

				resolve(STATUS.REJECTED);
			}
		});
	};

	const handleOnClickPublish = async () => {
		setMessageHeaderModal(`${Liferay.Language.get('publishing')}...`);
		setPublishStatus(STATUS.PENDING);

		const publishPromises = selectedItems.map(({id, status}) => {
			setSelectedItems((prevState) =>
				updateObjectStatus(prevState, id, status)
			);

			return publishObjectDefinition(id);
		});

		try {
			const responses = await Promise.all(publishPromises);

			const hasErrorsResponse = responses.some(
				(response) =>
					typeof response === 'number' && response === STATUS.REJECTED
			);
			const filteredResponses = responses.filter(
				(response) => typeof response === 'object'
			);

			setMessageHeaderModal(
				!hasErrorsResponse
					? Liferay.Language.get('successfully-published')
					: Liferay.Language.get('published-with-errors')
			);
			setPublishStatus(
				!hasErrorsResponse ? STATUS.APPROVED : STATUS.REJECTED
			);

			const newElements = elements.map((element) => {
				if (isNode(element)) {
					const elementId =
						(element as FlowElement<ObjectDefinitionNodeData>).data
							?.id || 0;

					const response = (filteredResponses as ObjectDefinition[]).find(
						(response) => response.id === elementId
					);

					if (response) {
						return {
							...element,
							data: {
								...element.data,
								status: response.status,
							},
						};
					}

					return element;
				}

				return element;
			});

			dispatch({
				payload: {
					newElements,
				},
				type: TYPES.SET_ELEMENTS,
			});
		}
		catch (error) {
			setMessageHeaderModal(Liferay.Language.get('confirm-publishing'));
			setPublishStatus(STATUS.REJECTED);
		}
	};

	const handleSelectAll = (
		actionType?: 'check-all' | 'check-remove-all'
	): void => {
		if (actionType) {
			const allSelected =
				selectedItems.length === filteredObjectDefinitionNodes.length;

			if (allSelected && actionType !== 'check-all') {
				setSelectAll(false);
				setSelectedItems([]);
			}
			else {
				const newSelectedItems = filteredObjectDefinitionNodes.map(
					(filteredObjectDefinitionNode) => {
						const {data} = filteredObjectDefinitionNode;

						return {id: data?.id!, status: data?.status!};
					}
				);

				setSelectAll(true);
				setSelectedItems(newSelectedItems);
			}
		}
	};

	const handleCheckboxChange = (itemId: number): void => {
		if (selectedItems.some((item) => item.id === itemId)) {
			setSelectedItems(
				selectedItems.filter((item) => item.id !== itemId)
			);
		}
		else {
			const item = objectDefinitionNodes.find(
				(objectDefinitionNode) =>
					objectDefinitionNode.data?.id === itemId
			)!;

			setSelectedItems([
				...selectedItems,
				{id: itemId, status: item.data?.status!},
			]);
		}
	};

	const renderStatusModal = (): TStatus => {
		switch (publishStatus) {
			case STATUS.APPROVED:
				return 'success';
			case STATUS.PENDING:
				return 'info';
			case STATUS.REJECTED:
				return 'warning';
			default:
				return 'warning';
		}
	};

	useEffect(() => setSelectAll(!!selectedItems.length), [selectedItems]);

	return (
		<ClayModal
			className="lfr-object__object-view-modal-object-definitions"
			disableAutoClose={disableAutoClose}
			observer={observer}
			status={renderStatusModal()}
		>
			<ClayModal.Header>{messageHeaderModal}</ClayModal.Header>

			<ClayModal.Body>
				<div className="c-mb-sm-4">
					<Text size={3}>
						{`${Liferay.Language.get(
							'publishing-all-draft-objects-at-once-can-make-them-available-for-creating-entries'
						)} ${Liferay.Language.get(
							'please-check-before-confirming'
						)}`}
					</Text>
				</div>

				{publishStatus === STATUS.DRAFT && (
					<div
						className={`lfr-object__object-view-modal-object-definitions-select-all-checkbox c-px-sm-3 c-mb-sm-2 ${
							selectAll ? 'active' : ''
						}`}
					>
						<ClayCheckbox
							checked={selectAll}
							indeterminate={
								selectAll &&
								selectedItems.length !==
									filteredObjectDefinitionNodes.length
							}
							label={`${sub(
								Liferay.Language.get('x-of-x-items-selected'),
								selectedItems.length,
								filteredObjectDefinitionNodes.length
							)}`}
							onChange={() => handleSelectAll('check-remove-all')}
						/>

						<ClayButton
							className="c-px-sm-0 text-3 text-weight-semi-bold"
							displayType="link"
							onClick={() => handleSelectAll('check-all')}
						>
							{Liferay.Language.get('select-all')}
						</ClayButton>
					</div>
				)}

				<ClayList className="container-list">
					{filteredObjectDefinitionNodes.map(
						(filteredObjectDefinitionNode) => {
							const {data, id} = filteredObjectDefinitionNode;

							const selectedItem = selectedItems.find(
								(item) => item.id === data?.id!
							);

							const isSelected = selectedItem?.id === data?.id!;

							return (
								<ClayList.Item
									className={`lfr-object__object-view-modal-object-definitions-list-item ${
										isSelected ? 'active' : ''
									}`}
									key={id}
								>
									<div>
										{publishStatus === STATUS.DRAFT && (
											<ClayCheckbox
												checked={isSelected}
												disabled={
													selectedItem?.status !==
														undefined &&
													[
														STATUS.APPROVED,
														STATUS.PENDING,
													].includes(
														selectedItem?.status
															?.code
													)
												}
												onChange={() =>
													handleCheckboxChange(
														data?.id!
													)
												}
											/>
										)}

										<ClayIcon symbol="catalog" />

										<div>
											<div>
												<Text
													size={3}
													weight="semi-bold"
												>
													{getLocalizableLabel(
														defaultLanguageId,
														data?.label,
														data?.name
													)}
												</Text>
											</div>

											{selectedItem?.status?.code ===
												STATUS.REJECTED && (
												<span className="rejected text-danger">
													<ClayIcon
														color="danger"
														symbol="exclamation-full"
													/>

													<Text size={2}>
														{selectedItem?.message}
													</Text>
												</span>
											)}
										</div>
									</div>

									<div>
										{selectedItem?.status?.code ===
											STATUS.PENDING && (
											<ClayLoadingIndicator
												displayType="secondary"
												size="sm"
											/>
										)}

										{selectedItem?.status?.code ===
											STATUS.APPROVED && (
											<Text color="success">
												<ClayIcon symbol="check" />
											</Text>
										)}
									</div>
								</ClayList.Item>
							);
						}
					)}
				</ClayList>
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					publishStatus === STATUS.APPROVED ||
					publishStatus === STATUS.REJECTED ? (
						<ClayButton.Group key={1} spaced>
							<ClayButton displayType="primary" onClick={onClose}>
								{Liferay.Language.get('close')}
							</ClayButton>
						</ClayButton.Group>
					) : (
						<ClayButton.Group key={2} spaced>
							<>
								<ClayButton
									className="c-mr-sm-2"
									displayType="secondary"
									onClick={onClose}
								>
									{Liferay.Language.get('cancel')}
								</ClayButton>

								<ClayButton
									disabled={
										!selectedItems.length ||
										publishStatus === STATUS.PENDING
									}
									displayType="primary"
									onClick={handleOnClickPublish}
								>
									{publishStatus === STATUS.PENDING
										? Liferay.Language.get('please-wait') +
										  '...'
										: Liferay.Language.get(
												'publish-objects'
										  )}
								</ClayButton>
							</>
						</ClayButton.Group>
					)
				}
			></ClayModal.Footer>
		</ClayModal>
	);
}
