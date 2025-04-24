import Navbar from "@/components/shared/navbar";
import Newmap from "../components/map/Map";

export default function Home() {
  return (
    <div
      style={{ overflow: "hidden", height: "100%", width: "100%", margin: 0 }}
    >
      <Navbar />
      <div style={{ marginTop: "50px" }}>
        <Newmap />
      </div>
    </div>
  );
}

// import Newmap from "../components/map/Map";

// export default function Home() {
//   return (
//     <div
//       style={{ overflow: "hidden", height: "100%", width: "100%", margin: 0 }}
//     >
//       {/*<NavBar/>*/}
//       <div style={{ marginTop: "50px" }}>
//         <Newmap />
//       </div>
//     </div>
//   );
// }
