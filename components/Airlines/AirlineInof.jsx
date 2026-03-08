import React, { useState, useMemo, useEffect, useRef } from 'react'
import FullContainer from '../common/FullContainer'
import Container from '../common/Container'
import { MagnifyingGlass, Star, Suitcase, CaretDown } from 'phosphor-react'
import Image from 'next/image'
import { RefreshCcw, RefreshCcwDot, RefreshCw } from 'lucide-react'

export default function AirlineInof() {
    const [selectedContinent, setSelectedContinent] = useState('All Continents')
    const [searchQuery, setSearchQuery] = useState('')
    const [showContinentDropdown, setShowContinentDropdown] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowContinentDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const airlines = {
        africa: {
            directConnect: [],
            travelport: [
                {
                    id: 1,
                    name: 'Air Algérie',
                    secondaryName: 'AIR ALGÉRIE',
                    logo: '/st-images/airlines-new/africa/travelport/1.svg',
                    continent: 'Africa',
                },
                {
                    id: 2,
                    name: 'Air Austral',
                    secondaryName: 'AIR AUSTRAL',
                    logo: '/st-images/airlines-new/africa/travelport/2.svg',
                    continent: 'Africa',
                },
                {
                    id: 3,
                    name: 'Air Botswana',
                    secondaryName: 'AIR BOTSWANA',
                    logo: '/st-images/airlines-new/africa/travelport/3.svg',
                    continent: 'Africa',
                },
                {
                    id: 4,
                    name: 'Air Madagascar',
                    secondaryName: 'Air Madagascar',
                    logo: '/st-images/airlines-new/africa/travelport/4.svg',
                    continent: 'Africa',
                },
                {
                    id: 5,
                    name: 'Air Mauritius',
                    secondaryName: 'AIR MAURITIUS',
                    logo: '/st-images/airlines-new/africa/travelport/5.svg',
                    continent: 'Africa',
                },
                {
                    id: 6,
                    name: 'Air Seychelles',
                    secondaryName: 'air seychelles',
                    logo: '/st-images/airlines-new/africa/travelport/6.svg',
                    continent: 'Africa',
                },
                {
                    id: 7,
                    name: 'Air Tanzania',
                    secondaryName: 'Air Tanzania',
                    tagline: 'The Wings of Kilimanjaro',
                    logo: '/st-images/airlines-new/africa/travelport/7.svg',
                    continent: 'Africa',
                },
                {
                    id: 8,
                    name: 'Airlink',
                    secondaryName: 'AIRLINK',
                    logo: '/st-images/airlines-new/africa/travelport/8.svg',
                    continent: 'Africa',
                },
                {
                    id: 9,
                    name: 'EgyptAir',
                    secondaryName: 'EGYPTAIR',
                    logo: '/st-images/airlines-new/africa/travelport/9.svg',
                    continent: 'Africa',
                },
                {
                    id: 10,
                    name: 'Ethiopian Airlines',
                    secondaryName: 'Ethiopian',
                    logo: '/st-images/airlines-new/africa/travelport/10.svg',
                    continent: 'Africa',
                },
                {
                    id: 11,
                    name: 'Kenya Airways',
                    secondaryName: 'Kenya Airways',
                    tagline: 'The Pride of Africa',
                    logo: '/st-images/airlines-new/africa/travelport/11.svg',
                    continent: 'Africa',
                },
                {
                    id: 12,
                    name: 'LAM - Mozambique Airlines',
                    secondaryName: 'LAM',
                    tagline: 'Mozambique Airlines',
                    logo: '/st-images/airlines-new/africa/travelport/12.svg',
                    continent: 'Africa',
                },
                {
                    id: 13,
                    name: 'Precision Air',
                    secondaryName: 'Precision Air',
                    tagline: 'You are why we fly',
                    logo: '/st-images/airlines-new/africa/travelport/13.svg',
                    continent: 'Africa',
                },
                {
                    id: 14,
                    name: 'Royal Air Maroc',
                    secondaryName: 'ROYAL AIR MAROC',
                    logo: '/st-images/airlines-new/africa/travelport/14.svg',
                    continent: 'Africa',
                },
                {
                    id: 15,
                    name: 'RwandAir',
                    secondaryName: 'RwandAir',
                    logo: '/st-images/airlines-new/africa/travelport/15.svg',
                    continent: 'Africa',
                },
                {
                    id: 16,
                    name: 'South African Airways',
                    secondaryName: 'SOUTH AFRICAN AIRWAYS',
                    logo: '/st-images/airlines-new/africa/travelport/16.svg',
                    continent: 'Africa',
                },
                {
                    id: 17,
                    name: 'TAAG Angola Airlines',
                    secondaryName: 'TAAG',
                    logo: '/st-images/airlines-new/africa/travelport/17.svg',
                    continent: 'Africa',
                },
                {
                    id: 18,
                    name: 'Tunisair',
                    secondaryName: 'TUNISAIR',
                    logo: '/st-images/airlines-new/africa/travelport/18.svg',
                    continent: 'Africa',
                },
                {
                    id: 19,
                    name: 'Uganda Airlines',
                    secondaryName: 'Uganda Airlines',
                    tagline: 'Fly the Crane to the Pearl of Africa',
                    logo: '/st-images/airlines-new/africa/travelport/19.svg',
                    continent: 'Africa',
                },
            ],
        },
        asia: {
            directConnect: [
                {
                    id: 1,
                    name: 'Emirates',
                    secondaryName: 'EMIRATES',
                    logo: '/st-images/airlines-new/asia/directconnect/1.svg',
                    continent: 'Asia',
                },
                {
                    id: 2,
                    name: 'Scoot',
                    secondaryName: 'SCOOT',
                    logo: '/st-images/airlines-new/asia/directconnect/2.svg',
                    continent: 'Asia',
                },
                {
                    id: 3,
                    name: 'Singapore Airlines',
                    secondaryName: 'SINGAPORE AIRLINES',
                    logo: '/st-images/airlines-new/asia/directconnect/3.svg',
                    continent: 'Asia',
                },
            ],
            travelport: [
                {
                    id: 1,
                    name: 'Air China',
                    secondaryName: 'AIR CHINA',
                    logo: '/st-images/airlines-new/asia/travelport/1.svg',
                    continent: 'Asia',
                },
                {
                    id: 2,
                    name: 'Air Macau',
                    secondaryName: 'AIR MACAU',
                    logo: '/st-images/airlines-new/asia/travelport/2.svg',
                    continent: 'Asia',
                },
                {
                    id: 3,
                    name: 'ANA (All Nippon Airways)',
                    secondaryName: 'ALL NIPPON AIRWAYS',
                    tagline: 'Inspiration of JAPAN',
                    logo: '/st-images/airlines-new/asia/travelport/3.svg',
                    continent: 'Asia',
                },
                {
                    id: 4,
                    name: 'Asiana Airlines',
                    secondaryName: 'ASIANA AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/4.svg',
                    continent: 'Asia',
                },
                {
                    id: 5,
                    name: 'Azerbaijan Airlines',
                    secondaryName: 'AZERBAIJAN AIRLINES',
                    tagline: 'Buta Airways',
                    logo: '/st-images/airlines-new/asia/travelport/5.svg',
                    continent: 'Asia',
                },
                {
                    id: 6,
                    name: 'Bangkok Airways',
                    secondaryName: 'BANGKOK AIRWAYS',
                    logo: '/st-images/airlines-new/asia/travelport/6.svg',
                    continent: 'Asia',
                },
                {
                    id: 7,
                    name: 'Biman Bangladesh Airlines',
                    secondaryName: 'BIMAN BANGLADESH AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/7.svg',
                    continent: 'Asia',
                },
                {
                    id: 8,
                    name: 'Cathay Pacific',
                    secondaryName: 'CATHAY PACIFIC',
                    logo: '/st-images/airlines-new/asia/travelport/8.svg',
                    continent: 'Asia',
                },
                {
                    id: 9,
                    name: 'China Airlines',
                    secondaryName: 'CHINA AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/9.svg',
                    continent: 'Asia',
                },
                {
                    id: 10,
                    name: 'China Eastern',
                    secondaryName: 'CHINA EASTERN',
                    tagline: '中國東方航空',
                    logo: '/st-images/airlines-new/asia/travelport/10.svg',
                    continent: 'Asia',
                },
                {
                    id: 11,
                    name: 'China Southern Airlines',
                    secondaryName: 'CHINA SOUTHERN AIRLINES',
                    tagline: '中国南方航空',
                    logo: '/st-images/airlines-new/asia/travelport/11.svg',
                    continent: 'Asia',
                },
                {
                    id: 12,
                    name: 'EL AL',
                    secondaryName: 'EL AL',
                    tagline: 'הכי בבית בעולם',
                    logo: '/st-images/airlines-new/asia/travelport/12.svg',
                    continent: 'Asia',
                },
                {
                    id: 13,
                    name: 'Etihad Airways',
                    secondaryName: 'ETIHAD AIRWAYS',
                    tagline: 'الاتحاد ETIHAD',
                    logo: '/st-images/airlines-new/asia/travelport/13.svg',
                    continent: 'Asia',
                },
                {
                    id: 14,
                    name: 'EVA Air',
                    secondaryName: 'EVA AIR',
                    logo: '/st-images/airlines-new/asia/travelport/14.svg',
                    continent: 'Asia',
                },
                {
                    id: 15,
                    name: 'FlyArystan',
                    secondaryName: 'FLYARYSTAN',
                    logo: '/st-images/airlines-new/asia/travelport/15.svg',
                    continent: 'Asia',
                },
                {
                    id: 16,
                    name: 'flydubai',
                    secondaryName: 'FLYDUBAI',
                    logo: '/st-images/airlines-new/asia/travelport/16.svg',
                    continent: 'Asia',
                },
                {
                    id: 17,
                    name: 'Garuda Indonesia',
                    secondaryName: 'GARUDA INDONESIA',
                    tagline: 'The Airline of Indonesia',
                    logo: '/st-images/airlines-new/asia/travelport/17.svg',
                    continent: 'Asia',
                },
                {
                    id: 18,
                    name: 'Hainan Airlines',
                    secondaryName: 'HAINAN AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/18.svg',
                    continent: 'Asia',
                },
                {
                    id: 19,
                    name: 'Hong Kong Airlines',
                    secondaryName: 'HONG KONG AIRLINES',
                    tagline: '香港航空',
                    logo: '/st-images/airlines-new/asia/travelport/19.svg',
                    continent: 'Asia',
                },
                {
                    id: 20,
                    name: 'Japan Airlines',
                    secondaryName: 'JAPAN AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/20.svg',
                    continent: 'Asia',
                },
                {
                    id: 21,
                    name: 'Korean Air',
                    secondaryName: 'KOREAN AIR',
                    logo: '/st-images/airlines-new/asia/travelport/21.svg',
                    continent: 'Asia',
                },
                {
                    id: 22,
                    name: 'Kuwait Airways',
                    secondaryName: 'KUWAIT AIRWAYS',
                    tagline: 'الكويتية KUWAIT',
                    logo: '/st-images/airlines-new/asia/travelport/22.svg',
                    continent: 'Asia',
                },
                {
                    id: 23,
                    name: 'Malaysia Airlines',
                    secondaryName: 'MALAYSIA AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/23.svg',
                    continent: 'Asia',
                },
                {
                    id: 24,
                    name: 'Malindo Air',
                    secondaryName: 'MALINDO AIR',
                    logo: '/st-images/airlines-new/asia/travelport/24.svg',
                    continent: 'Asia',
                },
                {
                    id: 25,
                    name: 'MIAT Mongolian Airlines',
                    secondaryName: 'MIAT MONGOLIAN AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/25.svg',
                    continent: 'Asia',
                },
                {
                    id: 26,
                    name: 'Middle East Airlines (MEA)',
                    secondaryName: 'MIDDLE EAST AIRLINES',
                    tagline: 'MEA',
                    logo: '/st-images/airlines-new/asia/travelport/26.svg',
                    continent: 'Asia',
                },
                {
                    id: 27,
                    name: 'Nepal Airlines',
                    secondaryName: 'NEPAL AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/27.svg',
                    continent: 'Asia',
                },
                {
                    id: 28,
                    name: 'Nile Air',
                    secondaryName: 'NILE AIR',
                    tagline: 'النيل للطيرنا Nile Air',
                    logo: '/st-images/airlines-new/asia/travelport/28.svg',
                    continent: 'Asia',
                },
                {
                    id: 29,
                    name: 'Oman Air',
                    secondaryName: 'OMAN AIR',
                    tagline: 'الطيران العماني',
                    logo: '/st-images/airlines-new/asia/travelport/29.svg',
                    continent: 'Asia',
                },
                {
                    id: 30,
                    name: 'Pakistan International Airlines (PIA)',
                    secondaryName: 'PAKISTAN INTERNATIONAL AIRLINES',
                    tagline: 'PIA Pakistan International',
                    logo: '/st-images/airlines-new/asia/travelport/30.svg',
                    continent: 'Asia',
                },
                {
                    id: 31,
                    name: 'Philippine Airlines',
                    secondaryName: 'PHILIPPINE AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/31.svg',
                    continent: 'Asia',
                },
                {
                    id: 32,
                    name: 'Qatar Airways',
                    secondaryName: 'QATAR AIRWAYS',
                    tagline: 'القطرية',
                    logo: '/st-images/airlines-new/asia/travelport/32.svg',
                    continent: 'Asia',
                },
                {
                    id: 33,
                    name: 'Royal Jordanian Airlines',
                    secondaryName: 'ROYAL JORDANIAN AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/33.svg',
                    continent: 'Asia',
                },
                {
                    id: 34,
                    name: 'Saudia',
                    secondaryName: 'SAUDIA',
                    logo: '/st-images/airlines-new/asia/travelport/34.svg',
                    continent: 'Asia',
                },
                {
                    id: 35,
                    name: 'Shenzhen Airlines',
                    secondaryName: 'SHENZHEN AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/35.svg',
                    continent: 'Asia',
                },
                {
                    id: 36,
                    name: 'Sichuan Airlines',
                    secondaryName: 'SICHUAN AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/36.svg',
                    continent: 'Asia',
                },
                {
                    id: 37,
                    name: 'Thai Airways (THAI)',
                    secondaryName: 'THAI AIRWAYS',
                    logo: '/st-images/airlines-new/asia/travelport/37.svg',
                    continent: 'Asia',
                },
                {
                    id: 38,
                    name: 'Vietnam Airlines',
                    secondaryName: 'VIETNAM AIRLINES',
                    logo: '/st-images/airlines-new/asia/travelport/38.svg',
                    continent: 'Asia',
                },
                {
                    id: 39,
                    name: 'XiamenAir',
                    secondaryName: 'XIAMENAIR',
                    logo: '/st-images/airlines-new/asia/travelport/39.svg',
                    continent: 'Asia',
                },
            ],
        },
        europe: {
            directConnect: [
                {
                    id: 1,
                    name: 'Aegean',
                    secondaryName: 'AEGEAN AIRLINES',
                    logo: '/st-images/airlines-new/europe/directconnect/1.svg',
                    continent: 'Europe',
                },
                {
                    id: 2,
                    name: 'Air France',
                    secondaryName: 'AIR FRANCE',
                    logo: '/st-images/airlines-new/europe/directconnect/2.svg',
                    continent: 'Europe',
                },
                {
                    id: 3,
                    name: 'Austrian',
                    secondaryName: 'AUSTRIAN AIRLINES',
                    logo: '/st-images/airlines-new/europe/directconnect/3.svg',
                    continent: 'Europe',
                },
                {
                    id: 4,
                    name: 'British Airways',
                    secondaryName: 'BRITISH AIRWAYS',
                    logo: '/st-images/airlines-new/europe/directconnect/4.svg',
                    continent: 'Europe',
                },
                {
                    id: 5,
                    name: 'Brussels Airlines',
                    secondaryName: 'BRUSSELS AIRLINES',
                    logo: '/st-images/airlines-new/europe/directconnect/5.svg',
                    continent: 'Europe',
                },
                {
                    id: 6,
                    name: 'easyJet',
                    secondaryName: 'EASYJET',
                    logo: '/st-images/airlines-new/europe/directconnect/6.svg',
                    continent: 'Europe',
                },
                {
                    id: 7,
                    name: 'Eurowings Discover',
                    secondaryName: 'EUROWINGS DISCOVER',
                    logo: '/st-images/airlines-new/europe/directconnect/7.svg',
                    continent: 'Europe',
                },
                {
                    id: 8,
                    name: 'Iberia',
                    secondaryName: 'IBERIA',
                    logo: '/st-images/airlines-new/europe/directconnect/8.svg',
                    continent: 'Europe',
                },
                {
                    id: 9,
                    name: 'Iberia Express',
                    secondaryName: 'IBERIA EXPRESS',
                    logo: '/st-images/airlines-new/europe/directconnect/9.svg',
                    continent: 'Europe',
                },
                {
                    id: 10,
                    name: 'KLM',
                    secondaryName: 'KLM',
                    tagline: 'Royal Dutch Airlines',
                    logo: '/st-images/airlines-new/europe/directconnect/10.svg',
                    continent: 'Europe',
                },
                {
                    id: 11,
                    name: 'LEVEL',
                    secondaryName: 'LEVEL',
                    logo: '/st-images/airlines-new/europe/directconnect/11.svg',
                    continent: 'Europe',
                },
                {
                    id: 12,
                    name: 'Lufthansa',
                    secondaryName: 'LUFTHANSA',
                    logo: '/st-images/airlines-new/europe/directconnect/12.svg',
                    continent: 'Europe',
                },
                {
                    id: 13,
                    name: 'Olympic Air',
                    secondaryName: 'OLYMPIC AIR',
                    logo: '/st-images/airlines-new/europe/directconnect/13.svg',
                    continent: 'Europe',
                },
                {
                    id: 14,
                    name: 'SAS Scandinavian Airlines',
                    secondaryName: 'SCANDINAVIAN AIRLINES',
                    logo: '/st-images/airlines-new/europe/directconnect/14.svg',
                    continent: 'Europe',
                },
                {
                    id: 15,
                    name: 'SWISS',
                    secondaryName: 'SWISS',
                    logo: '/st-images/airlines-new/europe/directconnect/15.svg',
                    continent: 'Europe',
                },
                {
                    id: 16,
                    name: 'Transavia',
                    secondaryName: 'TRANSAVIA',
                    logo: '/st-images/airlines-new/europe/directconnect/16.svg',
                    continent: 'Europe',
                },
                {
                    id: 17,
                    name: 'Vueling',
                    secondaryName: 'VUELING AIRLINES',
                    logo: '/st-images/airlines-new/europe/directconnect/17.svg',
                    continent: 'Europe',
                },
            ],
            travelport: [
                {
                    id: 1,
                    name: 'Aer Lingus',
                    secondaryName: 'AER LINGUS',
                    logo: '/st-images/airlines-new/europe/travelport/1.svg',
                    continent: 'Europe',
                },
                {
                    id: 2,
                    name: 'Air Europa',
                    secondaryName: 'AIR EUROPA',
                    logo: '/st-images/airlines-new/europe/travelport/2.svg',
                    continent: 'Europe',
                },
                {
                    id: 3,
                    name: 'Air Malta',
                    secondaryName: 'AIR MALTA',
                    tagline: 'KM MALTA AIRLINES',
                    logo: '/st-images/airlines-new/europe/travelport/3.svg',
                    continent: 'Europe',
                },
                {
                    id: 4,
                    name: 'Air Serbia',
                    secondaryName: 'AIR SERBIA',
                    logo: '/st-images/airlines-new/europe/travelport/4.svg',
                    continent: 'Europe',
                },
                {
                    id: 5,
                    name: 'airBaltic',
                    secondaryName: 'AIRBALTIC',
                    logo: '/st-images/airlines-new/europe/travelport/5.svg',
                    continent: 'Europe',
                },
                {
                    id: 6,
                    name: 'APG Airlines',
                    secondaryName: 'APG AIRLINES',
                    logo: '/st-images/airlines-new/europe/travelport/6.svg',
                    continent: 'Europe',
                },
                {
                    id: 7,
                    name: 'Atlantic Airways',
                    secondaryName: 'ATLANTIC AIRWAYS',
                    logo: '/st-images/airlines-new/europe/travelport/7.svg',
                    continent: 'Europe',
                },
                {
                    id: 8,
                    name: 'Azores Airlines',
                    secondaryName: 'AZORES AIRLINES',
                    tagline: 'SATA',
                    logo: '/st-images/airlines-new/europe/travelport/8.svg',
                    continent: 'Europe',
                },
                {
                    id: 9,
                    name: 'Bulgaria Air',
                    secondaryName: 'BULGARIA AIR',
                    logo: '/st-images/airlines-new/europe/travelport/9.svg',
                    continent: 'Europe',
                },
                {
                    id: 10,
                    name: 'Condor',
                    secondaryName: 'CONDOR',
                    logo: '/st-images/airlines-new/europe/travelport/10.svg',
                    continent: 'Europe',
                },
                {
                    id: 11,
                    name: 'Corsair',
                    secondaryName: 'CORSAIR',
                    logo: '/st-images/airlines-new/europe/travelport/11.svg',
                    continent: 'Europe',
                },
                {
                    id: 12,
                    name: 'Croatia Airlines',
                    secondaryName: 'CROATIA AIRLINES',
                    logo: '/st-images/airlines-new/europe/travelport/12.svg',
                    continent: 'Europe',
                },
                {
                    id: 13,
                    name: 'Czech Airlines',
                    secondaryName: 'CZECH AIRLINES',
                    tagline: 'CSA',
                    logo: '/st-images/airlines-new/europe/travelport/13.svg',
                    continent: 'Europe',
                },
                {
                    id: 14,
                    name: 'Eurowings',
                    secondaryName: 'EUROWINGS',
                    logo: '/st-images/airlines-new/europe/travelport/14.svg',
                    continent: 'Europe',
                },
                {
                    id: 15,
                    name: 'Finnair',
                    secondaryName: 'FINNAIR',
                    logo: '/st-images/airlines-new/europe/travelport/15.svg',
                    continent: 'Europe',
                },
                {
                    id: 16,
                    name: 'Icelandair',
                    secondaryName: 'ICELANDAIR',
                    logo: '/st-images/airlines-new/europe/travelport/16.svg',
                    continent: 'Europe',
                },
                {
                    id: 17,
                    name: 'LOT Polish Airlines',
                    secondaryName: 'LOT POLISH AIRLINES',
                    logo: '/st-images/airlines-new/europe/travelport/17.svg',
                    continent: 'Europe',
                },
                {
                    id: 18,
                    name: 'Luxair',
                    secondaryName: 'LUXAIR',
                    logo: '/st-images/airlines-new/europe/travelport/18.svg',
                    continent: 'Europe',
                },
                {
                    id: 19,
                    name: 'Norwegian',
                    secondaryName: 'NORWEGIAN',
                    logo: '/st-images/airlines-new/europe/travelport/19.svg',
                    continent: 'Europe',
                },
                {
                    id: 20,
                    name: 'Pegasus',
                    secondaryName: 'PEGASUS',
                    logo: '/st-images/airlines-new/europe/travelport/20.svg',
                    continent: 'Europe',
                },
                {
                    id: 21,
                    name: 'Sky Express',
                    secondaryName: 'SKY EXPRESS',
                    logo: '/st-images/airlines-new/europe/travelport/21.svg',
                    continent: 'Europe',
                },
                {
                    id: 22,
                    name: 'SunExpress',
                    secondaryName: 'SUNEXPRESS',
                    logo: '/st-images/airlines-new/europe/travelport/22.svg',
                    continent: 'Europe',
                },
                {
                    id: 23,
                    name: 'TAP Air Portugal',
                    secondaryName: 'TAP AIR PORTUGAL',
                    logo: '/st-images/airlines-new/europe/travelport/23.svg',
                    continent: 'Europe',
                },
                {
                    id: 24,
                    name: 'TAROM',
                    secondaryName: 'TAROM',
                    logo: '/st-images/airlines-new/europe/travelport/24.svg',
                    continent: 'Europe',
                },
                {
                    id: 25,
                    name: 'Turkish Airlines',
                    secondaryName: 'TURKISH AIRLINES',
                    logo: '/st-images/airlines-new/europe/travelport/25.svg',
                    continent: 'Europe',
                },
                {
                    id: 26,
                    name: 'Ukraine International Airlines',
                    secondaryName: 'UKRAINE INTERNATIONAL AIRLINES',
                    tagline: 'FlyUIA',
                    logo: '/st-images/airlines-new/europe/travelport/26.svg',
                    continent: 'Europe',
                },
                {
                    id: 27,
                    name: 'Ural Airlines',
                    secondaryName: 'URAL AIRLINES',
                    logo: '/st-images/airlines-new/europe/travelport/27.svg',
                    continent: 'Europe',
                },
                {
                    id: 28,
                    name: 'Virgin Atlantic',
                    secondaryName: 'VIRGIN ATLANTIC',
                    logo: '/st-images/airlines-new/europe/travelport/28.svg',
                    continent: 'Europe',
                },
                {
                    id: 29,
                    name: 'Volotea',
                    secondaryName: 'VOLOTEA',
                    logo: '/st-images/airlines-new/europe/travelport/29.svg',
                    continent: 'Europe',
                },
            ],
        },
        northAmerica: {
            directConnect: [
                {
                    id: 1,
                    name: 'Air Canada',
                    secondaryName: 'AIR CANADA',
                    logo: '/st-images/airlines-new/northamerica/directconnect/1.svg',
                    continent: 'North America',
                },
                {
                    id: 2,
                    name: 'American Airlines',
                    secondaryName: 'AMERICAN AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/directconnect/2.svg',
                    continent: 'North America',
                },
                {
                    id: 3,
                    name: 'Hawaiian Airlines',
                    secondaryName: 'HAWAIIAN AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/directconnect/3.svg',
                    continent: 'North America',
                },
                {
                    id: 4,
                    name: 'Spirit',
                    secondaryName: 'SPIRIT',
                    logo: '/st-images/airlines-new/northamerica/directconnect/4.svg',
                    continent: 'North America',
                },
                {
                    id: 5,
                    name: 'United Airlines',
                    secondaryName: 'UNITED AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/directconnect/5.svg',
                    continent: 'North America',
                },
                {
                    id: 6,
                    name: 'Volaris',
                    secondaryName: 'VOLARIS',
                    logo: '/st-images/airlines-new/northamerica/directconnect/6.svg',
                    continent: 'North America',
                },
            ],
            travelport: [
                {
                    id: 1,
                    name: 'Aeromar',
                    secondaryName: 'AEROMAR',
                    logo: '/st-images/airlines-new/northamerica/travelport/1.svg',
                    continent: 'North America',
                },
                {
                    id: 2,
                    name: 'Air Canada',
                    secondaryName: 'AIR CANADA',
                    logo: '/st-images/airlines-new/northamerica/travelport/2.svg',
                    continent: 'North America',
                },
                {
                    id: 3,
                    name: 'Air Transat',
                    secondaryName: 'AIR TRANSAT',
                    logo: '/st-images/airlines-new/northamerica/travelport/3.svg',
                    continent: 'North America',
                },
                {
                    id: 4,
                    name: 'Alaska Airlines',
                    secondaryName: 'ALASKA AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/travelport/4.svg',
                    continent: 'North America',
                },
                {
                    id: 5,
                    name: 'Bahamasair',
                    secondaryName: 'BAHAMASAIR',
                    logo: '/st-images/airlines-new/northamerica/travelport/5.svg',
                    continent: 'North America',
                },
                {
                    id: 6,
                    name: 'Caribbean Airlines',
                    secondaryName: 'CARIBBEAN AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/travelport/6.svg',
                    continent: 'North America',
                },
                {
                    id: 7,
                    name: 'Cayman Airways',
                    secondaryName: 'CAYMAN AIRWAYS',
                    logo: '/st-images/airlines-new/northamerica/travelport/7.svg',
                    continent: 'North America',
                },
                {
                    id: 8,
                    name: 'Contour Airlines',
                    secondaryName: 'CONTOUR AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/travelport/8.svg',
                    continent: 'North America',
                },
                {
                    id: 9,
                    name: 'Frontier Airlines',
                    secondaryName: 'FRONTIER AIRLINES',
                    tagline: 'LOW FARES DONE RIGHT',
                    logo: '/st-images/airlines-new/northamerica/travelport/9.svg',
                    continent: 'North America',
                },
                {
                    id: 10,
                    name: 'JetBlue',
                    secondaryName: 'JETBLUE',
                    logo: '/st-images/airlines-new/northamerica/travelport/10.svg',
                    continent: 'North America',
                },
                {
                    id: 11,
                    name: 'Porter Airlines',
                    secondaryName: 'PORTER AIRLINES',
                    logo: '/st-images/airlines-new/northamerica/travelport/11.svg',
                    continent: 'North America',
                },
                {
                    id: 12,
                    name: 'WestJet',
                    secondaryName: 'WESTJET',
                    logo: '/st-images/airlines-new/northamerica/travelport/12.svg',
                    continent: 'North America',
                },
                {
                    id: 13,
                    name: 'WINAIR',
                    secondaryName: 'WINAIR',
                    logo: '/st-images/airlines-new/northamerica/travelport/13.svg',
                    continent: 'North America',
                },
            ],
        },
        oceania: {
            directConnect: [
                {
                    id: 1,
                    name: 'Jetstar',
                    secondaryName: 'JETSTAR',
                    logo: '/st-images/airlines-new/oceania/directconnect/1.svg',
                    continent: 'Oceania',
                },
                {
                    id: 2,
                    name: 'Qantas',
                    secondaryName: 'QANTAS',
                    logo: '/st-images/airlines-new/oceania/directconnect/2.svg',
                    continent: 'Oceania',
                },
            ],
            travelport: [
                {
                    id: 1,
                    name: 'Air New Zealand',
                    secondaryName: 'AIR NEW ZEALAND',
                    logo: '/st-images/airlines-new/oceania/travelport/1.svg',
                    continent: 'Oceania',
                },
                {
                    id: 2,
                    name: 'Air Niugini',
                    secondaryName: 'AIR NIUGINI',
                    logo: '/st-images/airlines-new/oceania/travelport/2.svg',
                    continent: 'Oceania',
                },
                {
                    id: 3,
                    name: 'Air Tahiti Nui',
                    secondaryName: 'AIR TAHITI NUI',
                    logo: '/st-images/airlines-new/oceania/travelport/3.svg',
                    continent: 'Oceania',
                },
                {
                    id: 4,
                    name: 'Air Vanuatu',
                    secondaryName: 'AIR VANUATU',
                    logo: '/st-images/airlines-new/oceania/travelport/4.svg',
                    continent: 'Oceania',
                },
                {
                    id: 5,
                    name: 'Fiji Airways',
                    secondaryName: 'FIJI AIRWAYS',
                    logo: '/st-images/airlines-new/oceania/travelport/5.svg',
                    continent: 'Oceania',
                },
                {
                    id: 6,
                    name: 'Solomon Airlines',
                    secondaryName: 'SOLOMON AIRLINES',
                    logo: '/st-images/airlines-new/oceania/travelport/6.svg',
                    continent: 'Oceania',
                },
                {
                    id: 7,
                    name: 'Virgin Australia',
                    secondaryName: 'VIRGIN AUSTRALIA',
                    logo: '/st-images/airlines-new/oceania/travelport/7.svg',
                    continent: 'Oceania',
                },
            ],
        },
        southAmerica: {
            directConnect: [
                {
                    id: 1,
                    name: 'Avianca Airlines',
                    secondaryName: 'AVIANCA',
                    logo: '/st-images/airlines-new/southamerica/directconnect/1.svg',
                    continent: 'South America',
                },
                {
                    id: 2,
                    name: 'Copa Airlines',
                    secondaryName: 'COPA AIRLINES',
                    logo: '/st-images/airlines-new/southamerica/directconnect/2.svg',
                    continent: 'South America',
                },
                {
                    id: 3,
                    name: 'LATAM',
                    secondaryName: 'LATAM',
                    logo: '/st-images/airlines-new/southamerica/directconnect/3.svg',
                    continent: 'South America',
                },
            ],
            travelport: [
                {
                    id: 1,
                    name: 'Aerolíneas Argentinas',
                    secondaryName: 'AEROLÍNEAS ARGENTINAS',
                    logo: '/st-images/airlines-new/southamerica/travelport/1.svg',
                    continent: 'South America',
                },
                {
                    id: 2,
                    name: 'Azul',
                    secondaryName: 'AZUL',
                    logo: '/st-images/airlines-new/southamerica/travelport/2.svg',
                    continent: 'South America',
                },
                {
                    id: 3,
                    name: 'BoA Regional',
                    secondaryName: 'BOA REGIONAL',
                    tagline: 'Boliviana de Aviación',
                    logo: '/st-images/airlines-new/southamerica/travelport/3.svg',
                    continent: 'South America',
                },
                {
                    id: 4,
                    name: 'GOL Intelligent Airlines',
                    secondaryName: 'GOL INTELLIGENT AIRLINES',
                    tagline: 'Linhas Aéreas Inteligentes',
                    logo: '/st-images/airlines-new/southamerica/travelport/4.svg',
                    continent: 'South America',
                },
                {
                    id: 5,
                    name: 'Surinam Airways',
                    secondaryName: 'SURINAM AIRWAYS',
                    logo: '/st-images/airlines-new/southamerica/travelport/5.svg',
                    continent: 'South America',
                },
            ],
        }
    }


    // Get all continents for the dropdown
    const continents = ['All Continents', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania']

    // Filter airlines based on selected continent and search query
    const filteredDirectConnect = useMemo(() => {
        let filtered = Object.values(airlines).flatMap(continent => continent.directConnect)

        if (selectedContinent !== 'All Continents') {
            filtered = filtered.filter(airline => airline.continent === selectedContinent)
        }

        if (searchQuery) {
            filtered = filtered.filter(airline =>
                airline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                airline.secondaryName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [airlines, selectedContinent, searchQuery])

    const filteredTravelport = useMemo(() => {
        let filtered = Object.values(airlines).flatMap(continent => continent.travelport)

        if (selectedContinent !== 'All Continents') {
            filtered = filtered.filter(airline => airline.continent === selectedContinent)
        }

        if (searchQuery) {
            filtered = filtered.filter(airline =>
                airline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                airline.secondaryName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [airlines, selectedContinent, searchQuery])

    return (
        <FullContainer className="bg-primary-bg min-h-screen">
            <Container className="py-8">
                <div className='flex flex-col gap-6'>
                    {/* Header */}
                    <div className='flex flex-col gap-10 lg:h-[530px] justify-center items-center mb-10 lg:mb-24'>
                        <div className='text-center flex flex-col gap-8'>
                            <h5 className='text-base text-primary-text lg:text-xl uppercase'>Content</h5>
                            <h2 className='text-4xl lg:text-[54px] decoration-2 text-[#22325a] font-regista-regular'>Our Airlines</h2>
                        </div>

                        {/* Filters */}
                        <div className='flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-center'>
                            {/* Continent Dropdown */}
                            <div className='relative' ref={dropdownRef}>
                                <button
                                    onClick={() => setShowContinentDropdown(!showContinentDropdown)}
                                    className='flex items-center gap-2 justify-between bg-white px-4 py-4 rounded-lg border border-gray-300 min-w-[200px] lg:min-w-[300px] xl:min-w-[350px]'
                                >
                                    <span className='text-base lg:text-lg font-medium text-primary-text'>{selectedContinent}</span>
                                    <CaretDown size={16} className='text-gray-500' />
                                </button>

                                {showContinentDropdown && (
                                    <div className='absolute top-full left-0 bg-white border border-gray-300 rounded-lg overflow-hidden overflow-y-auto shadow-lg z-10 min-w-[200px] lg:min-w-[300px] xl:min-w-[350px]'>
                                        {continents.map((continent) => (
                                            <button
                                                key={continent}
                                                onClick={() => {
                                                    setSelectedContinent(continent)
                                                    setShowContinentDropdown(false)
                                                }}
                                                className={`w-full text-left px-4 py-1 text-sm lg:text-base font-medium text-primary-text hover:bg-gray-100 ${selectedContinent === continent ? 'bg-secondary-green' : ''
                                                    }`}
                                            >
                                                {continent}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Search Bar */}
                            <div className='relative flex-1 min-w-[200px] lg:min-w-[300px] xl:min-w-[350px]'>
                                <MagnifyingGlass size={20} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text' />
                                <input
                                    type='text'
                                    placeholder='Search'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full pl-10 pr-4 py-4  rounded-lg border border-gray-300 text-base placeholder:text-primary-text lg:text-lg font-medium text-primary-text focus:outline-none focus:ring-2 focus:ring-primary-green'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Direct Connect Section */}
                    <div className='flex items-center gap-3'>
                        <h2 className='text-xl md:text-[32px] font-semibold text-primary-text'>Direct Connect</h2>
                        <div className='bg-white text-primary-text px-3 py-1 rounded text-sm lg:text-lg'>
                            {filteredDirectConnect.length}
                        </div>
                    </div>

                    {/* Airline Cards Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-4.5'>
                        {filteredDirectConnect.map((airline) => (
                            <AirlineCard key={`${airline.continent}-${airline.id}`} airline={airline} />
                        ))}
                    </div>

                    <div className='flex items-center gap-2'>
                        <h2 className='text-xl md:text-[32px] font-semibold text-primary-text'>Travelport</h2>
                        <div className='bg-white text-primary-text px-3 py-1 rounded text-sm lg:text-lg'>
                            {filteredTravelport.length}
                        </div>
                    </div>

                    {/* Airline Cards Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-4.5'>
                        {filteredTravelport.map((airline) => (
                            <AirlineCard key={`${airline.continent}-${airline.id}`} airline={airline} />
                        ))}
                    </div>
                </div>
            </Container>
        </FullContainer>
    )
}

const AirlineCard = ({ airline }) => {
    return (
        <div className='bg-white rounded-xl px-10 py-8 border border-gray-300'>
            {/* Airline Logo */}
            <div className='flex justify-center mb-3  max-w-[200px]'>
                <Image
                    src={airline.logo}
                    alt={airline.name}
                    width={500}
                    height={500}
                    className='h-full max-h-[30px] min-h-[30px] w-auto object-contain'
                    onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                    }}
                />
            </div>

            {/* Airline Name */}
            <div className='text-center mb-3'>
                <p className='text-black font-semibold text-lg lg:text-xl font-noyhgeometric'>{airline.secondaryName}</p>
            </div>

            {/* Action Icons */}
            <div className='flex justify-center gap-2  pt-1'>
                <button className=' text-gray-400'>
                    <MagnifyingGlass size={16} className='h-5.5 w-5.5' />
                </button>
                <button className=' text-gray-400'>
                    <RefreshCcw size={16} className='h-5.5 w-5.5' />
                </button>
                <button className=' text-gray-400'>
                    <Star size={16} className='h-5.5 w-5.5' />
                </button>
                <button className=' text-gray-400'>
                    <Suitcase size={16} className='h-5.5 w-5.5' />
                </button>
            </div>
        </div>
    )
}