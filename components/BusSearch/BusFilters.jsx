import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const BusFilters = ({ filters, setFilters }) => {
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            stops: [],
            price: [0, 1000],
            departure: [0, 24],
            arrival: [0, 24],
            departureStations: [],
            arrivalStations: [],
            duration: [0, 12],
            companies: []
        });
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary-text">Filter</h3>
                <button 
                    onClick={resetFilters}
                    className="text-sm text-primary-green hover:text-green-600"
                >
                    Reset All
                </button>
            </div>

            {/* Stops */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Stops</h4>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.stops.includes('any')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('stops', [...filters.stops, 'any']);
                                } else {
                                    handleFilterChange('stops', filters.stops.filter(s => s !== 'any'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Any</span>
                        <span className="text-xs text-gray-500">€55 • 2h 42m</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.stops.includes('direct')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('stops', [...filters.stops, 'direct']);
                                } else {
                                    handleFilterChange('stops', filters.stops.filter(s => s !== 'direct'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Direct</span>
                        <span className="text-xs text-gray-500">€55 • 2h 42m</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.stops.includes('1-transfer')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('stops', [...filters.stops, '1-transfer']);
                                } else {
                                    handleFilterChange('stops', filters.stops.filter(s => s !== '1-transfer'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Max. 1 transfer</span>
                        <span className="text-xs text-gray-500">€55 • 2h 42m</span>
                    </label>
                </div>
            </div>

            {/* Price */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Price</h4>
                <div className="px-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={filters.price[1]}
                        onChange={(e) => handleFilterChange('price', [filters.price[0], parseInt(e.target.value)])}
                        className="w-full" 
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€ {filters.price[0]}</span>
                        <span>€ {filters.price[1]}</span>
                    </div>
                </div>
            </div>

            {/* Departure */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Departure</h4>
                <div className="px-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        value={filters.departure[1]}
                        onChange={(e) => handleFilterChange('departure', [filters.departure[0], parseInt(e.target.value)])}
                        className="w-full" 
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{filters.departure[0]}:00</span>
                        <span>{filters.departure[1]}:00</span>
                    </div>
                </div>
            </div>

            {/* Arrival */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Arrival</h4>
                <div className="px-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        value={filters.arrival[1]}
                        onChange={(e) => handleFilterChange('arrival', [filters.arrival[0], parseInt(e.target.value)])}
                        className="w-full" 
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{filters.arrival[0]}:00</span>
                        <span>{filters.arrival[1]}:00</span>
                    </div>
                </div>
            </div>

            {/* Departure stations */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Departure Stations</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.departureStations.includes('porto-campanha')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('departureStations', [...filters.departureStations, 'porto-campanha']);
                                } else {
                                    handleFilterChange('departureStations', filters.departureStations.filter(s => s !== 'porto-campanha'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Porto, Terminal Intermodal de Campanhã</span>
                        <span className="text-xs text-gray-500">€14</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.departureStations.includes('porto-airport')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('departureStations', [...filters.departureStations, 'porto-airport']);
                                } else {
                                    handleFilterChange('departureStations', filters.departureStations.filter(s => s !== 'porto-airport'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Porto, Aeroporto Francisco Sá Carneiro</span>
                        <span className="text-xs text-gray-500">€14</span>
                    </label>
                </div>
            </div>

            {/* Arrival Stations */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Arrival Stations</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.arrivalStations.includes('lisboa-oriente')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('arrivalStations', [...filters.arrivalStations, 'lisboa-oriente']);
                                } else {
                                    handleFilterChange('arrivalStations', filters.arrivalStations.filter(s => s !== 'lisboa-oriente'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Lisboa, Oriente</span>
                        <span className="text-xs text-gray-500">€14</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.arrivalStations.includes('lisboa-airport')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('arrivalStations', [...filters.arrivalStations, 'lisboa-airport']);
                                } else {
                                    handleFilterChange('arrivalStations', filters.arrivalStations.filter(s => s !== 'lisboa-airport'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Lisboa, Aeroporto Humberto Delgado</span>
                        <span className="text-xs text-gray-500">€14</span>
                    </label>
                </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Duration</h4>
                <div className="px-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="12" 
                        value={filters.duration[1]}
                        onChange={(e) => handleFilterChange('duration', [filters.duration[0], parseInt(e.target.value)])}
                        className="w-full" 
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{filters.duration[0]}h</span>
                        <span>{filters.duration[1]}h</span>
                    </div>
                </div>
            </div>

            {/* Bus Companies */}
            <div className="mb-6">
                <h4 className="font-medium text-primary-text mb-3">Bus Companies</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.companies.includes('alfa')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('companies', [...filters.companies, 'alfa']);
                                } else {
                                    handleFilterChange('companies', filters.companies.filter(c => c !== 'alfa'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Alfa</span>
                        <span className="text-xs text-gray-500">€55</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.companies.includes('rede-expressos')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('companies', [...filters.companies, 'rede-expressos']);
                                } else {
                                    handleFilterChange('companies', filters.companies.filter(c => c !== 'rede-expressos'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Rede Expressos</span>
                        <span className="text-xs text-gray-500">€55</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded"
                            checked={filters.companies.includes('citi-express')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleFilterChange('companies', [...filters.companies, 'citi-express']);
                                } else {
                                    handleFilterChange('companies', filters.companies.filter(c => c !== 'citi-express'));
                                }
                            }}
                        />
                        <span className="text-sm text-primary-text">Citi Express</span>
                        <span className="text-xs text-gray-500">€55</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default BusFilters; 