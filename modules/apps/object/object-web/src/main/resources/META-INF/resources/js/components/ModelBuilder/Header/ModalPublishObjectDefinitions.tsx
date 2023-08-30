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
import {API} from '@liferay/object-js-components-web';
import {sub} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';
import {Elements, FlowElement} from 'react-flow-renderer';

import './ModalPublishObjectDefinitions.scss';
import {TYPES} from '../ModelBuilderContext/typesEnum';
import {ObjectRelationshipEdgeData, TAction} from '../types';

enum STATUS {
	APPROVED = 0,
	DRAFT = 2,
	PENDING = 1,
	REJECTED = -1,
}

type TStatus = 'danger' | 'info' | 'success' | 'warning';

interface IModalPublishObjectDefinitionsProps {
	disableAutoClose: boolean;
	dispatch: React.Dispatch<TAction>;
	elements: Elements<ObjectDefinitionNodeData | ObjectRelationshipEdgeData>;
	observer: Observer;
	onClose: () => void;
}

interface ISelectedItem {
	id: number;
	message?: string;
	status?: STATUS;
}

export function ModalPublishObjectDefinitions({
	disableAutoClose,
	dispatch,
	elements,
	observer,
	onClose,
}: IModalPublishObjectDefinitionsProps) {
	const [filteredElements] = useState<
		Elements<ObjectDefinitionNodeData | ObjectRelationshipEdgeData>
	>(
		elements.filter(
			(element) =>
				(element as FlowElement<ObjectDefinitionNodeData>).data?.status
					?.code === STATUS.DRAFT
		)
	);
	const [messageHeaderModal, setMessageHeaderModal] = useState<string>(
		Liferay.Language.get('confirm-publishing')
	);
	const [selectAll, setSelectAll] = useState<boolean>(false);
	const [selectedItems, setSelectedItems] = useState<ISelectedItem[]>([]);
	const [publishStatus, setPublishStatus] = useState<number>(STATUS.DRAFT);

	const updateObjectStatus = (
		elements: ISelectedItem[],
		id: number,
		status: STATUS,
		message?: string
	) => {
		return elements.map((item) => {
			if (item.id === id) {
				return {
					id,
					status,
					...(status === STATUS.REJECTED && {message}),
				};
			}
			else {
				return item;
			}
		}) as ISelectedItem[];
	};

	const handleOnClickPublish = async () => {
		setPublishStatus(STATUS.PENDING);
		setMessageHeaderModal(`${Liferay.Language.get('publishing')}...`);

		const publishObjectDefinition = (objectId: number): Promise<number> => {
			// eslint-disable-next-line no-async-promise-executor
			return new Promise<number>(async (resolve) => {
				try {
					const response = await API.publishObjectDefinitionById(
						objectId
					);

					if (!response.ok) {
						const data = await response.json();

						throw new Error(data.title);
					}

					setSelectedItems((prevState) =>
						updateObjectStatus(prevState, objectId, STATUS.APPROVED)
					);

					resolve(objectId);
				}
				catch (error: any) {
					setSelectedItems((prevState) =>
						updateObjectStatus(
							prevState,
							objectId,
							STATUS.REJECTED,
							error.message
						)
					);

					// don't throw reject, so that it doesn't go to the catch flow of the promise.all

					resolve(STATUS.REJECTED);
				}
			});
		};

		const publishPromises = selectedItems.map((item) => {
			setSelectedItems((prevState) =>
				updateObjectStatus(prevState, item.id, STATUS.PENDING)
			);

			return publishObjectDefinition(item.id);
		});

		try {
			const responses = await Promise.all(publishPromises);

			const hasErrorsResponse = responses.some(
				(response) => response === STATUS.REJECTED
			);
			let filteredResponses = responses;

			if (hasErrorsResponse) {
				filteredResponses = responses.filter(
					(response) => response !== STATUS.REJECTED
				);
			}

			setMessageHeaderModal(
				!hasErrorsResponse
					? Liferay.Language.get('successfully-published')
					: Liferay.Language.get('published-with-errors')
			);
			setPublishStatus(
				!hasErrorsResponse ? STATUS.APPROVED : STATUS.REJECTED
			);

			const newArrayItems = elements.map((element) => {
				const elementId =
					(element as FlowElement<ObjectDefinitionNodeData>).data
						?.id || 0;

				if (filteredResponses.includes(elementId)) {
					return {
						...element,
						data: {
							...element.data,
							status: {
								code: STATUS.APPROVED,
								label: 'approved',
								label_i18n: Liferay.Language.get('approved'),
							},
						},
					};
				}

				return element;
			});

			dispatch({
				payload: {
					newElements: newArrayItems,
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
				selectedItems.length === filteredElements.length;

			if (allSelected && actionType !== 'check-all') {
				setSelectedItems([]);
				setSelectAll(false);
			}
			else {
				const allIds = filteredElements.map((object) => {
					const {data} = object as FlowElement<
						ObjectDefinitionNodeData
					>;

					return data?.id!;
				});

				setSelectedItems(allIds.map((id) => ({id})));
				setSelectAll(true);
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
			setSelectedItems([...selectedItems, {id: itemId}]);
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
						{Liferay.Language.get(
							'publishing-all-draft-objects-at-once-can-make-them-available-for-creating-entries'
						)}{' '}
                        
						{Liferay.Language.get('please-check-before-confirming')}
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
								selectedItems.length !== filteredElements.length
							}
							label={`${sub(
								Liferay.Language.get('x-of-x-items-selected'),
								selectedItems.length,
								filteredElements.length
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
					{filteredElements.map((object) => {
						const {data, id} = object as FlowElement<
							ObjectDefinitionNodeData
						>;

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
												].includes(selectedItem?.status)
											}
											onChange={() =>
												handleCheckboxChange(data?.id!)
											}
										/>
									)}

									<ClayIcon symbol="catalog" />

									<div>
										<div>
											<Text size={3} weight="semi-bold">
												{data?.label}
											</Text>
										</div>

										{selectedItem?.status ===
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
									{selectedItem?.status ===
										STATUS.PENDING && (
										<ClayLoadingIndicator
											displayType="secondary"
											size="sm"
										/>
									)}

									{selectedItem?.status ===
										STATUS.APPROVED && (
										<Text color="success">
											<ClayIcon symbol="check" />
										</Text>
									)}
								</div>
							</ClayList.Item>
						);
					})}
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
