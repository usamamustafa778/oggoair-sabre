import React from 'react'
import FullContainer from '../common/FullContainer'
import Container from '../common/Container'
import Image from 'next/image'

// Add gradient border styles
const gradientBorderStyle = {
    borderImage: 'linear-gradient(to right, #132968, transparent) 1',
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px'
}

export default function AboutBanner() {
    return (
        <FullContainer className='bg-primary-bg min-h-[50vh]'>
            <Container className='flex flex-col items-center justify-center pt-28 md:pt-48 pb-12 '>
                <div className='flex flex-col items-center justify-center w-full lg:py-6'>
                    <h1 className='text-4xl lg:text-[45px] underline decoration-2 underline-offset-5 text-[#22325a] mb-12 font-regista-regular'>About Us</h1>
                    <div className='flex flex-col items-center justify-center w-full border-8 p-2 sm:p-4 rounded-2xl border-white'>
                        <Image src='/st-images/about-banner.png' alt='about-banner' width={1200} height={1200} className='h-[200px] sm:h-[300px] md:h-[400px] lg:h-[465px] w-auto object-contain' />
                    </div>
                </div>
                <div className='py-4 md:leading-10 text-start w-full text-2xl md:text-3xl  text-primary-text font-semibold'>Online <br/>Travel <br/>Ajency</div>
            </Container>
            <Container className=' items-center justify-center max-w-[1250px] mx-auto'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center justify-center w-full p-4 font-primary-font text-primary-text gap-4 md:gap-8 lg:gap-16 xl:gap-28 text-sm md:text-2xl text-center max-w-[1200px] mx-auto lg:-mt-[320px]'>
                    <div className='p-4 lg:p-6 lg:py-8 rounded-2xl  bg-white'><p>since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey-from choosing a destination to returning home.</p></div>
                    <div className='p-4 lg:p-6 lg:py-8 rounded-2xl lg:-translate-y-24 bg-white'><p>since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey-from choosing a destination to returning home.</p></div>
                    <div className='grid grid-cols-2 lg:grid-cols-1 lg:-translate-y-36 sm:col-span-2 lg:col-span-1 items-center justify-center w-full text-left gap-4 md:gap-8 lg:gap-16 '>
                        <div className='p-4 lg:p-6 lg:py-8 w-full gap-4 rounded-2xl bg-primary-green/70 text-primary-text'>
                            <div className='flex flex-col w-full items-start justify-center gap-2 '>
                                <h2 className='text-xl md:text-5xl '>5+</h2>
                                <p className='text-lg md:text-2xl'>language</p>
                                <div className='w-full h-0.5 bg-gradient-to-r from-primary-text to-primary-text/40 rounded-full my-2 md:my-6'></div>
                            </div>
                            <div className='flex flex-col w-full items-start justify-center gap-2 '>
                                <h2 className='text-xl md:text-5xl  '>6</h2>
                                <p className='text-lg md:text-2xl'>locations</p>
                                <div className='w-full h-0.5 bg-gradient-to-r from-primary-text to-primary-text/40 rounded-full my-2 md:my-6'></div>
                            </div>      
                            <div className='flex flex-col w-full items-start justify-center gap-2  '>
                                <h2 className='text-xl md:text-5xl  '>10+</h2>
                                <p className='text-lg md:text-2xl lg:pb-6'>Years of <br/> experience</p>
                                <div className='w-full h-0.5 bg-gradient-to-r from-primary-text to-primary-text/40 rounded-full my-2 md:my-6'></div>
                            </div>
                        </div>
                        <div className='p-4 lg:p-8 lg:py-8 gap-4 rounded-2xl text-center bg-white'>
                            <p>since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey-from choosing a destination to returning home.</p>

                        </div>
                    </div>
                </div>
            </Container>
        </FullContainer>
    )
}