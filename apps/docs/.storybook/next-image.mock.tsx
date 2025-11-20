import * as React from 'react';

type NextImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	width?: number;
	height?: number;
};

const MockNextImage = ({
	src,
	alt,
	width,
	height,
	...props
}: NextImageProps) => {
	return (
		<img
			src={src as string}
			alt={alt as string}
			width={width}
			height={height}
			{...props}
		/>
	);
};

export default MockNextImage;
