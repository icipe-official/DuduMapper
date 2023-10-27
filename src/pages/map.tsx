import ClientOnly from '../components/shared/clientOnly';
// import { MapWrapperV3 } from '../components/map/mapView/map-v3';

function Map(): JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <main style={{ width: '100%' }}>
        <ClientOnly>{{/* <MapWrapperV3 /> */ }}</ClientOnly>
      </main>
    </div>
  );
}

export default Map;
