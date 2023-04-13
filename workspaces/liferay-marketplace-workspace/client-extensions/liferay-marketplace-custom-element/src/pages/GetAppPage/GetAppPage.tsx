import ClayButton from '@clayui/button';
import {useState} from 'react';

import {CustomerGateModal} from '../../components/CustomerGateModal/CustomerGateModal';
import {GetAppModal} from '../../components/GetAppModal/GetAppModal';
import {Liferay} from '../../liferay/liferay';

interface GetAppPageProps {
	userCustomerChecker: boolean;
}
export default function GetAppPage({userCustomerChecker}: GetAppPageProps) {
	const [showModal, setShowModal] = useState(false);

	return (
		<>
			<ClayButton onClick={() => setShowModal(true)}>Get App</ClayButton>
			{userCustomerChecker &&
			Liferay.ThemeDisplay.isSignedIn() &&
			showModal ? (
				<GetAppModal handleClose={() => setShowModal(false)} />
			) : (
				showModal && (
					<CustomerGateModal
						handleClose={() => setShowModal(false)}
					/>
				)
			)}
		</>
	);
}
