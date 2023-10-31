"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { overlays } from '@/requests/requests';
import NavBar from '../components/shared/navbar';


export default function Home() {
  return (
    <div>
      <NavBar />

      <div>
        <h1 onClick={async () => console.log(await overlays)}>
          Console log layers
        </h1>
      </div>
    </div>
  )
}
