import { GetAppModal } from './components/GetAppModal/GetAppModal';
import {AppCreationFlow} from './pages/AppCreationFlow/AppCreationFlow';
import {PublishedAppsDashboardPage} from './pages/PublishedAppsDashboardPage/PublishedAppsDashboardPage';
import {PurchasedAppsDashboardPage} from './pages/PurchasedAppsDashboardPage/PurchasedAppsDashboardPage';

import contactIcon from './assets/icons/contact-icon.svg';
import { useState } from 'react';

interface AppRoutesProps {
	route: string;
}
export default function AppRoutes({route}: AppRoutesProps) {
	const [visible, setVisible] = useState(false);

	if (route === 'create-new-app') {
		return <AppCreationFlow />;
	}
	else if (route === 'purchased-apps-dashboard') {
		return (
			<>
				<PurchasedAppsDashboardPage />

				<button onClick={() => setVisible(true)}>Show Modal</button>

				{visible && (
					<GetAppModal
						// We were assuming the account, app and channelId info would be passed by the screen that will trigger the modal 
						// (Matt already asked for us to refactor that and just receive the ids and we would make requests to get the rest of the information).

						// Account email, image and name info are just used to be displayed on the modal, but the id will be passed on the checkout request. 
						// So even if we pass "incorrect mocked" email, image and name, if the account id exists, later the order will have the correct account info.
						// The same can be applied to the app.
						account={{
							email: 'mauren.hall@acme.com',
							image: contactIcon,
							name: 'Hourglass',
							// Pass a valid account id
							id: 0,
						}}
						app={{
							createdBy: 'Smart Co.',
							image: contactIcon,
							name: 'New App',
							price: 0,
							// Pass a valid app id
							id: 0,
							version: 'v0.01',
						}}
						handleClose={() => setVisible(false)}
						// Pass a valid channel id
						channelId={0}
					/>
				)}
			</>
		)
	}

	return <PublishedAppsDashboardPage />;
}
