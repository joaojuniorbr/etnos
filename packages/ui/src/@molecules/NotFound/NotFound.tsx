import Image from 'next/image';

export const NotFound = () => (
	<div className='ui:flex ui:flex-1 ui:flex-col ui:items-center ui:justify-center ui:bg-white ui:px-6 ui:py-20'>
		<Image src='/images/404.png' alt='404' width={600} height={600} />
	</div>
);
