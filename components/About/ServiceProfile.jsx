import React from 'react'
import FullContainer from '../common/FullContainer'
import Container from '../common/Container'

export default function ServiceProfile() {
  return (
    <FullContainer className='bg-primary-bg'>
    <Container className="py-16 lg:pb-24 lg:pt-0 m-0 flex flex-col items-center justify-center">
    <h1 className='text-4xl lg:text-[45px] underline decoration-2 underline-offset-5 text-[#22325a] mb-12 font-regista-regular'> Service Profile</h1>
      <div className="bg-white rounded-3xl p-8 lg:p-12 box-border text-center">
        <p className="text-primary-text text-md leading-[1.5] font-sans m-0">
          since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey—from choosing a destination to returning home. since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey—from choosing a destination to returning home. since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey—from choosing a destination to returning home. since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey—from choosing a destination to returning home. since 2023, we've been helping our users find the best deals on flights, hotels, and car rentals, ensuring they travel in comfort. our goal is not just to help you save money, but to be your personal assistant throughout the entire journey—from choosing a destination to returning home.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 justify-center gap-4 mt-12 w-full">
        <div className="bg-primary-green rounded-[32px] py-8 lg:py-12 px-4  flex-1  text-center">
          <div className="font-semibold text-2xl text-primary-text  mb-2">Reliability</div>
          <div className="text-primary-text text-base md:text-lg">accurate flight information</div>
        </div>
        <div className="bg-primary-green rounded-[32px] py-8 lg:py-12 px-4  flex-1  text-center">
          <div className="font-semibold text-2xl text-primary-text mb-2">Transparency</div>
          <div className="text-primary-text text-base md:text-lg">honest prices, no hidden fees</div>
        </div>
        <div className="bg-primary-green rounded-[32px] py-8 lg:py-12 px-4  flex-1  text-center">
            <div className="font-semibold text-2xl text-primary-text mb-2">Convenience</div>
            <div className="text-primary-text text-base md:text-lg">easy search and booking</div>
        </div>
        <div className="bg-primary-green rounded-[32px] py-8 lg:py-12 px-4  flex-1  text-center">
         <div className="font-semibold text-2xl text-primary-text mb-2">Personalization</div>
          <div className="text-primary-text text-base md:text-lg">tailored recommendations</div>
        </div>
      </div>
    </Container>
    </FullContainer>
  )
}