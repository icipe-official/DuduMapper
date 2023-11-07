"use client"
import Newmap from '@/components/shared/map';
import ClientOnly from '../../components/shared/clientOnly';
import Navbar from '@/components/shared/navbar';
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

function Map(): JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <main style={{ width: '100%' }}>
        <Newmap />

      </main>
    </div>
  );
}

export default Map;
