import React, { useState } from 'react';
import FullContainer from '../common/FullContainer';
import Container from '../common/Container';

export default function ContactForm() {
    const [agreed, setAgreed] = useState(false);

    return (
        <FullContainer>
            <Container className="flex flex-col md:flex-row w-full  py-8 md:py-16 gap-6 md:gap-4 lg:gap-14">
                {/* Left: Contact Info */}
                <div className="w-full md:w-[75%] flex flex-col justify-center items-start gap-6 md:gap-8">
                    <div>
                        <div className="font-bold text-xl md:text-2xl lg:text-3xl text-[#22325a] mb-1 lg:mb-2">New business</div>
                        <div className="text-base md:text-lg lg:text-2xl font-medium text-[#22325a]">info@oggoair.com</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl md:text-2xl lg:text-3xl text-[#22325a] mb-1 lg:mb-2">Press & Communications</div>
                        <div className="text-base md:text-lg lg:text-2xl font-medium text-[#22325a]">marketing@oggoair.com</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl md:text-2xl lg:text-3xl text-[#22325a] mb-1 lg:mb-2">Vacancies</div>
                        <div className="text-base md:text-lg lg:text-2xl font-medium text-[#22325a]">jobs@oggoair.com</div>
                    </div>
                </div>
                {/* Right: Form */}
                <form className="w-full md:w-[125%] bg-primary-green/40 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 flex flex-col gap-3">
                    <div className="text-xl md:text-2xl lg:text-[26px] font-medium text-primary-text mb-2 leading-tight md:leading-9">Want to know more or work with us?<br />Get in touch</div>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <label className="block text-primary-text text-sm md:text-base lg:text-lg font-medium mb-1">First name</label>
                                <input type="text" className="w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4ff5a] text-primary-text" required />
                            </div>
                            <div className="flex-1">
                                <label className="block text-primary-text text-sm md:text-base lg:text-lg font-medium mb-1">Last name</label>
                                <input type="text" className="w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4ff5a] text-primary-text" required />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1"> 
                                <label className="block text-primary-text text-sm md:text-base lg:text-lg font-medium mb-1">Email address</label>
                                <input type="email" className="w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4ff5a] text-[#22325a]" required />
                            </div>
                            <div className="flex-1">
                                <label className="block text-primary-text text-sm md:text-base lg:text-lg font-medium mb-1">Phone number (optional)</label>
                                <input type="tel" className="w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4ff5a] text-[#22325a]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-primary-text text-sm md:text-base lg:text-lg font-medium mb-1">Company name (optional)</label>
                            <input type="text" className="w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4ff5a] text-[#22325a]" />
                        </div>
                        <div>
                            <label className="block text-primary-text text-sm md:text-base lg:text-lg font-medium mb-1 mt-3">Message</label>
                            <textarea rows={3} className="w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4ff5a] text-[#22325a] resize-none" required />
                        </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                        <input id="privacy" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="accent-[#b6e23a] border-2 border-primary-green w-4 h-4 mt-1" required />
                        <label htmlFor="privacy" className="text-[#22325a] text-sm md:text-base">I agree to the <a href="/privacy" className="underline">privacy policy</a></label>
                    </div>
                    <button type="submit" className="mt-4 w-full md:w-36 py-2 rounded-full bg-primary-green text-primary-text font-bold text-base md:text-lg shadow hover:bg-[#d4ff5a] transition self-start">Submit</button>
                </form>
            </Container>
        </FullContainer>
    );
}