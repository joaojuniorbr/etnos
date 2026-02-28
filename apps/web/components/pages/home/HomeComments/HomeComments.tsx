'use client';

import 'swiper/css';

import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { dataComments } from './data-comments';
import Image from 'next/image';

import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiStarFill,
} from 'react-icons/ri';
import { Ref, useCallback, useRef } from 'react';

export const HomeComments = () => {
	const sliderRef: Ref<SwiperRef> = useRef(null);

	const handlePrev = useCallback(() => {
		if (!sliderRef.current) return;
		sliderRef.current.swiper.slidePrev();
	}, []);

	const handleNext = useCallback(() => {
		if (!sliderRef.current) return;
		sliderRef.current.swiper.slideNext();
	}, []);

	return (
		<section className='p-6 md:py-16 lg:py-20 bg-amber-50'>
			<h2 className='uppercase text-xl text-primary font-black md:text-4xl mb-10 text-center'>
				O QUE ESTÃO FALANDO DA ETNOS?
			</h2>

			<div className='max-w-3xl mx-auto text-center relative xl:max-w-6xl '>
				<button
					className='absolute top-1/2 -translate-x-full -translate-y-6 -left-4 rounded-full w-12 h-12 justify-center items-center bg-yellow-400/40 hidden cursor-pointer text-primary lg:flex'
					onClick={handlePrev}
				>
					<RiArrowLeftSLine size={32} />
				</button>

				<div
					className='absolute top-1/2 translate-x-full -translate-y-6 -right-4 rounded-full w-12 h-12 justify-center items-center bg-yellow-400/40 hidden cursor-pointer text-primary lg:flex'
					onClick={handleNext}
				>
					<RiArrowRightSLine size={32} />
				</div>

				<Swiper
					ref={sliderRef}
					navigation={true}
					breakpoints={{
						767: {
							spaceBetween: 24,
							slidesPerView: 3,
						},
					}}
				>
					{dataComments.map((comment) => (
						<SwiperSlide key={comment.name}>
							<div className='bg-white p-6 text-center rounded-lg'>
								<Image
									src={comment.image}
									alt={comment.name}
									width={80}
									height={80}
									className='w-16 h-16 rounded-full object-cover mx-auto'
								/>
								<h3 className='font-bold text-xl mb-2 mt-1'>{comment.name}</h3>
								<div className='flex justify-center gap-1 mb-4'>
									{Array.from({ length: comment.rate }).map((_, i) => (
										<RiStarFill key={i} size={16} className='text-amber-400' />
									))}
								</div>
								<p className='leading-5 font-light text-base'>
									{comment.comment}
								</p>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};
