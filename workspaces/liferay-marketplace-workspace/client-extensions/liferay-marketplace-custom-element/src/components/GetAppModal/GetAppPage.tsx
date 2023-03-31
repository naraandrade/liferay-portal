import { GetAppModal } from '../../components/GetAppModal/GetAppModal';
import { useState } from 'react';

export function GetAppPage() {
	const [visible, setVisible] = useState(false);

	return (
		<>
			<button onClick={() => setVisible(true)}>Show Modal</button>

			{visible && (
				<GetAppModal
					handleClose={() => setVisible(false)}
				/>
			)}
		</>
	);
}





