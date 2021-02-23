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
import ClayPopover from '@clayui/popover';
import {AppContext} from 'app-builder-web/js/AppContext.es';
import useBackUrl from 'app-builder-web/js/hooks/useBackUrl.es';
import useDeployApp from 'app-builder-web/js/hooks/useDeployApp.es';
import ListApps, {Actions} from 'app-builder-web/js/pages/apps/ListApps.es';
import {COLUMNS, FILTERS} from 'app-builder-web/js/pages/apps/constants.es';
import {parseResponse} from 'data-engine-js-components-web/js/utils/client.es';
import {
	errorToast,
	successToast,
} from 'data-engine-js-components-web/js/utils/toast.es';
import {createResourceURL, fetch} from 'frontend-js-web';
import {compile} from 'path-to-regexp';
import React, {useContext, useState} from 'react';

import MissingRequiredFieldsModal from './edit/MissingRequiredFieldsModal.es';
import {getDataDefinition, getFormViews} from './edit/actions.es';
import {checkRequiredFields} from './edit/utils.es';

export default ({history, scope, ...props}) => {
	const {baseResourceURL, namespace, userId} = useContext(AppContext);
	const withBackUrl = useBackUrl();
	const {deployApp} = useDeployApp();
	const [currentApp, setCurrentApp] = useState({dataDefinitionName: ''});
	const [showTooltip, setShowTooltip] = useState(false);
	const [deployCallback, setDeployCallback] = useState({});
	const [
		missingRequiredFieldsModalProps,
		setMissingRequiredFieldsModalProps,
	] = useState({
		fieldType: '',
		visible: false,
	});

	const [firstColumn, ...otherColumns] = COLUMNS;
	const lastColumn = otherColumns.pop();

	const columns = [
		firstColumn,
		{
			key: 'dataDefinitionName',
			value: Liferay.Language.get('object'),
		},
		...otherColumns,
		{
			key: 'version',
			value: Liferay.Language.get('version'),
		},
		lastColumn,
	];

	const newAppLink = compile(props.editPath[0])();

	const emptyState = {
		button: () => (
			<ClayButton
				displayType="secondary"
				onClick={() => history.push(newAppLink)}
			>
				{Liferay.Language.get('create-new-app')}
			</ClayButton>
		),
		description: Liferay.Language.get(
			'integrate-the-data-collection-and-management-of-an-object-with-a-step-driven-workflow-process'
		),
		title: Liferay.Language.get('there-are-no-apps-yet'),
	};

	const filters = [
		...FILTERS,
		{
			items: [
				{
					label: Liferay.Language.get('me'),
					value: userId,
				},
			],
			key: 'userIds',
			multiple: true,
			name: 'author',
		},
	];

	const getEditAppUrl = ({dataDefinitionId, id}) => {
		return withBackUrl(
			compile(props.editPath[1])({
				appId: id,
				dataDefinitionId,
				objectType: props.match.params.objectType,
			})
		);
	};

	const confirmDelete = ({id}) => {
		return new Promise((resolve) => {
			const confirmed = confirm(
				Liferay.Language.get('are-you-sure-you-want-to-delete-this')
			);

			if (confirmed) {
				fetch(
					createResourceURL(baseResourceURL, {
						p_p_resource_id:
							'/app_builder_workflow/delete_app_builder_app',
					}),
					{
						body: new URLSearchParams(
							Liferay.Util.ns(namespace, {
								appBuilderAppId: id,
							})
						),
						method: 'POST',
					}
				)
					.then(parseResponse)
					.then(() => {
						successToast(
							Liferay.Language.get(
								'the-item-was-deleted-successfully'
							)
						);

						resolve(true);
					})
					.catch(({errorMessage}) => {
						errorToast(errorMessage);

						resolve(false);
					});
			}
			else {
				resolve(false);
			}
		});
	};

	function validateFormViewMissingRequiredFields(app) {
		const isFormViewMissingRequiredFields = (app) => {
			return getDataDefinition(app.dataDefinitionId).then(
				(dataDefinition) => {
					setCurrentApp(app);

					return getFormViews(
						dataDefinition.id,
						dataDefinition.defaultLanguageId
					).then((formViews) => {
						let formView = formViews.find(
							({id}) => id === app.dataLayoutId
						);
						formView = checkRequiredFields(
							[formView],
							dataDefinition
						)[0];

						if (formView.missingRequiredFields.nativeField) {
							return 'nativeField';
						}

						if (formView.missingRequiredFields.customField) {
							return 'customField';
						}
					});
				}
			);
		};

		return isFormViewMissingRequiredFields(app).then((missing) => {
			if (missing) {
				return new Promise((resolve, reject) => {
					setDeployCallback({reject, resolve});
					setMissingRequiredFieldsModalProps({
						fieldType: missing,
						nativeActionOnClick: () =>
							history.push(getEditAppUrl(app)),
						visible: true,
					});
				});
			}
		});
	}

	const actions = [...Actions(validateFormViewMissingRequiredFields)];

	actions.splice(-1, 1, {
		action: confirmDelete,
		name: Liferay.Language.get('delete'),
		show: ({active}) => !active,
	});

	return (
		<>
			<ListApps
				history={history}
				listViewProps={{
					actions,
					addButton: () => (
						<ClayPopover
							alignPosition="bottom-right"
							header={Liferay.Language.get(
								'workflow-powered-app'
							)}
							show={showTooltip}
							trigger={
								<ClayButtonWithIcon
									className="nav-btn nav-btn-monospaced"
									onClick={() => history.push(newAppLink)}
									onMouseOut={() => setShowTooltip(false)}
									onMouseOver={() => setShowTooltip(true)}
									symbol="plus"
								/>
							}
						>
							{Liferay.Language.get(
								'create-an-app-that-integrates-a-step-driven-workflow-process'
							)}
						</ClayPopover>
					),
					columns,
					emptyState,
					endpoint: `/o/app-builder/v1.0/apps?scope=${scope}`,
					filters,
				}}
				{...props}
			/>

			<MissingRequiredFieldsModal
				dataObjectName={currentApp.dataDefinitionName}
				onDeploy={() =>
					deployApp(currentApp)
						.then((result) => {
							setMissingRequiredFieldsModalProps({
								visible: false,
							});
							deployCallback.resolve(result);
						})
						.catch(deployCallback.reject)
				}
				setMissingRequiredFieldsModalProps={
					setMissingRequiredFieldsModalProps
				}
				{...missingRequiredFieldsModalProps}
			/>
		</>
	);
};
