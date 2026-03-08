import dynamic from 'next/dynamic';

const FlightMapClient = dynamic(() => import('./FlightMapClient'), {
  ssr: false,
});

const FlightMap = (props) => {
  return <FlightMapClient {...props} />;
};

export default FlightMap; 