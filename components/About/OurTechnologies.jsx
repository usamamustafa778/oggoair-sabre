import React from 'react';
import FullContainer from '../common/FullContainer';
import Container from '../common/Container';

const technologies = [
    {
        title: 'Seamless Integration',
        desc: 'intuitive design for a smooth booking experience',
    },
    {
        title: 'Real-Time Data',
        desc: 'up-to-date information on availability and prices',
    },
    {
        title: 'User-Friendly Interface',
        desc: 'intuitive design for a smooth booking experience',
    },
    {
        title: 'Smart Recommendations',
        desc: 'personalized suggestions for you',
    },
    {
        title: 'Secure Transactions',
        desc: 'encrypted payment processes for your safety',
    },
    {
        title: 'Advanced Search Algorithms',
        desc: 'find the best travel options fast',
    },
];

export default function OurTechnologies() {
    return (
        <FullContainer className="w-full bg-primary-bg py-20 lg:py-32 flex flex-col items-center">
            <Container className="w-full flex flex-col items-center">
                <h2 className="text-4xl lg:text-[45px] underline decoration-2 underline-offset-5 text-primary-text mb-12 font-regista-regular">Our technology</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {technologies.map((tech, i) => (
                        <div className='flex flex-col items-center justify-center'>
                        <div
                            key={tech.title}
                            className="bg-[#f2f2f4] rounded-2xl px-5 py-8 flex w-full flex-col items-center text-center  "
                        >
                            <div className="text-xl w-full rounded-md bg-white font-semibold text-primary-text mb-2 ">{tech.title}</div>
                            <div className="text-lg text-primary-text rounded-lg bg-white py-3 px-4 w-full opacity-80 font-normal leading-snug ">{tech.desc}</div>
                        </div>  
                        </div>
                    ))}
                </div>
            </Container>
        </FullContainer>
    );
}
