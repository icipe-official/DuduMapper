import Newmap from '@/components/shared/map';
import ClientOnly from '../components/shared/clientOnly';
import Navbar from '@/components/shared/navbar';
import OpenLayersMap from '@/components/shared/map';

function Map(): JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <main style={{ width: '100%' }}>
        <ClientOnly>{<Newmap/>}</ClientOnly>
       
      </main>
    </div>
  );
}

export default Map;
